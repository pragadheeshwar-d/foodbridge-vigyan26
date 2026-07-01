"""
Entry point for both local dev and production (Render/Heroku/Railway).

Local dev:   python run.py
Production:  gunicorn --worker-class eventlet -w 1 run:app
"""
import os
from app import create_app
from extensions import socketio

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV', 'production') == 'development'
    socketio.run(
        app,
        host='0.0.0.0',
        port=port,
        debug=debug,
        use_reloader=False,
        allow_unsafe_werkzeug=True,
    )
