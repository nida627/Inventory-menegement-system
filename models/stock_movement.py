from datetime import datetime
from extensions import db


class StockMovement(db.Model):
    __tablename__ = "stock_movements"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    product_id = db.Column(
        db.Integer,
        db.ForeignKey("products.id"),
        nullable=False
    )

    movement_type = db.Column(
        db.String(20),
        nullable=False
    )

    quantity = db.Column(
        db.Integer,
        nullable=False
    )

    reference_type = db.Column(
        db.String(20)
    )

    reference_id = db.Column(
        db.Integer
    )

    note = db.Column(
        db.String(255)
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    product = db.relationship(
        "Product",
        backref="stock_movements"
    )