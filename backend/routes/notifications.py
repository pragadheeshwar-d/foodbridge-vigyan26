"""
Notification routes.
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Notification, User

notifications_bp = Blueprint('notifications', __name__)


@notifications_bp.route('/', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    limit = int(request.args.get('limit', 50))
    notifs = (
        Notification.query
        .filter_by(user_id=user_id)
        .order_by(Notification.created_at.desc())
        .limit(limit)
        .all()
    )
    return jsonify([n.to_dict() for n in notifs]), 200


@notifications_bp.route('/unread-count', methods=['GET'])
@jwt_required()
def unread_count():
    user_id = get_jwt_identity()
    count = Notification.query.filter_by(user_id=user_id, is_read=False).count()
    return jsonify({'unread_count': count}), 200


@notifications_bp.route('/<int:id>/read', methods=['PUT'])
@jwt_required()
def mark_read(id):
    user_id = get_jwt_identity()
    notif = Notification.query.get_or_404(id)
    if str(notif.user_id) != str(user_id):
        return jsonify({'message': 'Unauthorized'}), 403
    notif.is_read = True
    db.session.commit()
    return jsonify({'message': 'Marked as read'}), 200


@notifications_bp.route('/read-all', methods=['PUT'])
@jwt_required()
def mark_all_read():
    user_id = get_jwt_identity()
    Notification.query.filter_by(user_id=user_id, is_read=False).update({'is_read': True})
    db.session.commit()
    return jsonify({'message': 'All notifications marked as read'}), 200


@notifications_bp.route('/broadcast', methods=['POST'])
@jwt_required()
def broadcast():
    """Admin: broadcast a notification to all users or a specific role."""
    from extensions import socketio
    current_id = get_jwt_identity()
    admin = User.query.get(current_id)
    if admin.role not in ('admin', 'super_admin'):
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.get_json(force=True) or {}
    title = data.get('title', 'Announcement')
    message = data.get('message', '')
    role_filter = data.get('role')  # optional

    q = User.query
    if role_filter:
        q = q.filter_by(role=role_filter)
    users = q.all()

    for u in users:
        n = Notification(
            user_id=u.id, title=title, message=message,
            type='info'
        )
        db.session.add(n)
    db.session.commit()

    socketio.emit('notification', {'title': title, 'message': message, 'type': 'info'}, namespace='/')
    return jsonify({'message': f'Broadcast sent to {len(users)} users'}), 200
