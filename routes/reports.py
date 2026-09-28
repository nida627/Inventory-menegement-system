from flask import Blueprint, jsonify

from routes.auth import staff_required
from services.report_service import (
    get_stock_report,
    get_sales_report,
    get_purchase_report,
    get_profit_report
)


reports_bp = Blueprint(
    "reports",
    __name__,
    url_prefix="/api/reports"
)


# ==========================================
# STOCK REPORT
# ==========================================

@reports_bp.route("/stock", methods=["GET"])
@staff_required
def stock_report():

    try:

        report = get_stock_report()

        return jsonify({
            "report": report
        }), 200

    except Exception:

        return jsonify({
            "error": "Something went wrong while generating stock report"
        }), 500


# ==========================================
# SALES REPORT
# ==========================================

@reports_bp.route("/sales", methods=["GET"])
@staff_required
def sales_report():

    try:

        report = get_sales_report()

        return jsonify({
            "report": report
        }), 200

    except Exception:

        return jsonify({
            "error": "Something went wrong while generating sales report"
        }), 500


# ==========================================
# PURCHASE REPORT
# ==========================================

@reports_bp.route("/purchases", methods=["GET"])
@staff_required
def purchase_report():

    try:

        report = get_purchase_report()

        return jsonify({
            "report": report
        }), 200

    except Exception:

        return jsonify({
            "error": "Something went wrong while generating purchase report"
        }), 500


# ==========================================
# PROFIT REPORT
# ==========================================

@reports_bp.route("/profit", methods=["GET"])
@staff_required
def profit_report():

    try:

        report = get_profit_report()

        return jsonify({
            "report": report
        }), 200

    except Exception:

        return jsonify({
            "error": "Something went wrong while generating profit report"
        }), 500