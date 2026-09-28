from flask import Flask

from config import Config
from extensions import db, migrate, jwt, bcrypt

from models import (
    User,
    Category,
    Product,
    Supplier,
    Customer,
    Purchase,
    PurchaseItem,
    Sale,
    SaleItem,
    StockMovement
)

from routes.auth import auth_bp
from routes.categories import category_bp
from routes.products import product_bp
from routes.suppliers import supplier_bp
from routes.customers import customer_bp
from routes.purchases import purchase_bp
from routes.inventory import inventory_bp
from routes.sales import sale_bp
from routes.reports import reports_bp
from routes.pages import pages_bp
from routes.dashboard import dashboard_bp


def create_app():

    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(category_bp)
    app.register_blueprint(product_bp)
    app.register_blueprint(supplier_bp)
    app.register_blueprint(customer_bp)
    app.register_blueprint(purchase_bp)
    app.register_blueprint(inventory_bp)
    app.register_blueprint(sale_bp)
    app.register_blueprint(reports_bp)

    app.register_blueprint(pages_bp)
    app.register_blueprint(dashboard_bp)

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True)