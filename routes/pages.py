from flask import Blueprint, render_template

pages_bp = Blueprint("pages", __name__)

@pages_bp.route("/")
def home():
    return render_template("login.html")

@pages_bp.route("/login")
def login_page():
    return render_template("login.html")


@pages_bp.route("/register")
def register_page():
    return render_template("register.html")


@pages_bp.route("/dashboard")
def dashboard_page():
    return render_template("dashboard.html")


@pages_bp.route("/products")
def products_page():
    return render_template("products.html")


@pages_bp.route("/categories")
def categories_page():
    return render_template("categories.html")

@pages_bp.route("/suppliers")
def suppliers_page():
    return render_template("suppliers.html")

@pages_bp.route("/customers")
def customers_page():
    return render_template("customers.html")

@pages_bp.route("/purchases")
def purchases_page():
    return render_template("purchases.html")

@pages_bp.route("/sales")
def sales_page():
    return render_template("sales.html")

@pages_bp.route("/inventory")
def inventory_page():
    return render_template("inventory.html")

@pages_bp.route("/reports")
def reports_page():
    return render_template("reports.html")