from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from flask_mail import Mail
from flask_cors import CORS

db = SQLAlchemy()
jwt = JWTManager()
mail = Mail()
cors = CORS()

# gevent works on Python 3.14, eventlet does not
socketio = SocketIO(cors_allowed_origins="*", async_mode='gevent')
