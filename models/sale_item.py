from extensions import db


class SaleItem(db.Model):

    __tablename__ = "sale_items"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    sale_id = db.Column(
        db.Integer,
        db.ForeignKey("sales.id"),
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

    # Selling price
    unit_price = db.Column(
        db.Numeric(10, 2),
        nullable=False
    )

    # Purchase/inventory cost at the time of sale
    cost_price = db.Column(
        db.Numeric(10, 2),
        nullable=True
    )

    # Selling price × quantity
    subtotal = db.Column(
        db.Numeric(10, 2),
        nullable=False
    )

    product = db.relationship(
        "Product",
        backref="sale_items"
    )