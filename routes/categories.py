from flask import Blueprint, request, jsonify

from extensions import db
from models.category import Category
from routes.auth import admin_required, manager_required, staff_required


category_bp = Blueprint(
    "categories",
    __name__,
    url_prefix="/api/categories"
)


# =========================
# CREATE CATEGORY
# =========================
@category_bp.route("", methods=["POST"])
@manager_required
def create_category():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    name = data.get("name")
    description = data.get("description")

    if not name:
        return jsonify({
            "error": "Category name is required"
        }), 400

    existing_category = Category.query.filter_by(
        name=name
    ).first()

    if existing_category:
        return jsonify({
            "error": "Category already exists"
        }), 409

    category = Category(
        name=name,
        description=description
    )

    db.session.add(category)
    db.session.commit()

    return jsonify({
        "message": "Category created successfully",
        "category": {
            "id": category.id,
            "name": category.name,
            "description": category.description
        }
    }), 201


# =========================
# GET ALL CATEGORIES
# =========================
@category_bp.route("", methods=["GET"])
@staff_required
def get_categories():

    categories = Category.query.all()

    result = []

    for category in categories:
        result.append({
            "id": category.id,
            "name": category.name,
            "description": category.description,
            "created_at": category.created_at
        })

    return jsonify({
        "categories": result
    }), 200


# =========================
# GET SINGLE CATEGORY
# =========================
@category_bp.route("/<int:category_id>", methods=["GET"])
@manager_required
def get_category(category_id):

    category = Category.query.get(category_id)

    if not category:
        return jsonify({
            "error": "Category not found"
        }), 404

    return jsonify({
        "id": category.id,
        "name": category.name,
        "description": category.description,
        "created_at": category.created_at
    }), 200


# =========================
# UPDATE CATEGORY
# =========================
@category_bp.route("/<int:category_id>", methods=["PUT"])
@manager_required
def update_category(category_id):

    category = Category.query.get(category_id)

    if not category:
        return jsonify({
            "error": "Category not found"
        }), 404

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    name = data.get("name")
    description = data.get("description")

    if name:
        existing_category = Category.query.filter(
            Category.name == name,
            Category.id != category_id
        ).first()

        if existing_category:
            return jsonify({
                "error": "Category name already exists"
            }), 409

        category.name = name

    if description is not None:
        category.description = description

    db.session.commit()

    return jsonify({
        "message": "Category updated successfully",
        "category": {
            "id": category.id,
            "name": category.name,
            "description": category.description
        }
    }), 200


# =========================
# DELETE CATEGORY
# =========================
@category_bp.route("/<int:category_id>", methods=["DELETE"])
@admin_required
def delete_category(category_id):

    category = Category.query.get(category_id)

    if not category:
        return jsonify({
            "error": "Category not found"
        }), 404

    db.session.delete(category)
    db.session.commit()

    return jsonify({
        "message": "Category deleted successfully"
    }), 200