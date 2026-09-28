from flask import Blueprint, request, jsonify

from extensions import db
from models.sale import Sale
from models.sale_item import SaleItem
from models.customer import Customer
from models.product import Product

from routes.auth import admin_required, manager_required, staff_required
from services.sales_service import (
    create_sale as create_sale_service,
    cancel_sale as cancel_sale_service
)


sale_bp = Blueprint(
    "sales",
    __name__,
    url_prefix="/api/sales"
)

# Create Sale
@sale_bp.route("", methods=["POST"])
@staff_required
def create_sale():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    customer_id = data.get("customer_id")
    items = data.get("items")

    if not customer_id:
        return jsonify({
            "error": "Customer ID is required"
        }), 400

    if not items or not isinstance(items, list):
        return jsonify({
            "error": "Items must be a non-empty list"
        }), 400

    try:

        sale = create_sale_service(
            customer_id=customer_id,
            items=items
        )

        return jsonify({
            "message": "Sale created successfully",
            "sale": {
                "id": sale.id,
                "customer_id": sale.customer_id,
                "customer_name": sale.customer.name,
                "total_amount": float(sale.total_amount),
                "status": sale.status
            }
        }), 201

    except ValueError as e:

        return jsonify({
            "error": str(e)
        }), 400

    except Exception:

        return jsonify({
            "error": "Something went wrong while creating sale"
        }), 500


# Get All Sales
@sale_bp.route("", methods=["GET"])
@staff_required
def get_sales():

    sales = Sale.query.order_by(
        Sale.id.desc()
    ).all()

    result = []

    for sale in sales:

        result.append({
            "id": sale.id,
            "customer_id": sale.customer_id,
            "customer_name": sale.customer.name,
            "sale_date": sale.sale_date,
            "total_amount": float(sale.total_amount),
            "status": sale.status
        })

    return jsonify({
        "sales": result
    }), 200


# Get Single Sale
@sale_bp.route("/<int:sale_id>", methods=["GET"])
@staff_required
def get_sale(sale_id):

    sale = Sale.query.get(sale_id)

    if not sale:
        return jsonify({
            "error": "Sale not found"
        }), 404

    items = []

    for item in sale.items:

        items.append({
            "id": item.id,
            "product_id": item.product_id,
            "product_name": item.product.name,
            "quantity": item.quantity,
            "unit_price": float(item.unit_price),
            "subtotal": float(item.subtotal)
        })

    return jsonify({
        "id": sale.id,
        "customer_id": sale.customer_id,
        "customer_name": sale.customer.name,
        "sale_date": sale.sale_date,
        "total_amount": float(sale.total_amount),
        "status": sale.status,
        "items": items
    }), 200


# cancel Sale
@sale_bp.route("/<int:sale_id>/cancel", methods=["PUT"])
@staff_required
def cancel_sale(sale_id):

    try:
        sale = cancel_sale_service(sale_id)

        return jsonify({
            "message": "Sale cancelled successfully",
            "sale": {
                "id": sale.id,
                "customer_id": sale.customer_id,
                "total_amount": float(sale.total_amount),
                "status": sale.status
            }
        }), 200

    except ValueError as e:
        return jsonify({
            "error": str(e)
        }), 400

    except Exception:
        return jsonify({
            "error": "Something went wrong while cancelling sale"
        }), 500