"""
Donation management routes.
"""
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from sqlalchemy.orm import joinedload
from extensions import db, socketio
from models import User, Donation, Notification

donations_bp = Blueprint('donations', __name__)


def _safe_emit(event, payload, **kwargs):
    """Emit Socket.IO events without breaking donation creation if realtime fails."""
    try:
        socketio.emit(event, payload, **kwargs)
    except Exception as exc:
        current_app.logger.warning("Socket.IO emit failed for %s: %s", event, exc)


def _notify_receivers(donation: Donation):
    """Create in-app notifications and emit socket event to all approved receivers."""
    receivers = User.query.filter_by(role='receiver', status='approved').all()
    for r in receivers:
        notif = Notification(
            user_id=r.id,
            title='New Donation Available',
            message=f'{donation.donor.organization or donation.donor.name} listed {donation.quantity} of {donation.food_name}.',
            type='new_donation',
            link='/receiver/donations'
        )
        db.session.add(notif)
    db.session.flush()

    # Emit to all receivers
    _safe_emit('new_donation', donation.to_dict(), namespace='/')
    # Notify each receiver's private room
    for r in receivers:
        _safe_emit('notification', {
            'title': 'New Donation Available',
            'message': f'{donation.donor.organization or donation.donor.name} listed {donation.quantity} of {donation.food_name}.',
            'type': 'new_donation',
        }, room=f'user_{r.id}')


# ─── List donations ───────────────────────────────────────────────────────────

@donations_bp.route('/', methods=['GET'])
def get_donations():
    """
    Public: list available donations.
    Authenticated users get role-based results.
    Optional filters: status, donor_id.
    """
    # Allow unauthenticated browse of Available donations
    try:
        verify_jwt_in_request(optional=True)
    except Exception:
        pass

    status = request.args.get('status')
    donor_id = request.args.get('donor_id')

    q = Donation.query
    if status:
        q = q.filter_by(status=status)
    if donor_id:
        q = q.filter_by(donor_id=donor_id)

    donations = q.options(joinedload(Donation.donor)).order_by(Donation.created_at.desc()).all()
    return jsonify([d.to_dict() for d in donations]), 200


@donations_bp.route('/available', methods=['GET'])
def get_available_donations():
    """Available donations not yet expired (public endpoint for receivers)."""
    now = datetime.utcnow()
    donations = (
        Donation.query
        .options(joinedload(Donation.donor))
        .filter(Donation.status == 'Available', Donation.expiry_time > now)
        .order_by(Donation.expiry_time.asc())
        .all()
    )
    return jsonify([d.to_dict() for d in donations]), 200


# ─── Create donation ──────────────────────────────────────────────────────────

@donations_bp.route('/', methods=['POST'])
@jwt_required()
def create_donation():
    user_id = get_jwt_identity()
    donor = User.query.get(user_id)
    if not donor:
        return jsonify({'message': 'User not found'}), 404
    if donor.role not in ('donor', 'admin', 'super_admin'):
        return jsonify({'message': 'Only donors can create donations'}), 403

    data = request.get_json(force=True) or {}

    required = ['food_name', 'food_type', 'quantity', 'expiry_time', 'pickup_address']
    for field in required:
        if not data.get(field):
            return jsonify({'message': f'{field} is required'}), 400

    # Parse datetimes — always return naive UTC datetime for MySQL compatibility
    def parse_dt(val):
        if not val:
            return None
        dt = datetime.fromisoformat(str(val).replace('Z', '+00:00'))
        # Strip timezone info (convert to naive UTC)
        if dt.tzinfo is not None:
            from datetime import timezone
            dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
        return dt

    expiry_time = parse_dt(data.get('expiry_time'))
    pickup_time = parse_dt(data.get('pickup_time'))

    quantity_raw = str(data.get('quantity', '')).strip()
    try:
        qty_num = float(quantity_raw)
        unit = data.get('unit', 'meals')
        quantity_str = f"{quantity_raw} {unit}"
    except ValueError:
        qty_num = None
        unit = data.get('unit')
        quantity_str = quantity_raw

    prep_time_str = data.get('preparation_time') or data.get('preparationTime')

    donation = Donation(
        donor_id=int(user_id),
        food_name=data['food_name'],
        food_type=data['food_type'],
        category=data.get('category'),
        veg_type=data.get('veg_type') or data.get('vegType'),
        quantity=quantity_str,
        quantity_number=qty_num,
        unit=unit,
        description=data.get('description'),
        special_instructions=data.get('specialInstructions') or data.get('special_instructions'),
        image=data.get('image') or data.get('imageUrl'),
        pickup_address=data['pickup_address'],
        latitude=data.get('latitude'),
        longitude=data.get('longitude'),
        pickup_time=pickup_time,
        expiry_time=expiry_time,
        preparation_time=prep_time_str,
        preferred_pickup_time=data.get('preferredPickupTime') or data.get('preferred_pickup_time'),
        status='Available',
    )
    db.session.add(donation)
    db.session.flush()  # get donation.id without final commit

    _notify_receivers(donation)
    db.session.commit()

    return jsonify({'message': 'Donation created successfully', 'donation': donation.to_dict()}), 201


# ─── Get single donation ──────────────────────────────────────────────────────

@donations_bp.route('/<int:id>', methods=['GET'])
def get_donation(id):
    donation = Donation.query.get_or_404(id)
    return jsonify(donation.to_dict()), 200


# ─── Update donation ──────────────────────────────────────────────────────────

@donations_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_donation(id):
    user_id = get_jwt_identity()
    donation = Donation.query.get_or_404(id)
    user = User.query.get(user_id)

    if str(donation.donor_id) != str(user_id) and user.role not in ('admin', 'super_admin'):
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.get_json(force=True) or {}

    if 'status' in data:
        donation.status = data['status']
    if 'food_name' in data:
        donation.food_name = data['food_name']
    if 'description' in data:
        donation.description = data['description']

    db.session.commit()

    socketio.emit('donation_updated', donation.to_dict(), namespace='/')
    return jsonify({'message': 'Donation updated', 'donation': donation.to_dict()}), 200


# ─── Delete donation ──────────────────────────────────────────────────────────

@donations_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_donation(id):
    user_id = get_jwt_identity()
    donation = Donation.query.get_or_404(id)
    user = User.query.get(user_id)

    if str(donation.donor_id) != str(user_id) and user.role not in ('admin', 'super_admin'):
        return jsonify({'message': 'Unauthorized'}), 403

    db.session.delete(donation)
    db.session.commit()
    return jsonify({'message': 'Donation deleted'}), 200
