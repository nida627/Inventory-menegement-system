from extensions import db


class PurchaseItem(db.Model):
    __tablename__ = "purchase_items"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    purchase_id = db.Column(
        db.Integer,
        db.ForeignKey("purchases.id"),
        nullable=False
    )

    product_id = db.Column(
        db.Integer,
        db.ForeignKey("products.id"),
        nullable=False
    )

    quantity = db.Column(
        db.Integer,
        nullable=False
    )

    unit_price = db.Column(
        db.Numeric(10, 2),
        nullable=False
    )

    subtotal = db.Column(
        db.Numeric(10, 2),
        nullable=False
    )

    product = db.relationship(
        "Product",
        backref="purchase_items"
    )