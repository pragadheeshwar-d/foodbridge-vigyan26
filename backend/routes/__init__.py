from .auth import auth_bp
from .donations import donations_bp
from .pickups import pickups_bp
from .dashboard import dashboard_bp
from .chat import chat_bp

def register_blueprints(app):
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(donations_bp, url_prefix='/api/donations')
    app.register_blueprint(pickups_bp, url_prefix='/api/pickups')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
