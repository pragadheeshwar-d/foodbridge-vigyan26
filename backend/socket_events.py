"""
Socket.IO event handlers for real-time features:
authentication, room management, live chat, and live updates.
"""
from flask_socketio import emit, join_room, leave_room
from flask_jwt_extended import decode_token
from extensions import socketio, db
from models import Message

# Track connected users: user_id -> socket_session_id (for monitoring)
connected_users: dict = {}


@socketio.on('connect')
def handle_connect(auth=None):
    """Handle new socket connection. Client sends JWT in auth dict."""
    token = None
    if auth and isinstance(auth, dict):
        token = auth.get('token')

    if token:
        try:
            decoded = decode_token(token)
            user_id = str(decoded['sub'])
            connected_users[user_id] = True
            join_room(f'user_{user_id}')
            emit('connected', {'message': 'Authenticated', 'user_id': user_id})
        except Exception:
            emit('connected', {'message': 'Connected (unauthenticated)'})
    else:
        emit('connected', {'message': 'Connected (no token)'})


@socketio.on('disconnect')
def handle_disconnect():
    pass


@socketio.on('join')
def handle_join(data):
    """Let client explicitly join their user room (fallback)."""
    user_id = data.get('user_id')
    if user_id:
        join_room(f'user_{user_id}')
        emit('joined', {'room': f'user_{user_id}'})


@socketio.on('leave')
def handle_leave(data):
    user_id = data.get('user_id')
    if user_id:
        leave_room(f'user_{user_id}')


# ─── Live Chat ────────────────────────────────────────────────────────────────

@socketio.on('send_message')
def handle_send_message(data):
    """Handle real-time chat message from client."""
    sender_id = data.get('sender_id')
    receiver_id = data.get('receiver_id')
    text = data.get('message', '').strip()

    if not all([sender_id, receiver_id, text]):
        emit('error', {'message': 'Missing required fields'})
        return

    msg = Message(sender_id=int(sender_id), receiver_id=int(receiver_id), message=text)
    db.session.add(msg)
    db.session.commit()

    msg_dict = msg.to_dict()
    emit('new_message', msg_dict, room=f'user_{receiver_id}')
    emit('message_sent', msg_dict)


@socketio.on('mark_read')
def handle_mark_read(data):
    message_ids = data.get('message_ids', [])
    sender_id = data.get('sender_id')

    if message_ids:
        Message.query.filter(Message.id.in_(message_ids)).update(
            {'is_read': True}, synchronize_session=False
        )
        db.session.commit()
        if sender_id:
            emit('messages_read', {'message_ids': message_ids}, room=f'user_{sender_id}')


@socketio.on('typing')
def handle_typing(data):
    receiver_id = data.get('receiver_id')
    sender_id = data.get('sender_id')
    if receiver_id:
        emit('user_typing', {'user_id': sender_id}, room=f'user_{receiver_id}')


@socketio.on('stop_typing')
def handle_stop_typing(data):
    receiver_id = data.get('receiver_id')
    sender_id = data.get('sender_id')
    if receiver_id:
        emit('user_stop_typing', {'user_id': sender_id}, room=f'user_{receiver_id}')
