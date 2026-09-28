from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from extensions import db, bcrypt
from models.user import User
from functools import wraps
import re


auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


# =========================================================
# VALIDATION FUNCTIONS
# =========================================================

def validate_name(name):
    if not isinstance(name, str):
        return False

    name = name.strip()

    if len(name) < 2:
        return False

    if not re.fullmatch(r"[A-Za-z ]+", name):
        return False

    return True


def validate_email(email):
    if not isinstance(email, str):
        return False

    email = email.strip()

    pattern = r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"

    return re.fullmatch(pattern, email) is not None


def validate_password(password):
    if not isinstance(password, str):
        return False

    # Minimum 8 characters
    if len(password) < 8:
        return False

    # At least one uppercase letter
    if not re.search(r"[A-Z]", password):
        return False

    # At least one lowercase letter
    if not re.search(r"[a-z]", password):
        return False

    # At least one number
    if not re.search(r"\d", password):
        return False

    # At least one special character
    if not re.search(r"[^A-Za-z0-9]", password):
        return False

    return True


# =========================================================
# ROLE DECORATORS
# =========================================================

def role_required(*allowed_roles):
    def decorator(func):

        @wraps(func)
        @jwt_required()
        def wrapper(*args, **kwargs):

            user_id = get_jwt_identity()

            user = User.query.get(user_id)

            if not user:
                return jsonify({
                    "error": "User not found"
                }), 404

            if user.role not in allowed_roles:
                return jsonify({
                    "error": "Access forbidden"
                }), 403

            return func(*args, **kwargs)

        return wrapper

    return decorator


def admin_required(func):
    return role_required("admin")(func)


def manager_required(func):
    return role_required("admin", "manager")(func)


def staff_required(func):
    return role_required(
        "admin",
        "manager",
        "staff"
    )(func)


# =========================================================
# REGISTER
# =========================================================

@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    # Required fields
    if not name or not email or not password:
        return jsonify({
            "error": "Name, email and password are required"
        }), 400

    # Clean input
    name = name.strip()
    email = email.strip().lower()

    # Validate name
    if not validate_name(name):
        return jsonify({
            "error": (
                "Name must contain only letters and spaces "
                "and must be at least 2 characters long"
            )
        }), 400

    # Validate email
    if not validate_email(email):
        return jsonify({
            "error": "Please enter a valid email address"
        }), 400

    # Validate password
    if not validate_password(password):
        return jsonify({
            "error": (
                "Password must be at least 8 characters long "
                "and contain at least one uppercase letter, "
                "one lowercase letter, one digit, "
                "and one special character"
            )
        }), 400

    # Check duplicate email
    existing_user = User.query.filter_by(
        email=email
    ).first()

    if existing_user:
        return jsonify({
            "error": "Email already registered"
        }), 409

    # Hash password
    password_hash = bcrypt.generate_password_hash(
        password
    ).decode("utf-8")

    # New users are always staff
    user = User(
        name=name,
        email=email,
        password_hash=password_hash,
        role="staff"
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "User registered successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }), 201


# =========================================================
# LOGIN
# =========================================================

@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "error": "Email and password are required"
        }), 400

    email = email.strip().lower()

    # Find user
    user = User.query.filter_by(
        email=email
    ).first()

    if not user:
        return jsonify({
            "error": "Invalid email or password"
        }), 401

    # Check password
    if not bcrypt.check_password_hash(
        user.password_hash,
        password
    ):
        return jsonify({
            "error": "Invalid email or password"
        }), 401

    # Create JWT
    access_token = create_access_token(
        identity=str(user.id)
    )

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }), 200


# =========================================================
# PROFILE
# =========================================================

@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():

    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "created_at": user.created_at
    }), 200