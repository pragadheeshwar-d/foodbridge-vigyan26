"""
Shared donor <-> receiver connection routes.

These endpoints expose the exact bridge records that link a donor's donation
to a receiver's pickup request so both sides can read the same source of truth.
"""
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models import Donation, PickupRequest, User

connections_bp = Blueprint('connections', __name__)


@connections_bp.route('/', methods=['GET'])
@jwt_required()
def list_user_connections():
    """
    Return all donor/receiver bridge records visible to the current user.

    Donors see every pickup request for their donations.
    Receivers see every pickup request they created.
    Admins see all bridge records.
    """
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)

    q = (
        db.session.query(PickupRequest, Donation)
        .join(Donation, PickupRequest.donation_id == Donation.id)
    )

    if user.role == 'donor':
        q = q.filter(Donation.donor_id == user_id)
    elif user.role == 'receiver':
        q = q.filter(PickupRequest.receiver_id == user_id)

    rows = []
    for pickup, donation in q.order_by(PickupRequest.requested_at.desc()).all():
        donor = donation.donor
        receiver = pickup.receiver
        rows.append({
            'pickup_request_id': pickup.id,
            'pickup_status': pickup.status,
            'requested_at': pickup.requested_at.isoformat() if pickup.requested_at else None,
            'approved_at': pickup.approved_at.isoformat() if pickup.approved_at else None,
            'completed_at': pickup.completed_at.isoformat() if pickup.completed_at else None,
            'donation': {
                'id': donation.id,
                'status': donation.status,
                'food_name': donation.food_name,
                'food_type': donation.food_type,
                'quantity': donation.quantity,
                'pickup_address': donation.pickup_address,
                'expiry_time': donation.expiry_time.isoformat() if donation.expiry_time else None,
                'donor_id': donation.donor_id,
                'donor_name': donor.name if donor else None,
                'donor_organization': donor.organization if donor else None,
            },
            'receiver': {
                'id': receiver.id if receiver else None,
                'name': receiver.name if receiver else None,
                'organization': receiver.organization if receiver else None,
                'phone': receiver.phone if receiver else None,
                'address': receiver.address if receiver else None,
            },
        })

    return jsonify({
        'user': user.to_dict(),
        'connections': rows,
        'count': len(rows),
    }), 200
