"""
Miscellaneous services: QR, certificates, and admin user management.
"""
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import User, Donation, PickupRequest, Certificate
from services.qr_service import generate_qr_token, verify_qr_token

services_bp = Blueprint('services', __name__)


# ─── Certificates ─────────────────────────────────────────────────────────────

@services_bp.route('/certificates', methods=['GET'])
@jwt_required()
def get_certificates():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if user.role == 'donor':
        certs = Certificate.query.filter_by(donor_id=user_id).order_by(Certificate.generated_at.desc()).all()
    elif user.role == 'receiver':
        certs = Certificate.query.filter_by(receiver_id=user_id).order_by(Certificate.generated_at.desc()).all()
    else:
        certs = Certificate.query.order_by(Certificate.generated_at.desc()).all()

    return jsonify([c.to_dict() for c in certs]), 200


# ─── Admin: Users ─────────────────────────────────────────────────────────────

@services_bp.route('/admin/users', methods=['GET'])
@jwt_required()
def admin_get_users():
    admin_id = get_jwt_identity()
    admin = User.query.get(admin_id)
    if admin.role not in ('admin', 'super_admin'):
        return jsonify({'message': 'Unauthorized'}), 403

    role_filter = request.args.get('role')
    status_filter = request.args.get('status')
    q = User.query
    if role_filter:
        q = q.filter_by(role=role_filter)
    if status_filter:
        q = q.filter_by(status=status_filter)

    users = q.order_by(User.created_at.desc()).all()
    return jsonify([u.to_dict() for u in users]), 200


@services_bp.route('/admin/users/<int:uid>', methods=['PUT'])
@jwt_required()
def admin_update_user(uid):
    admin_id = get_jwt_identity()
    admin = User.query.get(admin_id)
    if admin.role not in ('admin', 'super_admin'):
        return jsonify({'message': 'Unauthorized'}), 403

    target = User.query.get_or_404(uid)
    data = request.get_json(force=True) or {}

    if 'verified' in data:
        target.verified = bool(data['verified'])
    if 'status' in data and data['status'] in ('pending', 'approved', 'rejected', 'suspended'):
        target.status = data['status']
    if 'role' in data and data['role'] in ('donor', 'receiver', 'admin', 'super_admin'):
        target.role = data['role']

    db.session.commit()
    return jsonify({'message': 'User updated', 'user': target.to_dict()}), 200


@services_bp.route('/admin/users/<int:uid>', methods=['DELETE'])
@jwt_required()
def admin_delete_user(uid):
    admin_id = get_jwt_identity()
    admin = User.query.get(admin_id)
    if admin.role not in ('admin', 'super_admin'):
        return jsonify({'message': 'Unauthorized'}), 403

    target = User.query.get_or_404(uid)
    db.session.delete(target)
    db.session.commit()
    return jsonify({'message': 'User deleted'}), 200


# ─── Admin: Donations ─────────────────────────────────────────────────────────

@services_bp.route('/admin/donations', methods=['GET'])
@jwt_required()
def admin_get_donations():
    admin_id = get_jwt_identity()
    admin = User.query.get(admin_id)
    if admin.role not in ('admin', 'super_admin'):
        return jsonify({'message': 'Unauthorized'}), 403

    donations = Donation.query.order_by(Donation.created_at.desc()).all()
    return jsonify([d.to_dict() for d in donations]), 200


# ─── Admin: Pickup Requests ───────────────────────────────────────────────────

@services_bp.route('/admin/pickups', methods=['GET'])
@jwt_required()
def admin_get_pickups():
    admin_id = get_jwt_identity()
    admin = User.query.get(admin_id)
    if admin.role not in ('admin', 'super_admin'):
        return jsonify({'message': 'Unauthorized'}), 403

    prs = PickupRequest.query.order_by(PickupRequest.requested_at.desc()).all()
    result = []
    for pr in prs:
        d = pr.to_dict()
        d['donation'] = pr.donation.to_dict() if pr.donation else None
        result.append(d)
    return jsonify(result), 200
