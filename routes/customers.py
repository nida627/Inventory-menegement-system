from flask import Blueprint, request, jsonify

from extensions import db
from models.customer import Customer
from routes.auth import admin_required, manager_required, staff_required
from models.customer import Customer
from models.sale import Sale

customer_bp = Blueprint(
    "customers",
    __name__,
    url_prefix="/api/customers"
)


# ==========================================
# CREATE CUSTOMER
# ==========================================

@customer_bp.route("", methods=["POST"])
@manager_required
def create_customer():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    address = data.get("address")

    if not name:
        return jsonify({
            "error": "Customer name is required"
        }), 400

    if email:
        existing_customer = Customer.query.filter_by(
            email=email
        ).first()

        if existing_customer:
            return jsonify({
                "error": "Customer email already exists"
            }), 409

    customer = Customer(
        name=name,
        email=email,
        phone=phone,
        address=address
    )

    db.session.add(customer)
    db.session.commit()

    return jsonify({
        "message": "Customer created successfully",
        "customer": {
            "id": customer.id,
            "name": customer.name,
            "email": customer.email,
            "phone": customer.phone,
            "address": customer.address
        }
    }), 201


# ==========================================
# GET ALL CUSTOMERS
# ==========================================

@customer_bp.route("", methods=["GET"])
@staff_required
def get_customers():

    customers = Customer.query.all()

    result = []

    for customer in customers:

        result.append({
            "id": customer.id,
            "name": customer.name,
            "email": customer.email,
            "phone": customer.phone,
            "address": customer.address,
            "created_at": customer.created_at
        })

    return jsonify({
        "customers": result
    }), 200


# ==========================================
# GET SINGLE CUSTOMER
# ==========================================

@customer_bp.route("/<int:customer_id>", methods=["GET"])
@staff_required
def get_customer(customer_id):

    customer = Customer.query.get(customer_id)

    if not customer:
        return jsonify({
            "error": "Customer not found"
        }), 404

    return jsonify({
        "id": customer.id,
        "name": customer.name,
        "email": customer.email,
        "phone": customer.phone,
        "address": customer.address,
        "created_at": customer.created_at
    }), 200


# ==========================================
# UPDATE CUSTOMER
# ==========================================

@customer_bp.route("/<int:customer_id>", methods=["PUT"])
@manager_required
def update_customer(customer_id):

    customer = Customer.query.get(customer_id)

    if not customer:
        return jsonify({
            "error": "Customer not found"
        }), 404

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    if "name" in data:

        if not data["name"]:
            return jsonify({
                "error": "Customer name cannot be empty"
            }), 400

        customer.name = data["name"]

    if "email" in data:

        if data["email"]:

            existing_customer = Customer.query.filter(
                Customer.email == data["email"],
                Customer.id != customer_id
            ).first()

            if existing_customer:
                return jsonify({
                    "error": "Customer email already exists"
                }), 409

        customer.email = data["email"]

    if "phone" in data:
        customer.phone = data["phone"]

    if "address" in data:
        customer.address = data["address"]

    db.session.commit()

    return jsonify({
        "message": "Customer updated successfully"
    }), 200


# ==========================================
# DELETE CUSTOMER
# ==========================================

@customer_bp.route("/<int:customer_id>", methods=["DELETE"])
@admin_required
def delete_customer(customer_id):

    customer = Customer.query.get(customer_id)

    if not customer:
        return jsonify({
            "error": "Customer not found"
        }), 404

    existing_sales = Sale.query.filter_by(
        customer_id=customer_id
    ).first()

    if existing_sales:
        return jsonify({
            "error": "Customer cannot be deleted because sales exist for this customer"
        }), 409

    try:
        db.session.delete(customer)
        db.session.commit()

        return jsonify({
            "message": "Customer deleted successfully"
        }), 200

    except Exception:
        db.session.rollback()

        return jsonify({
            "error": "Something went wrong while deleting customer"
        }), 500