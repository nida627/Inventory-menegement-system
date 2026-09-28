from flask import Blueprint, request, jsonify

from extensions import db
from models.product import Product
from models.category import Category
from routes.auth import admin_required, manager_required, staff_required
from services.inventory_service import adjust_stock

product_bp = Blueprint(
    "products",
    __name__,
    url_prefix="/api/products"
)


# =========================
# CREATE PRODUCT
# =========================
@product_bp.route("", methods=["POST"])
@manager_required
def create_product():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    name = data.get("name")
    sku = data.get("sku")
    description = data.get("description")
    price = data.get("price")
    quantity = data.get("quantity", 0)
    opening_cost = data.get("opening_cost")
    minimum_stock = data.get("minimum_stock", 5)
    category_id = data.get("category_id")

    if not name or not sku or price is None or category_id is None:
        return jsonify({
            "error": "Name, SKU, price and category_id are required"
        }), 400

    if price < 0:
        return jsonify({
            "error": "Price cannot be negative"
        }), 400

    if quantity < 0:
        return jsonify({
            "error": "Quantity cannot be negative"
        }), 400

    if minimum_stock < 0:
        return jsonify({
            "error": "Minimum stock cannot be negative"
        }), 400
        
        
    if opening_cost is not None and opening_cost < 0:
         return jsonify({
            "error": "Opening cost cannot be negative"
        }), 400

    existing_product = Product.query.filter_by(
        sku=sku
    ).first()

    if existing_product:
        return jsonify({
            "error": "SKU already exists"
        }), 409

    category = Category.query.get(category_id)

    if not category:
        return jsonify({
            "error": "Category not found"
        }), 404

    try:

        # Create product with zero stock first
        product = Product(
            name=name,
            sku=sku,
            description=description,
            price=price,
            average_cost=opening_cost if opening_cost is not None else 0,
            quantity=0,
            minimum_stock=minimum_stock,
            category_id=category_id
        )

        db.session.add(product)

        # Generate product ID
        db.session.flush()

        # Add initial stock through inventory service
        if quantity > 0:

            adjust_stock(
                product_id=product.id,
                quantity=quantity,
                note="Opening stock"
            )

        db.session.commit()

        return jsonify({
            "message": "Product created successfully",
            "product": {
                "id": product.id,
                "name": product.name,
                "sku": product.sku,
                "description": product.description,
                "price": float(product.price),
                "average_cost": float(product.average_cost or 0),
                "quantity": product.quantity,
                "minimum_stock": product.minimum_stock,
                "category_id": product.category_id
            }
        }), 201

    except Exception:

        db.session.rollback()

        return jsonify({
            "error": "Something went wrong while creating product"
        }), 500


# =========================
# GET ALL PRODUCTS
# =========================
@product_bp.route("", methods=["GET"])
@staff_required
def get_products():

    products = Product.query.all()

    result = []

    for product in products:
        result.append({
            "id": product.id,
            "name": product.name,
            "sku": product.sku,
            "description": product.description,
            "price": product.price,
            "quantity": product.quantity,
            "minimum_stock": product.minimum_stock,
            "category_id": product.category_id,
            "category_name": product.category.name
        })

    return jsonify({
        "products": result
    }), 200


# =========================
# GET SINGLE PRODUCT
# =========================
@product_bp.route("/<int:product_id>", methods=["GET"])
@staff_required
def get_product(product_id):

    product = Product.query.get(product_id)

    if not product:
        return jsonify({
            "error": "Product not found"
        }), 404

    return jsonify({
        "id": product.id,
        "name": product.name,
        "sku": product.sku,
        "description": product.description,
        "price": product.price,
        "quantity": product.quantity,
        "minimum_stock": product.minimum_stock,
        "category_id": product.category_id,
        "category_name": product.category.name
    }), 200


# =========================
# UPDATE PRODUCT
# =========================
@product_bp.route("/<int:product_id>", methods=["PUT"])
@manager_required
def update_product(product_id):

    product = Product.query.get(product_id)

    if not product:
        return jsonify({
            "error": "Product not found"
        }), 404

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    if "name" in data:
        if not data["name"]:
            return jsonify({
                "error": "Product name cannot be empty"
            }), 400

        product.name = data["name"]

    if "sku" in data:

        if not data["sku"]:
            return jsonify({
                "error": "SKU cannot be empty"
            }), 400

        existing_product = Product.query.filter(
            Product.sku == data["sku"],
            Product.id != product_id
        ).first()

        if existing_product:
            return jsonify({
                "error": "SKU already exists"
            }), 409

        product.sku = data["sku"]

    if "description" in data:
        product.description = data["description"]

    if "price" in data:

        if data["price"] < 0:
            return jsonify({
                "error": "Price cannot be negative"
            }), 400

        product.price = data["price"]
    

    if "minimum_stock" in data:

        if data["minimum_stock"] < 0:
            return jsonify({
                "error": "Minimum stock cannot be negative"
            }), 400

        product.minimum_stock = data["minimum_stock"]

    if "category_id" in data:

        category = Category.query.get(
            data["category_id"]
        )

        if not category:
            return jsonify({
                "error": "Category not found"
            }), 404

        product.category_id = data["category_id"]

    db.session.commit()

    return jsonify({
        "message": "Product updated successfully"
    }), 200


# =========================
# DELETE PRODUCT
# =========================
@product_bp.route("/<int:product_id>", methods=["DELETE"])
@admin_required
def delete_product(product_id):

    product = Product.query.get(product_id)

    if not product:
        return jsonify({
            "error": "Product not found"
        }), 404

    db.session.delete(product)
    db.session.commit()

    return jsonify({
        "message": "Product deleted successfully"
    }), 200