from flask import Blueprint, jsonify
from sqlalchemy import func

from extensions import db
from models import Product, Sale, Purchase
from routes.auth import staff_required


dashboard_bp = Blueprint(
    "dashboard",
    __name__,
    url_prefix="/api/dashboard"
)


@dashboard_bp.route("/summary", methods=["GET"])
@staff_required
def dashboard_summary():

    total_products = Product.query.count()

    low_stock = Product.query.filter(
        Product.quantity > 0,
        Product.quantity <= Product.minimum_stock
    ).count()

    out_of_stock = Product.query.filter(
        Product.quantity == 0
    ).count()

    total_sales = db.session.query(
        func.coalesce(func.sum(Sale.total_amount), 0)
    ).scalar()

    total_purchases = db.session.query(
        func.coalesce(func.sum(Purchase.total_amount), 0)
    ).scalar()

    return jsonify({
        "total_products": total_products,
        "low_stock": low_stock,
        "out_of_stock": out_of_stock,
        "total_sales": float(total_sales),
        "total_purchases": float(total_purchases)
    }), 200