"""
QR Code Service for Pickup Verification

Generates unique QR codes after pickup approval and validates them
during the physical pickup process to prevent fraud/replay attacks.
"""
import qrcode
import uuid
import os
import io
import base64
from datetime import datetime
from extensions import db
from models import PickupRequest, Donation, Certificate, Notification
from extensions import socketio


# In-memory store for active QR tokens (in production, use Redis or DB)
# Maps token -> {pickup_request_id, created_at, used}
active_qr_tokens = {}


def generate_qr_token(pickup_request_id):
    """
    Generate a unique QR code token for a pickup request.
    Returns the token string and QR code image as base64.
    """
    token = str(uuid.uuid4())
    
    active_qr_tokens[token] = {
        'pickup_request_id': pickup_request_id,
        'created_at': datetime.utcnow().isoformat(),
        'used': False
    }
    
    # Generate QR code image
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(token)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    qr_base64 = base64.b64encode(buffer.read()).decode('utf-8')
    
    return {
        'token': token,
        'qr_image': f'data:image/png;base64,{qr_base64}',
        'pickup_request_id': pickup_request_id
    }


def verify_qr_token(token):
    """
    Verify a scanned QR token.
    Returns success/failure and processes the pickup completion if valid.
    """
    if token not in active_qr_tokens:
        return {'valid': False, 'message': 'Invalid QR code token'}
    
    token_data = active_qr_tokens[token]
    
    if token_data['used']:
        return {'valid': False, 'message': 'This QR code has already been used'}
    
    # Mark token as used (prevent replay)
    active_qr_tokens[token]['used'] = True
    
    pickup_request_id = token_data['pickup_request_id']
    pickup_request = PickupRequest.query.get(pickup_request_id)
    
    if not pickup_request:
        return {'valid': False, 'message': 'Pickup request not found'}
    
    if pickup_request.status != 'Approved':
        return {'valid': False, 'message': 'Pickup request is not in approved state'}
    
    # Mark as completed
    pickup_request.status = 'Completed'
    pickup_request.completed_at = datetime.utcnow()
    
    donation = Donation.query.get(pickup_request.donation_id)
    donation.status = 'Completed'
    
    # Generate certificate
    cert = Certificate(
        donation_id=donation.id,
        donor_id=donation.donor_id,
        receiver_id=pickup_request.receiver_id,
        certificate_url=f'/certificates/{donation.id}_{pickup_request.receiver_id}.pdf'
    )
    db.session.add(cert)
    
    # Create notifications
    donor_notif = Notification(
        user_id=donation.donor_id,
        title='Pickup Completed',
        message=f'Pickup for {donation.food_name} has been verified and completed.',
        type='pickup_completed'
    )
    receiver_notif = Notification(
        user_id=pickup_request.receiver_id,
        title='Pickup Completed',
        message=f'Your pickup of {donation.food_name} is complete. Certificate generated!',
        type='pickup_completed'
    )
    cert_notif = Notification(
        user_id=donation.donor_id,
        title='Certificate Generated',
        message=f'A donation certificate has been generated for {donation.food_name}.',
        type='certificate_generated'
    )
    
    db.session.add(donor_notif)
    db.session.add(receiver_notif)
    db.session.add(cert_notif)
    db.session.commit()
    
    # Emit real-time events
    socketio.emit('pickup_status_changed', {
        'pickup_request': pickup_request.to_dict(),
        'donation': donation.to_dict()
    })
    socketio.emit('notification', donor_notif.to_dict(), room=f'user_{donation.donor_id}')
    socketio.emit('notification', receiver_notif.to_dict(), room=f'user_{pickup_request.receiver_id}')
    socketio.emit('notification', cert_notif.to_dict(), room=f'user_{donation.donor_id}')
    
    # Remove token from active store
    del active_qr_tokens[token]
    
    return {
        'valid': True,
        'message': 'Pickup verified and completed successfully',
        'pickup_request': pickup_request.to_dict(),
        'donation': donation.to_dict(),
        'certificate': cert.to_dict()
    }
