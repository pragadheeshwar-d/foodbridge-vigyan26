"""
Entry point — works with Python 3.11 + eventlet.
Production: gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:$PORT run:app
"""
import os
import eventlet
eventlet.monkey_patch()

from app import create_app
from extensions import socketio

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    socketio.run(app, host='0.0.0.0', port=port, debug=debug)
