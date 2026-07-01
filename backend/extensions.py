import os
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from flask_mail import Mail
from flask_cors import CORS

db = SQLAlchemy()
jwt = JWTManager()
mail = Mail()
cors = CORS()

# Use eventlet in production for proper async/WebSocket support
_async_mode = 'eventlet' if os.environ.get('FLASK_ENV') != 'development' else 'threading'
socketio = SocketIO(cors_allowed_origins="*", async_mode=_async_mode)
