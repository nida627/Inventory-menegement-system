from flask import Blueprint, request, jsonify

from extensions import db
from models.purchase import Purchase
from models.purchase_item import PurchaseItem
from models.supplier import Supplier
from models.product import Product

from routes.auth import admin_required, manager_required, staff_required
from services.inventory_service import increase_stock
from services.purchase_service import create_purchase


purchase_bp = Blueprint(
    "purchases",
    __name__,
    url_prefix="/api/purchases"
)


# ==========================================
# CREATE PURCHASE
# ==========================================

@purchase_bp.route("", methods=["POST"])
@manager_required
def create_purchase_route():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    supplier_id = data.get("supplier_id")
    items = data.get("items")

    if not supplier_id:
        return jsonify({
            "error": "Supplier ID is required"
        }), 400

    if not items:
        return jsonify({
            "error": "Purchase items are required"
        }), 400

    try:
        purchase = create_purchase(
            supplier_id=supplier_id,
            items=items
        )

        return jsonify({
            "message": "Purchase created successfully",
            "purchase": {
                "id": purchase.id,
                "supplier_id": purchase.supplier_id,
                "total_amount": float(purchase.total_amount),
                "status": purchase.status
            }
        }), 201

    except ValueError as e:
        return jsonify({
            "error": str(e)
        }), 400

    except Exception:
        return jsonify({
            "error": "Failed to create purchase"
        }), 500


# ==========================================
# GET ALL PURCHASES
# ==========================================

@purchase_bp.route("", methods=["GET"])
@staff_required
def get_purchases():

    purchases = Purchase.query.order_by(
        Purchase.id.desc()
    ).all()

    result = []

    for purchase in purchases:

        result.append({
            "id": purchase.id,
            "supplier_id": purchase.supplier_id,
            "supplier_name": purchase.supplier.name,
            "purchase_date": purchase.purchase_date,
            "total_amount": float(purchase.total_amount),
            "status": purchase.status
        })

    return jsonify({
        "purchases": result
    }), 200


# ==========================================
# GET SINGLE PURCHASE
# ==========================================

@purchase_bp.route("/<int:purchase_id>", methods=["GET"])
@staff_required
def get_purchase(purchase_id):

    purchase = Purchase.query.get(purchase_id)

    if not purchase:
        return jsonify({
            "error": "Purchase not found"
        }), 404

    items = []

    for item in purchase.items:

        items.append({
            "id": item.id,
            "product_id": item.product_id,
            "product_name": item.product.name,
            "quantity": item.quantity,
            "unit_price": float(item.unit_price),
            "subtotal": float(item.subtotal)
        })

    return jsonify({
        "id": purchase.id,
        "supplier_id": purchase.supplier_id,
        "supplier_name": purchase.supplier.name,
        "purchase_date": purchase.purchase_date,
        "total_amount": float(purchase.total_amount),
        "status": purchase.status,
        "items": items
    }), 200


# ==========================================
# DELETE PURCHASE
# ==========================================

@purchase_bp.route("/<int:purchase_id>", methods=["DELETE"])
@admin_required
def delete_purchase(purchase_id):

    purchase = Purchase.query.get(purchase_id)

    if not purchase:
        return jsonify({
            "error": "Purchase not found"
        }), 404

    return jsonify({
        "error": "Completed purchases cannot be deleted"
    }), 400