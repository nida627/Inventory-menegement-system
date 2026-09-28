from flask import Blueprint, request, jsonify

from extensions import db
from models.supplier import Supplier
from routes.auth import admin_required, manager_required, staff_required


supplier_bp = Blueprint(
    "suppliers",
    __name__,
    url_prefix="/api/suppliers"
)


# =========================
# CREATE SUPPLIER
# =========================
@supplier_bp.route("", methods=["POST"])
@manager_required
def create_supplier():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    name = data.get("name")
    company_name = data.get("company_name")
    email = data.get("email")
    phone = data.get("phone")
    address = data.get("address")

    if not name:
        return jsonify({
            "error": "Supplier name is required"
        }), 400

    if email:
        existing_supplier = Supplier.query.filter_by(
            email=email
        ).first()

        if existing_supplier:
            return jsonify({
                "error": "Supplier email already exists"
            }), 409

    supplier = Supplier(
        name=name,
        company_name=company_name,
        email=email,
        phone=phone,
        address=address
    )

    db.session.add(supplier)
    db.session.commit()

    return jsonify({
        "message": "Supplier created successfully",
        "supplier": {
            "id": supplier.id,
            "name": supplier.name,
            "company_name": supplier.company_name,
            "email": supplier.email,
            "phone": supplier.phone,
            "address": supplier.address
        }
    }), 201


# =========================
# GET ALL SUPPLIERS
# =========================
@supplier_bp.route("", methods=["GET"])
@staff_required
def get_suppliers():

    suppliers = Supplier.query.all()

    result = []

    for supplier in suppliers:
        result.append({
            "id": supplier.id,
            "name": supplier.name,
            "company_name": supplier.company_name,
            "email": supplier.email,
            "phone": supplier.phone,
            "address": supplier.address,
            "created_at": supplier.created_at
        })

    return jsonify({
        "suppliers": result
    }), 200


# =========================
# GET SINGLE SUPPLIER
# =========================
@supplier_bp.route("/<int:supplier_id>", methods=["GET"])
@staff_required
def get_supplier(supplier_id):

    supplier = Supplier.query.get(supplier_id)

    if not supplier:
        return jsonify({
            "error": "Supplier not found"
        }), 404

    return jsonify({
        "id": supplier.id,
        "name": supplier.name,
        "company_name": supplier.company_name,
        "email": supplier.email,
        "phone": supplier.phone,
        "address": supplier.address,
        "created_at": supplier.created_at
    }), 200


# =========================
# UPDATE SUPPLIER
# =========================
@supplier_bp.route("/<int:supplier_id>", methods=["PUT"])
@manager_required
def update_supplier(supplier_id):

    supplier = Supplier.query.get(supplier_id)

    if not supplier:
        return jsonify({
            "error": "Supplier not found"
        }), 404

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    if "name" in data:

        if not data["name"]:
            return jsonify({
                "error": "Supplier name cannot be empty"
            }), 400

        supplier.name = data["name"]

    if "company_name" in data:
        supplier.company_name = data["company_name"]

    if "email" in data:

        if data["email"]:

            existing_supplier = Supplier.query.filter(
                Supplier.email == data["email"],
                Supplier.id != supplier_id
            ).first()

            if existing_supplier:
                return jsonify({
                    "error": "Supplier email already exists"
                }), 409

        supplier.email = data["email"]

    if "phone" in data:
        supplier.phone = data["phone"]

    if "address" in data:
        supplier.address = data["address"]

    db.session.commit()

    return jsonify({
        "message": "Supplier updated successfully"
    }), 200


# =========================
# DELETE SUPPLIER
# =========================
@supplier_bp.route("/<int:supplier_id>", methods=["DELETE"])
@admin_required
def delete_supplier(supplier_id):

    supplier = Supplier.query.get(supplier_id)

    if not supplier:
        return jsonify({
            "error": "Supplier not found"
        }), 404

    db.session.delete(supplier)
    db.session.commit()

    return jsonify({
        "message": "Supplier deleted successfully"
    }), 200