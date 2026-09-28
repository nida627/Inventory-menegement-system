from datetime import datetime
from extensions import db


class Supplier(db.Model):
    __tablename__ = "suppliers"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(
        db.String(100),
        nullable=False
    )

    company_name = db.Column(
        db.String(150)
    )

    email = db.Column(
        db.String(120),
        unique=True
    )

    phone = db.Column(
        db.String(20)
    )

    address = db.Column(
        db.String(255)
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )