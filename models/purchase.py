from datetime import datetime
from extensions import db


class Purchase(db.Model):
    __tablename__ = "purchases"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    supplier_id = db.Column(
        db.Integer,
        db.ForeignKey("suppliers.id"),
        nullable=False
    )

    purchase_date = db.Column(
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

    supplier = db.relationship(
        "Supplier",
        backref="purchases"
    )

    items = db.relationship(
        "PurchaseItem",
        backref="purchase",
        cascade="all, delete-orphan"
    )