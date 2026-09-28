from decimal import Decimal

from sqlalchemy import func

from extensions import db

from models import (
    Product,
    Sale,
    SaleItem,
    Purchase,
    PurchaseItem
)


def get_stock_report():
    """
    Generate current stock report.
    """

    products = Product.query.order_by(
        Product.id.asc()
    ).all()

    report = []

    for product in products:

        category_name = (
            product.category.name
            if product.category
            else "-"
        )

        if product.quantity == 0:
            stock_status = "Out of Stock"

        elif product.quantity <= product.minimum_stock:
            stock_status = "Low Stock"

        else:
            stock_status = "In Stock"

        report.append({
            "product_id": product.id,
            "product_name": product.name,
            "sku": product.sku,
            "category": category_name,
            "quantity": product.quantity,
            "minimum_stock": product.minimum_stock,
            "average_cost": (
                float(product.average_cost)
                if product.average_cost is not None
                else 0.0
            ),
            "selling_price": (
                float(product.price)
                if product.price is not None
                else 0.0
            ),
            "stock_status": stock_status
        })

    return report


def get_sales_report():
    """
    Generate sales report.
    """

    sales = Sale.query.order_by(
        Sale.id.desc()
    ).all()

    report = []

    for sale in sales:

        customer_name = (
            sale.customer.name
            if sale.customer
            else "-"
        )

        report.append({
            "sale_id": sale.id,
            "customer_id": sale.customer_id,
            "customer_name": customer_name,
            "sale_date": sale.sale_date,
            "total_amount": float(
                sale.total_amount or 0
            ),
            "status": sale.status
        })

    return report


def get_purchase_report():
    """
    Generate purchase report.
    """

    purchases = Purchase.query.order_by(
        Purchase.id.desc()
    ).all()

    report = []

    for purchase in purchases:

        supplier_name = (
            purchase.supplier.name
            if purchase.supplier
            else "-"
        )

        report.append({
            "purchase_id": purchase.id,
            "supplier_id": purchase.supplier_id,
            "supplier_name": supplier_name,
            "purchase_date": purchase.purchase_date,
            "total_amount": float(
                purchase.total_amount or 0
            ),
            "status": purchase.status
        })

    return report


def get_profit_report():
    """
    Generate gross profit report.

    Revenue = Selling Price × Quantity

    COGS = Cost Price × Quantity

    Gross Profit = Revenue - COGS

    Purchase total is shown separately because
    purchasing stock is not the same as COGS.
    """

    # ==========================================
    # TOTAL SALES REVENUE
    # ==========================================

    total_sales = db.session.query(
        func.coalesce(
            func.sum(SaleItem.subtotal),
            0
        )
    ).join(
        Sale,
        Sale.id == SaleItem.sale_id
    ).filter(
        Sale.status == "completed"
    ).scalar()

    # ==========================================
    # TOTAL PURCHASE VALUE
    # ==========================================

    total_purchases = db.session.query(
        func.coalesce(
            func.sum(PurchaseItem.subtotal),
            0
        )
    ).join(
        Purchase,
        Purchase.id == PurchaseItem.purchase_id
    ).filter(
        Purchase.status == "completed"
    ).scalar()

    # ==========================================
    # COST OF GOODS SOLD
    # ==========================================

    total_cogs = db.session.query(
        func.coalesce(
            func.sum(
                SaleItem.cost_price *
                SaleItem.quantity
            ),
            0
        )
    ).join(
        Sale,
        Sale.id == SaleItem.sale_id
    ).filter(
        Sale.status == "completed",
        SaleItem.cost_price.isnot(None)
    ).scalar()

    # ==========================================
    # GROSS PROFIT
    # ==========================================

    gross_profit = (
        total_sales - total_cogs
    )

    # ==========================================
    # PROFIT MARGIN
    # ==========================================

    if total_sales > 0:

        profit_margin = (
            gross_profit / total_sales
        ) * 100

    else:

        profit_margin = Decimal("0.00")

    return {
        "total_sales": float(total_sales),
        "total_purchases": float(total_purchases),
        "cogs": float(total_cogs),
        "profit": float(gross_profit),
        "gross_profit": float(gross_profit),
        "profit_margin": float(profit_margin)
    }