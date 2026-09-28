from datetime import datetime
from extensions import db


class Sale(db.Model):
    __tablename__ = "sales"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    customer_id = db.Column(
        db.Integer,
        db.ForeignKey("customers.id"),
        nullable=False
    )

    sale_date = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    total_amount = db.Column(
        db.Numeric(10, 2),
        nullable=False,
        default=0
    )

    status = db.Column(
        db.String(20),
        nullable=False,
        default="completed"
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    customer = db.relationship(
        "Customer",
        backref="sales"
    )

    items = db.relationship(
        "SaleItem",
        backref="sale",
        cascade="all, delete-orphan"
    )