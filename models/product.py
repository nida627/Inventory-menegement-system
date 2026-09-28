from datetime import datetime
from extensions import db


class Product(db.Model):

    __tablename__ = "products"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(150),
        nullable=False
    )

    sku = db.Column(
        db.String(50),
        unique=True,
        nullable=False
    )

    description = db.Column(
        db.String(255)
    )

    # Selling price
    price = db.Column(
        db.Numeric(10, 2),
        nullable=False
    )

    # Average purchase/inventory cost
    average_cost = db.Column(
        db.Numeric(10, 2),
        nullable=False,
        default=0
    )

    # Current stock quantity
    quantity = db.Column(
        db.Integer,
        nullable=False,
        default=0
    )

    minimum_stock = db.Column(
        db.Integer,
        nullable=False,
        default=5
    )

    category_id = db.Column(
        db.Integer,
        db.ForeignKey("categories.id"),
        nullable=False
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

    category = db.relationship(
        "Category",
        backref="products"
    )