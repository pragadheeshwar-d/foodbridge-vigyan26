"""
Database initialization script.
Creates all tables and seeds core demo data.

Usage:
    cd backend
    .\\venv\\Scripts\\python init_db.py      (Windows)
    source venv/bin/activate && python init_db.py  (Linux/Mac)
"""
from datetime import datetime, timedelta

import bcrypt

from app import create_app
from extensions import db
from models import Donation, PickupRequest, User


app = create_app()


def _hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


with app.app_context():
    db.create_all()
    print("All database tables created.")

    admin = User.query.filter_by(email="admin@foodbridge.com").first()
    if not admin:
        admin = User(
            name="FoodBridge Admin",
            email="admin@foodbridge.com",
            password=_hash("Admin@1234"),
            role="super_admin",
            organization="FoodBridge",
            verified=True,
            status="approved",
        )
        db.session.add(admin)
        db.session.flush()
        print("Admin user created -> admin@foodbridge.com / Admin@1234")
    else:
        print("Admin user already exists.")

    donor = User.query.filter_by(email="demo.donor@foodbridge.com").first()
    if not donor:
        donor = User(
            name="Demo Donor",
            email="demo.donor@foodbridge.com",
            password=_hash("Demo@1234"),
            role="donor",
            organization="Sunrise Restaurant",
            phone="9000000001",
            address="T. Nagar, Chennai",
            business_type="Restaurant",
            verified=True,
            status="approved",
        )
        db.session.add(donor)
        db.session.flush()
        print("Demo donor created.")
    else:
        print("Demo donor already exists.")

    receiver = User.query.filter_by(email="demo.receiver@foodbridge.com").first()
    if not receiver:
        receiver = User(
            name="Pragadheeshwar D",
            email="demo.receiver@foodbridge.com",
            password=_hash("Demo@1234"),
            role="receiver",
            organization="Pragadhees NGO",
            phone="9000000002",
            address="Chennai, Tamil Nadu",
            verification_id="TN-NGO-2026-001",
            operating_hours="9:00 AM - 6:00 PM",
            verified=True,
            status="approved",
        )
        db.session.add(receiver)
        db.session.flush()
        print("Demo receiver created.")
    else:
        print("Demo receiver already exists.")

    available_donation = Donation.query.filter_by(food_name="Veg Meal Pack").first()
    if not available_donation:
        available_donation = Donation(
            donor_id=donor.id,
            food_name="Veg Meal Pack",
            food_type="Cooked Meals",
            category="main",
            veg_type="veg",
            quantity="120 meals",
            quantity_number=120,
            unit="meals",
            description="Fresh vegetarian meals ready for pickup.",
            pickup_address="T. Nagar, Chennai",
            latitude=13.0418,
            longitude=80.2341,
            pickup_time=datetime.utcnow() + timedelta(hours=2),
            expiry_time=datetime.utcnow() + timedelta(hours=6),
            preparation_time="12:00",
            preferred_pickup_time="Within 2 hours",
            status="Available",
        )
        db.session.add(available_donation)
        db.session.flush()
        print("Available donation created.")
    else:
        print("Available donation already exists.")

    completed_donation = Donation.query.filter_by(food_name="Bread and Fruit Pack").first()
    if not completed_donation:
        completed_donation = Donation(
            donor_id=donor.id,
            food_name="Bread and Fruit Pack",
            food_type="Packaged Food",
            category="snacks",
            veg_type="veg",
            quantity="80 meals",
            quantity_number=80,
            unit="meals",
            description="Packaged food items for community distribution.",
            pickup_address="Mylapore, Chennai",
            latitude=13.0339,
            longitude=80.2619,
            pickup_time=datetime.utcnow() - timedelta(days=1),
            expiry_time=datetime.utcnow() + timedelta(hours=8),
            preparation_time="08:00",
            preferred_pickup_time="Morning",
            status="Completed",
        )
        db.session.add(completed_donation)
        db.session.flush()
        print("Completed donation created.")
    else:
        print("Completed donation already exists.")

    approved_pickup = PickupRequest.query.filter_by(
        donation_id=available_donation.id,
        receiver_id=receiver.id,
        status="Approved",
    ).first()
    if not approved_pickup:
        approved_pickup = PickupRequest(
            donation_id=available_donation.id,
            receiver_id=receiver.id,
            status="Approved",
            requested_at=datetime.utcnow() - timedelta(hours=3),
            approved_at=datetime.utcnow() - timedelta(hours=1),
        )
        db.session.add(approved_pickup)
        print("Approved pickup request created.")
    else:
        print("Approved pickup request already exists.")

    completed_pickup = PickupRequest.query.filter_by(
        donation_id=completed_donation.id,
        receiver_id=receiver.id,
        status="Completed",
    ).first()
    if not completed_pickup:
        completed_pickup = PickupRequest(
            donation_id=completed_donation.id,
            receiver_id=receiver.id,
            status="Completed",
            requested_at=datetime.utcnow() - timedelta(days=2),
            approved_at=datetime.utcnow() - timedelta(days=1, hours=3),
            completed_at=datetime.utcnow() - timedelta(hours=2),
        )
        db.session.add(completed_pickup)
        print("Completed pickup request created.")
    else:
        print("Completed pickup request already exists.")

    db.session.commit()
    print("Database initialization complete.")
