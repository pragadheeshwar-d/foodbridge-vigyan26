"""
Real-time chat routes.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_, and_
from extensions import db, socketio
from models import Message, User

chat_bp = Blueprint('chat', __name__)


@chat_bp.route('/conversations', methods=['GET'])
@jwt_required()
def get_conversations():
    """Return all unique chat partners with last message and unread count."""
    user_id = int(get_jwt_identity())

    sent_ids = {r[0] for r in db.session.query(Message.receiver_id)
                .filter(Message.sender_id == user_id).distinct()}
    recv_ids = {r[0] for r in db.session.query(Message.sender_id)
                .filter(Message.receiver_id == user_id).distinct()}
    partner_ids = sent_ids | recv_ids

    conversations = []
    for pid in partner_ids:
        partner = User.query.get(pid)
        if not partner:
            continue

        last_msg = (
            Message.query
            .filter(or_(
                and_(Message.sender_id == user_id, Message.receiver_id == pid),
                and_(Message.sender_id == pid, Message.receiver_id == user_id)
            ))
            .order_by(Message.created_at.desc())
            .first()
        )

        unread = Message.query.filter(
            Message.sender_id == pid,
            Message.receiver_id == user_id,
            Message.is_read == False  # noqa: E712
        ).count()

        conversations.append({
            'partner': partner.to_dict(),
            'last_message': last_msg.to_dict() if last_msg else None,
            'unread_count': unread,
        })

    conversations.sort(
        key=lambda c: c['last_message']['created_at'] if c['last_message'] else '',
        reverse=True
    )
    return jsonify(conversations), 200


@chat_bp.route('/messages/<int:partner_id>', methods=['GET'])
@jwt_required()
def get_messages(partner_id):
    user_id = int(get_jwt_identity())

    messages = (
        Message.query
        .filter(or_(
            and_(Message.sender_id == user_id, Message.receiver_id == partner_id),
            and_(Message.sender_id == partner_id, Message.receiver_id == user_id)
        ))
        .order_by(Message.created_at.asc())
        .all()
    )

    # Mark unread as read
    unread = Message.query.filter(
        Message.sender_id == partner_id,
        Message.receiver_id == user_id,
        Message.is_read == False  # noqa: E712
    ).all()
    for m in unread:
        m.is_read = True
    db.session.commit()

    # Notify sender that messages were read
    if unread:
        socketio.emit('messages_read', {
            'message_ids': [m.id for m in unread]
        }, room=f'user_{partner_id}')

    return jsonify([m.to_dict() for m in messages]), 200


@chat_bp.route('/messages', methods=['POST'])
@jwt_required()
def send_message():
    user_id = int(get_jwt_identity())
    data = request.get_json(force=True) or {}

    receiver_id = data.get('receiver_id')
    text = data.get('message', '').strip()

    if not receiver_id or not text:
        return jsonify({'message': 'receiver_id and message are required'}), 400

    msg = Message(
        sender_id=user_id,
        receiver_id=int(receiver_id),
        message=text,
    )
    db.session.add(msg)
    db.session.commit()

    msg_dict = msg.to_dict()
    # Push real-time to receiver
    socketio.emit('new_message', msg_dict, room=f'user_{receiver_id}')

    return jsonify({'message': 'Sent', 'data': msg_dict}), 201


@chat_bp.route('/users', methods=['GET'])
@jwt_required()
def list_chat_users():
    """Return users that this user can message (donors ↔ receivers)."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if user.role == 'donor':
        partners = User.query.filter_by(role='receiver', status='approved').all()
    elif user.role == 'receiver':
        partners = User.query.filter_by(role='donor', status='approved').all()
    else:
        partners = User.query.filter(User.id != user_id).all()

    return jsonify([u.to_dict() for u in partners]), 200
