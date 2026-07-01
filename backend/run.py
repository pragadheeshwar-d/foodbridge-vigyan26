"""
Entry point for both local dev and production (Render).

Local dev:   python run.py
Production:  gunicorn --worker-class gevent -w 1 --bind 0.0.0.0:$PORT run:app
"""
import os

# Patch standard library for gevent in production
if os.environ.get('FLASK_ENV') != 'development':
    try:
        from gevent import monkey
        monkey.patch_all()
    except ImportError:
        pass

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
    )
