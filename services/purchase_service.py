from decimal import Decimal

from extensions import db
from models import Purchase, PurchaseItem, Supplier, Product
from services.inventory_service import increase_stock


def create_purchase(supplier_id, items):
    """
    Create a purchase.

    Business logic:
    - Validate supplier
    - Validate products
    - Calculate purchase subtotal
    - Update weighted average cost
    - Increase stock
    - Create stock movement
    - Calculate total purchase amount
    """

    try:

        # ------------------------------------------
        # 1. Check supplier
        # ------------------------------------------

        supplier = Supplier.query.get(supplier_id)

        if not supplier:
            raise ValueError("Supplier not found")

        # ------------------------------------------
        # 2. Validate items
        # ------------------------------------------

        if not items or not isinstance(items, list):
            raise ValueError("Purchase items are required")

        # ------------------------------------------
        # 3. Create purchase
        # ------------------------------------------

        purchase = Purchase(
            supplier_id=supplier_id
        )

        db.session.add(purchase)

        # Generate purchase ID
        db.session.flush()

        total_amount = Decimal("0.00")

        # ------------------------------------------
        # 4. Process every item
        # ------------------------------------------

        for item in items:

            product_id = item.get("product_id")
            quantity = item.get("quantity")
            unit_price = item.get("unit_price")

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
            # Validate purchase price
            # --------------------------------------

            if unit_price is None:
                raise ValueError(
                    "Purchase unit price is required"
                )

            try:
                unit_price = Decimal(str(unit_price))
            except Exception:
                raise ValueError(
                    "Purchase unit price must be a valid number"
                )

            if unit_price <= 0:
                raise ValueError(
                    "Purchase unit price must be greater than zero"
                )

            # --------------------------------------
            # Calculate subtotal
            # --------------------------------------

            subtotal = unit_price * quantity

            # --------------------------------------
            # Create PurchaseItem
            # --------------------------------------

            purchase_item = PurchaseItem(
                purchase_id=purchase.id,
                product_id=product.id,
                quantity=quantity,
                unit_price=unit_price,
                subtotal=subtotal
            )

            db.session.add(purchase_item)

            # --------------------------------------
            # Calculate Weighted Average Cost
            # --------------------------------------

            old_quantity = product.quantity

            old_average_cost = (
                product.average_cost
                if product.average_cost is not None
                else Decimal("0.00")
            )

            new_quantity = old_quantity + quantity

            if new_quantity > 0:

                new_average_cost = (
                    (
                        Decimal(old_quantity) * old_average_cost
                    )
                    +
                    (
                        Decimal(quantity) * unit_price
                    )
                ) / Decimal(new_quantity)

            else:
                new_average_cost = unit_price

            product.average_cost = new_average_cost

            # --------------------------------------
            # Increase stock
            # --------------------------------------

            increase_stock(
                product_id=product.id,
                quantity=quantity,
                reference_type="purchase",
                reference_id=purchase.id,
                note=f"Stock added from purchase #{purchase.id}"
            )

            # --------------------------------------
            # Add to total
            # --------------------------------------

            total_amount += subtotal

        # ------------------------------------------
        # 5. Set purchase total
        # ------------------------------------------

        purchase.total_amount = total_amount

        # ------------------------------------------
        # 6. Commit
        # ------------------------------------------

        db.session.commit()

        return purchase

    except Exception:
        db.session.rollback()
        raise