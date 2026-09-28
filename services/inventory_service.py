from extensions import db
from models.product import Product
from models.stock_movement import StockMovement


def increase_stock(
    product_id,
    quantity,
    reference_type=None,
    reference_id=None,
    note=None
):
    """
    Increase product stock and create a stock movement record.
    """

    if quantity <= 0:
        raise ValueError("Quantity must be greater than zero")

    product = Product.query.get(product_id)

    if not product:
        raise ValueError("Product not found")

    # Increase stock
    product.quantity += quantity

    # Create stock movement
    movement = StockMovement(
        product_id=product.id,
        movement_type="purchase",
        quantity=quantity,
        reference_type=reference_type,
        reference_id=reference_id,
        note=note
    )

    db.session.add(movement)

    return product


def decrease_stock(
    product_id,
    quantity,
    reference_type=None,
    reference_id=None,
    note=None
):
    """
    Decrease product stock and create a stock movement record.
    """

    if quantity <= 0:
        raise ValueError("Quantity must be greater than zero")

    product = Product.query.get(product_id)

    if not product:
        raise ValueError("Product not found")

    # Prevent negative stock
    if product.quantity < quantity:
        raise ValueError(
            f"Insufficient stock. Available stock: {product.quantity}"
        )

    # Decrease stock
    product.quantity -= quantity

    # Create stock movement
    movement = StockMovement(
        product_id=product.id,
        movement_type="sale",
        quantity=-quantity,
        reference_type=reference_type,
        reference_id=reference_id,
        note=note
    )

    db.session.add(movement)

    return product


def adjust_stock(
    product_id,
    quantity,
    note=None
):
    """
    Manually adjust product stock.

    Positive quantity = increase
    Negative quantity = decrease
    """

    if quantity == 0:
        raise ValueError("Adjustment quantity cannot be zero")

    product = Product.query.get(product_id)

    if not product:
        raise ValueError("Product not found")

    new_quantity = product.quantity + quantity

    # Prevent negative stock
    if new_quantity < 0:
        raise ValueError(
            f"Adjustment would result in negative stock. "
            f"Available stock: {product.quantity}"
        )

    # Update stock
    product.quantity = new_quantity

    movement = StockMovement(
        product_id=product.id,
        movement_type="adjustment",
        quantity=quantity,
        reference_type="adjustment",
        reference_id=None,
        note=note
    )

    db.session.add(movement)

    return product