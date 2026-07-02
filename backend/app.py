"""
FoodBridge Flask Application Factory
"""
import os
from flask import Flask, jsonify
from config import Config
from extensions import db, jwt, socketio, mail, cors


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Ensure upload directory exists
    os.makedirs(app.config.get('UPLOAD_FOLDER', 'uploads'), exist_ok=True)

    # Allowed origins: localhost for dev + production frontend URLs
    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "https://food-bridge-vigyan-26.vercel.app",
        "https://food-bridge-vigyan-26-d624vid0f.vercel.app",
    ]
    frontend_url = os.environ.get('FRONTEND_URL', '')
    if frontend_url:
        allowed_origins.append(frontend_url)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": allowed_origins}},
        supports_credentials=True
    )
    socketio.init_app(
        app,
        cors_allowed_origins="*",
        logger=False,
        engineio_logger=False,
        async_mode="threading",
    )

    # Register blueprints
    from routes.auth import auth_bp
    from routes.donations import donations_bp
    from routes.pickups import pickups_bp
    from routes.connections import connections_bp
    from routes.dashboard import dashboard_bp
    from routes.chat import chat_bp
    from routes.notifications import notifications_bp
    from routes.services import services_bp

    app.register_blueprint(auth_bp,          url_prefix='/api/auth')
    app.register_blueprint(donations_bp,     url_prefix='/api/donations')
    app.register_blueprint(pickups_bp,       url_prefix='/api/pickups')
    app.register_blueprint(connections_bp,   url_prefix='/api/connections')
    app.register_blueprint(dashboard_bp,     url_prefix='/api/dashboard')
    app.register_blueprint(chat_bp,          url_prefix='/api/chat')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(services_bp,      url_prefix='/api/services')

    # Register socket event handlers
    import socket_events  # noqa: F401

    # JWT error handlers
    @jwt.unauthorized_loader
    def missing_token(_err):
        return jsonify({'message': 'Missing or invalid authorization token'}), 401

    @jwt.expired_token_loader
    def expired_token(_jwt_header, _jwt_payload):
        return jsonify({'message': 'Token has expired. Please log in again.'}), 401

    @jwt.invalid_token_loader
    def invalid_token(_err):
        return jsonify({'message': 'Invalid token'}), 422

    # Health check
    @app.route('/api/health')
    def health():
        return jsonify({'status': 'healthy', 'service': 'FoodBridge API'}), 200

    return app
