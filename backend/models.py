"""
SQLAlchemy ORM models for FoodBridge
"""
from datetime import datetime
from extensions import db


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='donor')  # donor | receiver | admin | super_admin
    organization = db.Column(db.String(150), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    address = db.Column(db.String(255), nullable=True)
    profile_image = db.Column(db.Text, nullable=True)   # stores base64 or URL
    business_type = db.Column(db.String(50), nullable=True)
    verification_id = db.Column(db.String(100), nullable=True)  # govt reg ID for receivers
    operating_hours = db.Column(db.String(100), nullable=True)

    # Account verification (email confirmation)
    verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(100), nullable=True)
    verification_expiry = db.Column(db.DateTime, nullable=True)

    # Admin approval status
    status = db.Column(db.String(20), default='pending')  # pending | approved | rejected | suspended

    # Password reset
    reset_token = db.Column(db.String(100), nullable=True)
    reset_expiry = db.Column(db.DateTime, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    donations = db.relationship('Donation', backref='donor', lazy='dynamic',
                                foreign_keys='Donation.donor_id')
    pickup_requests = db.relationship('PickupRequest', backref='receiver', lazy='dynamic',
                                      foreign_keys='PickupRequest.receiver_id')
    notifications = db.relationship('Notification', backref='user', lazy='dynamic',
                                    foreign_keys='Notification.user_id')
    sent_messages = db.relationship('Message', backref='sender', lazy='dynamic',
                                    foreign_keys='Message.sender_id')
    received_messages = db.relationship('Message', backref='recipient', lazy='dynamic',
                                        foreign_keys='Message.receiver_id')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'organization': self.organization,
            'phone': self.phone,
            'address': self.address,
            'profile_image': self.profile_image,
            'business_type': self.business_type,
            'verification_id': self.verification_id,
            'operating_hours': self.operating_hours,
            'verified': self.verified,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class Donation(db.Model):
    __tablename__ = 'donations'

    id = db.Column(db.Integer, primary_key=True)
    donor_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    food_name = db.Column(db.String(150), nullable=False)
    food_type = db.Column(db.String(50), nullable=False)   # Cooked Rice, Curry, etc.
    category = db.Column(db.String(50), nullable=True)      # main, snacks, dessert, etc.
    veg_type = db.Column(db.String(20), nullable=True)      # veg | nonveg | vegan
    quantity = db.Column(db.String(50), nullable=False)     # "50 meals" or "10 kg"
    quantity_number = db.Column(db.Float, nullable=True)
    unit = db.Column(db.String(20), nullable=True)          # meals | kg
    description = db.Column(db.Text, nullable=True)
    special_instructions = db.Column(db.Text, nullable=True)
    image = db.Column(db.Text, nullable=True)               # base64 or URL

    # Location
    pickup_address = db.Column(db.String(255), nullable=False)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)

    # Timing
    pickup_time = db.Column(db.DateTime, nullable=True)
    expiry_time = db.Column(db.DateTime, nullable=False)
    preparation_time = db.Column(db.String(50), nullable=True)
    preferred_pickup_time = db.Column(db.String(50), nullable=True)

    # Legacy expiry-analysis fields retained for backward compatibility with older records
    predicted_expiry = db.Column(db.DateTime, nullable=True)
    freshness_score = db.Column(db.Integer, nullable=True)
    risk_level = db.Column(db.String(20), nullable=True)    # Green | Yellow | Red
    ai_recommendation = db.Column(db.Text, nullable=True)

    status = db.Column(db.String(20), default='Available')
    # Available | Requested | Approved | Completed | Expired
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    pickup_requests = db.relationship('PickupRequest', backref='donation', lazy='dynamic',
                                      cascade='all, delete-orphan')

    def to_dict(self):
        donor = User.query.get(self.donor_id)
        return {
            'id': self.id,
            'donor_id': self.donor_id,
            'donor_name': donor.name if donor else None,
            'donor_organization': donor.organization if donor else None,
            'food_name': self.food_name,
            'food_type': self.food_type,
            'category': self.category,
            'veg_type': self.veg_type,
            'quantity': self.quantity,
            'quantity_number': self.quantity_number,
            'unit': self.unit,
            'description': self.description,
            'special_instructions': self.special_instructions,
            'image': self.image,
            'pickup_address': self.pickup_address,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'pickup_time': self.pickup_time.isoformat() if self.pickup_time else None,
            'expiry_time': self.expiry_time.isoformat() if self.expiry_time else None,
            'preparation_time': self.preparation_time,
            'preferred_pickup_time': self.preferred_pickup_time,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class PickupRequest(db.Model):
    __tablename__ = 'pickup_requests'

    id = db.Column(db.Integer, primary_key=True)
    donation_id = db.Column(db.Integer, db.ForeignKey('donations.id', ondelete='CASCADE'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)

    status = db.Column(db.String(20), default='Pending')
    # Pending | Approved | Rejected | Completed

    qr_token = db.Column(db.String(100), nullable=True, unique=True)
    qr_used = db.Column(db.Boolean, default=False)

    requested_at = db.Column(db.DateTime, default=datetime.utcnow)
    approved_at = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        donation = Donation.query.get(self.donation_id)
        receiver = User.query.get(self.receiver_id)
        return {
            'id': self.id,
            'donation_id': self.donation_id,
            'receiver_id': self.receiver_id,
            'receiver_name': receiver.name if receiver else None,
            'receiver_organization': receiver.organization if receiver else None,
            'status': self.status,
            'qr_token': self.qr_token if not self.qr_used else None,
            'requested_at': self.requested_at.isoformat() if self.requested_at else None,
            'approved_at': self.approved_at.isoformat() if self.approved_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            # Include donation details for convenience
            'food_type': donation.food_name if donation else None,
            'quantity': donation.quantity_number if donation else None,
            'unit': donation.unit if donation else None,
            'pickup_address': donation.pickup_address if donation else None,
            'donor_name': donation.donor.name if donation and donation.donor else None,
            'donor_organization': donation.donor.organization if donation and donation.donor else None,
        }


class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), nullable=False, default='info')
    # new_donation | pickup_requested | pickup_approved | pickup_rejected |
    # pickup_completed | certificate_generated | info
    is_read = db.Column(db.Boolean, default=False)
    link = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'is_read': self.is_read,
            'link': self.link,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class Message(db.Model):
    __tablename__ = 'messages'

    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'receiver_id': self.receiver_id,
            'message': self.message,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_read': self.is_read,
        }


class Certificate(db.Model):
    __tablename__ = 'certificates'

    id = db.Column(db.Integer, primary_key=True)
    donation_id = db.Column(db.Integer, db.ForeignKey('donations.id', ondelete='CASCADE'), nullable=False)
    donor_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    certificate_url = db.Column(db.String(255), nullable=True)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        donation = Donation.query.get(self.donation_id)
        donor = User.query.get(self.donor_id)
        receiver = User.query.get(self.receiver_id)
        return {
            'id': self.id,
            'donation_id': self.donation_id,
            'donor_id': self.donor_id,
            'receiver_id': self.receiver_id,
            'certificate_url': self.certificate_url,
            'generated_at': self.generated_at.isoformat() if self.generated_at else None,
            'donation': donation.to_dict() if donation else None,
            'donor_name': donor.name if donor else None,
            'donor_organization': donor.organization if donor else None,
            'receiver_name': receiver.name if receiver else None,
            'receiver_organization': receiver.organization if receiver else None,
        }
