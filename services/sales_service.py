from decimal import Decimal

from extensions import db
from models import (
    Sale,
    SaleItem,
    Customer,
    Product,
    StockMovement
)

from services.inventory_service import decrease_stock


def create_sale(customer_id, items):
    """
    Create a sale.

    Business logic:

    Selling Price = Product.price
    Cost Price = Product.average_cost

    Revenue = Selling Price × Quantity
    COGS = Cost Price × Quantity
    Gross Profit = Revenue - COGS

    SaleItem stores both selling price and cost price
    so historical profit remains correct.
    """

    try:

        # ------------------------------------------
        # 1. Check customer
        # ------------------------------------------

        customer = Customer.query.get(customer_id)

        if not customer:
            raise ValueError("Customer not found")

        # ------------------------------------------
        # 2. Validate items
        # ------------------------------------------

        if not items or not isinstance(items, list):
            raise ValueError("Sale items are required")

        # ------------------------------------------
        # 3. Create sale
        # ------------------------------------------

        sale = Sale(
            customer_id=customer_id
        )

        db.session.add(sale)

        # Generate sale ID
        db.session.flush()

        total_amount = Decimal("0.00")

        # ------------------------------------------
        # 4. Process each item
        # ------------------------------------------

        for item in items:

            product_id = item.get("product_id")
            quantity = item.get("quantity")

            # --------------------------------------
            # Validate product
            # --------------------------------------

            product = Product.query.get(product_id)

            if not product:
                raise ValueError(
                    f"Product with ID {product_id} not found"
                )

            # --------------------------------------
            # Validate quantity
            # --------------------------------------

            if not isinstance(quantity, int) or quantity <= 0:
                raise ValueError(
                    "Quantity must be a positive integer"
                )

            # --------------------------------------
            # Check selling price
            # --------------------------------------

            if product.price is None:
                raise ValueError(
                    f"Selling price is not set for "
                    f"product '{product.name}'"
                )

            selling_price = Decimal(str(product.price))

            if selling_price <= 0:
                raise ValueError(
                    f"Selling price must be greater than zero "
                    f"for product '{product.name}'"
                )

            # --------------------------------------
            # Check cost price
            # --------------------------------------


            print("abDEBUG PRODUCT:", product.id, product.name)
            print("DEBUG PRICE:", product.price)
            print("DEBUG AVERAGE COST:", product.average_cost)       
            if product.average_cost is None:
                raise ValueError(
                    f"Cost price is not available for "
                    f"product '{product.name}'"
                )

            cost_price = Decimal(
                str(product.average_cost)
            )

            if cost_price < 0:
                raise ValueError(
                    f"Invalid cost price for product "
                    f"'{product.name}'"
                )

            # --------------------------------------
            # Check stock
            # --------------------------------------

            if product.quantity < quantity:
                raise ValueError(
                    f"Insufficient stock for "
                    f"'{product.name}'. "
                    f"Available stock: {product.quantity}"
                )

            # --------------------------------------
            # Calculate selling subtotal
            # --------------------------------------

            subtotal = selling_price * quantity

            # --------------------------------------
            # Create SaleItem
            # --------------------------------------

            sale_item = SaleItem(
                sale_id=sale.id,
                product_id=product.id,
                quantity=quantity,

                # Historical selling price
                unit_price=selling_price,

                # Historical cost price
                cost_price=cost_price,

                # Revenue for this item
                subtotal=subtotal
            )

            db.session.add(sale_item)

            # --------------------------------------
            # Decrease stock
            # --------------------------------------

            decrease_stock(
                product_id=product.id,
                quantity=quantity,
                reference_type="sale",
                reference_id=sale.id,
                note=f"Stock reduced from sale #{sale.id}"
            )

            # --------------------------------------
            # Add revenue
            # --------------------------------------

            total_amount += subtotal

        # ------------------------------------------
        # 5. Set sale total
        # ------------------------------------------

        sale.total_amount = total_amount

        # ------------------------------------------
        # 6. Commit
        # ------------------------------------------

        db.session.commit()

        return sale

    except Exception:
        db.session.rollback()
        raise


def cancel_sale(sale_id):
    """
    Cancel a completed sale.

    When a sale is cancelled:
    - Sale status becomes cancelled
    - Sold quantity is returned to stock
    - Stock movement is created

    Cancelled sales are excluded from profit reports.
    """

    try:

        # ------------------------------------------
        # 1. Find sale
        # ------------------------------------------

        sale = Sale.query.get(sale_id)

        if not sale:
            raise ValueError("Sale not found")

        # ------------------------------------------
        # 2. Validate status
        # ------------------------------------------

        if sale.status == "cancelled":
            raise ValueError("Sale is already cancelled")

        if sale.status != "completed":
            raise ValueError(
                "Only completed sales can be cancelled"
            )

        # ------------------------------------------
        # 3. Restore stock
        # ------------------------------------------

        for item in sale.items:

            product = Product.query.get(item.product_id)

            if not product:
                raise ValueError(
                    f"Product with ID {item.product_id} not found"
                )

            product.quantity += item.quantity

            movement = StockMovement(
                product_id=product.id,
                movement_type="adjustment",
                quantity=item.quantity,
                reference_type="sale_cancel",
                reference_id=sale.id,
                note=(
                    f"Stock restored after cancellation "
                    f"of sale #{sale.id}"
                )
            )

            db.session.add(movement)

        # ------------------------------------------
        # 4. Mark sale cancelled
        # ------------------------------------------

        sale.status = "cancelled"

        # ------------------------------------------
        # 5. Commit
        # ------------------------------------------

        db.session.commit()

        return sale

    except Exception:
        db.session.rollback()
        raise