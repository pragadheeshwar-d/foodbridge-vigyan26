"""
Authentication routes: register, login, logout, email verification,
forgot/reset password, and profile management.
"""
import os
import uuid
import bcrypt
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity
)
from flask_mail import Message as MailMessage
from extensions import db, mail
from models import User

auth_bp = Blueprint('auth', __name__)

# ─── Helpers ─────────────────────────────────────────────────────────────────

def _hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def _check(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


def _send_verification_email(user: User):
    """Send email-verification link to the user. Silently skip if mail not configured."""
    try:
        frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:5173')
        link = f"{frontend_url}/auth/verify-email?token={user.verification_token}"
        msg = MailMessage(
            subject='Verify your FoodBridge account',
            recipients=[user.email],
            html=f"""
            <h2>Welcome to FoodBridge, {user.name}!</h2>
            <p>Please verify your email address by clicking the link below:</p>
            <p><a href="{link}" style="color:#16A34A;font-weight:bold">Verify Email</a></p>
            <p>This link expires in 24 hours.</p>
            <p>If you didn't create this account, you can ignore this email.</p>
            """
        )
        mail.send(msg)
    except Exception as e:
        current_app.logger.warning(f'Could not send verification email to {user.email}: {e}')


def _send_reset_email(user: User):
    """Send password-reset email."""
    try:
        frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:5173')
        link = f"{frontend_url}/auth/reset-password?token={user.reset_token}"
        msg = MailMessage(
            subject='Reset your FoodBridge password',
            recipients=[user.email],
            html=f"""
            <h2>FoodBridge — Password Reset</h2>
            <p>You requested a password reset. Click the link below:</p>
            <p><a href="{link}" style="color:#16A34A;font-weight:bold">Reset Password</a></p>
            <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
            """
        )
        mail.send(msg)
    except Exception as e:
        current_app.logger.warning(f'Could not send reset email to {user.email}: {e}')


# ─── Register ────────────────────────────────────────────────────────────────

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json(force=True) or {}

    # Validate required fields
    required = ['name', 'email', 'password', 'role']
    for field in required:
        if not data.get(field):
            return jsonify({'message': f'{field} is required'}), 400

    email = data['email'].strip().lower()
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already registered'}), 409

    role = data['role']
    if role not in ('donor', 'receiver', 'admin', 'super_admin'):
        return jsonify({'message': 'Invalid role'}), 400

    # Email verification token
    token = str(uuid.uuid4())

    user = User(
        name=data['name'].strip(),
        email=email,
        password=_hash(data['password']),
        role=role,
        organization=data.get('organization'),
        phone=data.get('phone'),
        address=data.get('address'),
        business_type=data.get('businessType'),
        verification_id=data.get('verificationId'),
        operating_hours=data.get('operatingHours'),
        verified=False,
        verification_token=token,
        verification_expiry=datetime.utcnow() + timedelta(hours=24),
        status='pending' if role not in ('admin', 'super_admin') else 'approved',
    )
    db.session.add(user)
    db.session.commit()

    # Try to send verification email
    # If it fails (e.g. SMTP blocked on free hosting), auto-verify so user can still login
    try:
        _send_verification_email(user)
    except Exception:
        # Email failed — auto-verify so login still works
        user.verified = True
        user.verification_token = None
        db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'message': 'Registration successful. Please check your email to verify your account.',
        'token': access_token,
        'user': user.to_dict()
    }), 201


# ─── Verify Email ────────────────────────────────────────────────────────────

@auth_bp.route('/verify-email', methods=['GET', 'POST'])
def verify_email():
    token = request.args.get('token') or (request.get_json(force=True) or {}).get('token')
    if not token:
        return jsonify({'message': 'Token is required'}), 400

    user = User.query.filter_by(verification_token=token).first()
    if not user:
        return jsonify({'message': 'Invalid or expired verification token'}), 400

    if user.verification_expiry and user.verification_expiry < datetime.utcnow():
        return jsonify({'message': 'Verification token has expired. Please request a new one.'}), 400

    user.verified = True
    user.verification_token = None
    user.verification_expiry = None
    db.session.commit()

    return jsonify({'message': 'Email verified successfully. You can now log in.'}), 200


# ─── Resend Verification ──────────────────────────────────────────────────────

@auth_bp.route('/resend-verification', methods=['POST'])
def resend_verification():
    data = request.get_json(force=True) or {}
    email = data.get('email', '').strip().lower()
    user = User.query.filter_by(email=email).first()

    if not user:
        # Don't reveal whether the email exists
        return jsonify({'message': 'If that email exists, a verification link has been sent.'}), 200

    if user.verified:
        return jsonify({'message': 'Email is already verified.'}), 400

    user.verification_token = str(uuid.uuid4())
    user.verification_expiry = datetime.utcnow() + timedelta(hours=24)
    db.session.commit()
    _send_verification_email(user)

    return jsonify({'message': 'Verification email resent.'}), 200


# ─── Login ───────────────────────────────────────────────────────────────────

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(force=True) or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not _check(password, user.password):
        return jsonify({'message': 'Invalid email or password'}), 401

    if not user.verified:
        # Auto-verify since SMTP may be blocked on free hosting
        user.verified = True
        db.session.commit()

    if user.status == 'suspended':
        return jsonify({'message': 'Your account has been suspended. Contact support.'}), 403

    access_token = create_access_token(identity=str(user.id))
    return jsonify({'token': access_token, 'user': user.to_dict()}), 200


# ─── Profile ─────────────────────────────────────────────────────────────────

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify({'user': user.to_dict()}), 200


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    data = request.get_json(force=True) or {}

    user.name = data.get('name', user.name)
    user.organization = data.get('organization', user.organization)
    user.phone = data.get('phone', user.phone)
    user.address = data.get('address', user.address)
    user.operating_hours = data.get('operatingHours', user.operating_hours)

    if data.get('profile_image'):
        user.profile_image = data['profile_image']  # base64 string

    # Password change
    if data.get('new_password'):
        if not data.get('current_password'):
            return jsonify({'message': 'current_password is required to change password'}), 400
        if not _check(data['current_password'], user.password):
            return jsonify({'message': 'Current password is incorrect'}), 400
        if len(data['new_password']) < 8:
            return jsonify({'message': 'Password must be at least 8 characters'}), 400
        user.password = _hash(data['new_password'])

    db.session.commit()
    return jsonify({'message': 'Profile updated successfully', 'user': user.to_dict()}), 200


# ─── Forgot Password ─────────────────────────────────────────────────────────

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json(force=True) or {}
    email = data.get('email', '').strip().lower()

    user = User.query.filter_by(email=email).first()
    if user:
        user.reset_token = str(uuid.uuid4())
        user.reset_expiry = datetime.utcnow() + timedelta(hours=1)
        db.session.commit()
        _send_reset_email(user)

    return jsonify({
        'message': 'If that email exists, a password reset link has been sent.'
    }), 200


# ─── Reset Password ───────────────────────────────────────────────────────────

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json(force=True) or {}
    token = data.get('token')
    new_password = data.get('password')

    if not token or not new_password:
        return jsonify({'message': 'Token and password are required'}), 400

    if len(new_password) < 8:
        return jsonify({'message': 'Password must be at least 8 characters'}), 400

    user = User.query.filter_by(reset_token=token).first()
    if not user:
        return jsonify({'message': 'Invalid or expired reset token'}), 400

    if user.reset_expiry and user.reset_expiry < datetime.utcnow():
        return jsonify({'message': 'Reset token has expired. Please request a new one.'}), 400

    user.password = _hash(new_password)
    user.reset_token = None
    user.reset_expiry = None
    db.session.commit()

    return jsonify({'message': 'Password reset successfully. You can now log in.'}), 200
