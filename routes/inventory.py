from flask import Blueprint, request, jsonify
from extensions import db
from models.product import Product
from models.stock_movement import StockMovement

from routes.auth import admin_required, manager_required, staff_required
from services.inventory_service import adjust_stock

inventory_bp = Blueprint(
    "inventory",
    __name__,
    url_prefix="/api/inventory"
)


# ==========================================
# GET CURRENT INVENTORY
# ==========================================

@inventory_bp.route("", methods=["GET"])
@staff_required
def get_inventory():

    products = Product.query.order_by(
        Product.id.asc()
    ).all()

    result = []

    for product in products:

        if product.quantity == 0:
            stock_status = "out_of_stock"
        elif product.quantity <= product.minimum_stock:
            stock_status = "low_stock"
        else:
            stock_status = "normal"

        result.append({
        "product_id": product.id,
        "name": product.name,
        "sku": product.sku,
        "category": product.category.name,
        "quantity": product.quantity,
        "minimum_stock": product.minimum_stock,
        "stock_status": stock_status
    })

    return jsonify({
        "inventory": result
    }), 200


# ==========================================
# GET LOW STOCK PRODUCTS
# ==========================================

@inventory_bp.route("/low-stock", methods=["GET"])
@staff_required
def get_low_stock():

    products = Product.query.filter(
        Product.quantity > 0,
        Product.quantity <= Product.minimum_stock
    ).all()

    result = []

    for product in products:

        result.append({
            "product_id": product.id,
            "name": product.name,
            "sku": product.sku,
            "quantity": product.quantity,
            "minimum_stock": product.minimum_stock,
            "stock_status": "low_stock"
        })

    return jsonify({
        "low_stock_products": result
    }), 200


# ==========================================
# GET OUT OF STOCK PRODUCTS
# ==========================================

@inventory_bp.route("/out-of-stock", methods=["GET"])
@staff_required
def get_out_of_stock():

    products = Product.query.filter_by(
        quantity=0
    ).all()

    result = []

    for product in products:

        result.append({
            "product_id": product.id,
            "name": product.name,
            "sku": product.sku,
            "quantity": product.quantity,
            "minimum_stock": product.minimum_stock,
            "stock_status": "out_of_stock"
        })

    return jsonify({
        "out_of_stock_products": result
    }), 200


# ==========================================
# GET STOCK MOVEMENTS
# ==========================================

@inventory_bp.route("/movements", methods=["GET"])
@staff_required
def get_stock_movements():

    movements = StockMovement.query.order_by(
        StockMovement.id.desc()
    ).all()

    result = []

    for movement in movements:

        result.append({
            "id": movement.id,
            "product_id": movement.product_id,
            "product_name": movement.product.name,
            "movement_type": movement.movement_type,
            "quantity": movement.quantity,
            "reference_type": movement.reference_type,
            "reference_id": movement.reference_id,
            "note": movement.note,
            "created_at": movement.created_at
        })

    return jsonify({
        "movements": result
    }), 200

# MANUAL STOCK ADJUSTMENT
@inventory_bp.route("/adjust", methods=["POST"])
@manager_required
def adjust_inventory():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    product_id = data.get("product_id")
    quantity = data.get("quantity")
    note = data.get("note")

    if not product_id:
        return jsonify({
            "error": "Product ID is required"
        }), 400

    if quantity is None:
        return jsonify({
            "error": "Adjustment quantity is required"
        }), 400

    try:

        product = adjust_stock(
            product_id=product_id,
            quantity=quantity,
            note=note
        )

        db.session.commit()

        return jsonify({
            "message": "Stock adjusted successfully",
            "product": {
                "id": product.id,
                "name": product.name,
                "quantity": product.quantity
            }
        }), 200

    except ValueError as e:

        db.session.rollback()

        return jsonify({
            "error": str(e)
        }), 400

    except Exception:

        db.session.rollback()

        return jsonify({
            "error": "Something went wrong while adjusting stock"
        }), 500