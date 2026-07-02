"""
Pickup request routes: create, list, approve/reject/complete.
"""
import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db, socketio
from models import User, Donation, PickupRequest, Notification, Certificate
from services.qr_service import generate_qr_token

pickups_bp = Blueprint('pickups', __name__)


def _safe_emit(event, payload, **kwargs):
    """Emit Socket.IO events without failing the HTTP request if realtime is unavailable."""
    try:
        socketio.emit(event, payload, **kwargs)
    except Exception as exc:
        current_app.logger.warning("Socket.IO emit failed for %s: %s", event, exc)


def _create_notification(user_id, title, message, notif_type, link=None):
    """Helper: persist notification and emit via socket."""
    n = Notification(
        user_id=user_id, title=title,
        message=message, type=notif_type, link=link
    )
    db.session.add(n)
    db.session.flush()
    _safe_emit('notification', n.to_dict(), room=f'user_{user_id}')
    return n


# ─── List pickup requests ─────────────────────────────────────────────────────

@pickups_bp.route('/', methods=['GET'])
@jwt_required()
def get_pickup_requests():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if user.role == 'receiver':
        requests_q = PickupRequest.query.filter_by(receiver_id=user_id)
    elif user.role == 'donor':
        donation_ids = [d.id for d in Donation.query.filter_by(donor_id=user_id).all()]
        if not donation_ids:
            return jsonify([]), 200
        requests_q = PickupRequest.query.filter(PickupRequest.donation_id.in_(donation_ids))
    else:
        # admin
        requests_q = PickupRequest.query

    results = []
    for pr in requests_q.order_by(PickupRequest.requested_at.desc()).all():
        pr_dict = pr.to_dict()
        pr_dict['donation'] = pr.donation.to_dict() if pr.donation else None
        results.append(pr_dict)

    return jsonify(results), 200


# ─── Create pickup request ────────────────────────────────────────────────────

@pickups_bp.route('/', methods=['POST'])
@jwt_required()
def create_pickup_request():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if user.role not in ('receiver', 'admin', 'super_admin'):
        return jsonify({'message': 'Only receivers can request pickups'}), 403

    data = request.get_json(force=True) or {}
    donation_id = data.get('donation_id')

    if not donation_id:
        return jsonify({'message': 'donation_id is required'}), 400

    donation = Donation.query.get_or_404(donation_id)

    if donation.status != 'Available':
        return jsonify({'message': 'This donation is no longer available'}), 409

    existing = PickupRequest.query.filter_by(
        donation_id=donation_id, receiver_id=user_id
    ).first()
    if existing:
        return jsonify({'message': 'You have already requested this donation'}), 409

    pr = PickupRequest(
        donation_id=donation_id,
        receiver_id=user_id,
        status='Pending'
    )
    donation.status = 'Requested'
    db.session.add(pr)
    db.session.flush()

    _create_notification(
        donation.donor_id,
        'New Pickup Request',
        f'{user.organization or user.name} wants to pick up {donation.food_name}.',
        'pickup_requested',
        '/donor/pickups'
    )

    _safe_emit('pickup_requested', {
        'pickup_request': pr.to_dict(),
        'donation': donation.to_dict(),
    }, room=f'user_{donation.donor_id}')

    db.session.commit()
    return jsonify({'message': 'Pickup request created', 'pickup_request': pr.to_dict()}), 201


# ─── Update pickup request (approve / reject / complete) ─────────────────────

@pickups_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_pickup_request(id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    data = request.get_json(force=True) or {}
    new_status = data.get('status')

    valid_statuses = ('Approved', 'Rejected', 'Completed')
    if new_status not in valid_statuses:
        return jsonify({'message': f'status must be one of: {valid_statuses}'}), 400

    pr = PickupRequest.query.get_or_404(id)
    donation = Donation.query.get(pr.donation_id)

    # Authorization
    if new_status in ('Approved', 'Rejected'):
        # Only the donor who owns the donation (or admin) can approve/reject
        if str(donation.donor_id) != str(user_id) and user.role not in ('admin', 'super_admin'):
            return jsonify({'message': 'Unauthorized'}), 403
    elif new_status == 'Completed':
        # Either the receiver or donor can mark completed
        if str(pr.receiver_id) != str(user_id) and str(donation.donor_id) != str(user_id) \
                and user.role not in ('admin', 'super_admin'):
            return jsonify({'message': 'Unauthorized'}), 403

    if new_status == 'Approved':
        pr.status = 'Approved'
        pr.approved_at = datetime.utcnow()
        donation.status = 'Approved'

        # Reject all other pending requests for the same donation
        others = PickupRequest.query.filter(
            PickupRequest.donation_id == donation.id,
            PickupRequest.id != pr.id,
            PickupRequest.status == 'Pending'
        ).all()
        for other in others:
            other.status = 'Rejected'
            _create_notification(
                other.receiver_id,
                'Pickup Request Rejected',
                f'Your request for {donation.food_name} was declined (another receiver approved).',
                'pickup_rejected',
                '/receiver/requests'
            )
            _safe_emit('pickup_status_changed', {
                'pickup_request': other.to_dict(),
                'donation': donation.to_dict(),
            }, room=f'user_{other.receiver_id}')

        _create_notification(
            pr.receiver_id,
            'Pickup Request Approved!',
            f'Your pickup for {donation.food_name} has been approved. A QR code is ready.',
            'pickup_approved',
            '/receiver/schedule'
        )
        _safe_emit('pickup_status_changed', {
            'pickup_request': pr.to_dict(),
            'donation': donation.to_dict(),
        }, room=f'user_{pr.receiver_id}')

    elif new_status == 'Rejected':
        pr.status = 'Rejected'

        # If no other pending requests, revert donation to Available
        other_pending = PickupRequest.query.filter(
            PickupRequest.donation_id == donation.id,
            PickupRequest.id != pr.id,
            PickupRequest.status == 'Pending'
        ).count()
        if other_pending == 0:
            donation.status = 'Available'

        _create_notification(
            pr.receiver_id,
            'Pickup Request Rejected',
            f'Your request for {donation.food_name} has been rejected.',
            'pickup_rejected',
            '/receiver/requests'
        )
        _safe_emit('pickup_status_changed', {
            'pickup_request': pr.to_dict(),
            'donation': donation.to_dict(),
        }, room=f'user_{pr.receiver_id}')

    elif new_status == 'Completed':
        pr.status = 'Completed'
        pr.completed_at = datetime.utcnow()
        donation.status = 'Completed'

        # Generate certificate
        cert = Certificate(
            donation_id=donation.id,
            donor_id=donation.donor_id,
            receiver_id=pr.receiver_id,
            certificate_url=f'/api/services/certificates/download/{donation.id}'
        )
        db.session.add(cert)
        db.session.flush()

        _create_notification(
            donation.donor_id,
            'Pickup Completed',
            f'The pickup for {donation.food_name} is complete. Certificate generated!',
            'pickup_completed',
            '/donor/certificates'
        )
        _create_notification(
            pr.receiver_id,
            'Pickup Completed',
            f'Your pickup of {donation.food_name} is complete. Thank you!',
            'pickup_completed',
            '/receiver/requests'
        )
        _create_notification(
            donation.donor_id,
            'Certificate Generated',
            f'A donation certificate has been generated for {donation.food_name}.',
            'certificate_generated',
            '/donor/certificates'
        )

        _safe_emit('pickup_status_changed', {
            'pickup_request': pr.to_dict(),
            'donation': donation.to_dict(),
        })
        _safe_emit('analytics_updated', {}, namespace='/')

    db.session.commit()
    result = pr.to_dict()
    result['donation'] = donation.to_dict()
    return jsonify({'message': f'Pickup {new_status.lower()}', 'pickup_request': result}), 200


# ─── Generate QR code for approved pickup ────────────────────────────────────

@pickups_bp.route('/<int:id>/qr', methods=['POST'])
@jwt_required()
def generate_qr(id):
    user_id = int(get_jwt_identity())
    pr = PickupRequest.query.get_or_404(id)
    donation = Donation.query.get(pr.donation_id)

    if str(donation.donor_id) != str(user_id) and str(pr.receiver_id) != str(user_id):
        return jsonify({'message': 'Unauthorized'}), 403

    if pr.status != 'Approved':
        return jsonify({'message': 'Pickup must be Approved before generating QR code'}), 400

    result = generate_qr_token(id)
    # Persist the token
    pr.qr_token = result['token']
    pr.qr_used = False
    db.session.commit()

    return jsonify(result), 200


# ─── Verify QR (donor scans) ──────────────────────────────────────────────────

@pickups_bp.route('/qr/verify', methods=['POST'])
@jwt_required()
def verify_qr():
    data = request.get_json(force=True) or {}
    token = data.get('token')

    if not token:
        return jsonify({'message': 'token is required'}), 400

    pr = PickupRequest.query.filter_by(qr_token=token).first()
    if not pr:
        return jsonify({'valid': False, 'message': 'Invalid QR code token'}), 400
    if pr.qr_used:
        return jsonify({'valid': False, 'message': 'This QR code has already been used'}), 400
    if pr.status != 'Approved':
        return jsonify({'valid': False, 'message': 'Pickup is not in approved state'}), 400

    # Mark as used and complete
    pr.qr_used = True
    pr.status = 'Completed'
    pr.completed_at = datetime.utcnow()

    donation = Donation.query.get(pr.donation_id)
    donation.status = 'Completed'

    cert = Certificate(
        donation_id=donation.id,
        donor_id=donation.donor_id,
        receiver_id=pr.receiver_id,
        certificate_url=f'/api/services/certificates/download/{donation.id}'
    )
    db.session.add(cert)
    db.session.flush()

    _create_notification(
        donation.donor_id,
        'Pickup Verified & Completed',
        f'QR scan confirmed. Pickup of {donation.food_name} is complete.',
        'pickup_completed',
        '/donor/certificates'
    )
    _create_notification(
        pr.receiver_id,
        'Pickup Completed',
        f'Your pickup of {donation.food_name} is complete. Certificate generated!',
        'pickup_completed',
        '/receiver/requests'
    )

    db.session.commit()

    _safe_emit('pickup_status_changed', {
        'pickup_request': pr.to_dict(),
        'donation': donation.to_dict(),
    })

    return jsonify({
        'valid': True,
        'message': 'Pickup verified and completed',
        'pickup_request': pr.to_dict(),
        'donation': donation.to_dict(),
        'certificate': cert.to_dict(),
    }), 200
