let reportToken = null;


// ==================== AUTH ====================

function getToken() {
    const token = localStorage.getItem("access_token");

    if (!token) {
        window.location.href = "/login";
        return null;
    }

    return token;
}


// ==================== MESSAGE ====================

function showReportMessage(message, type) {
    const messageBox = document.getElementById("reportMessage");

    messageBox.textContent = message;
    messageBox.className = `alert alert-${type}`;

    setTimeout(function () {
        messageBox.className = "alert d-none";
    }, 3000);
}


// ==================== STOCK REPORT ====================

async function loadStockReport() {

    const token = getToken();

    if (!token) {
        return;
    }

    try {

        const response = await fetch("/api/reports/stock", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            localStorage.clear();
            window.location.href = "/login";
            return;
        }

        const data = await response.json();

        if (!response.ok) {
            showReportMessage(
                data.error || "Failed to load stock report",
                "danger"
            );
            return;
        }

        // Backend response:
        // { "report": [...] }
        displayStockReport(data.report);

    } catch (error) {

        console.error("Stock report error:", error);

        showReportMessage(
            "Unable to connect to server",
            "danger"
        );
    }
}


function displayStockReport(data) {

    const tableBody =
        document.getElementById("stockReportBody");

    tableBody.innerHTML = "";

    if (!data || data.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    No stock records found
                </td>
            </tr>
        `;

        return;
    }

    data.forEach(function (item) {

        let statusClass = "text-success";

        if (item.stock_status === "Low Stock") {
            statusClass = "text-warning";
        }

        if (item.stock_status === "Out of Stock") {
            statusClass = "text-danger";
        }

        tableBody.innerHTML += `
            <tr>

                <td>${item.product_id}</td>

                <td>${item.product_name}</td>

                <td>${item.sku}</td>

                <td>${item.category || "-"}</td>

                <td>${item.quantity}</td>

                <td>${item.minimum_stock}</td>

                <td>
                    <span class="${statusClass}">
                        ${item.stock_status}
                    </span>
                </td>

            </tr>
        `;
    });
}


// ==================== SALES REPORT ====================

async function loadSalesReport() {

    const token = getToken();

    if (!token) {
        return;
    }

    try {

        const response = await fetch("/api/reports/sales", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            localStorage.clear();
            window.location.href = "/login";
            return;
        }

        const data = await response.json();

        if (!response.ok) {
            showReportMessage(
                data.error || "Failed to load sales report",
                "danger"
            );
            return;
        }

        // Backend response:
        // { "report": [...] }
        displaySalesReport(data.report);

    } catch (error) {

        console.error("Sales report error:", error);

        showReportMessage(
            "Unable to connect to server",
            "danger"
        );
    }
}


function displaySalesReport(data) {

    const tableBody =
        document.getElementById("salesReportBody");

    tableBody.innerHTML = "";

    if (!data || data.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    No sales records found
                </td>
            </tr>
        `;

        return;
    }

    data.forEach(function (sale) {

        const date = sale.sale_date
            ? new Date(sale.sale_date).toLocaleString()
            : "-";

        tableBody.innerHTML += `
            <tr>

                <td>${sale.sale_id}</td>

                <td>${sale.customer_name || "-"}</td>

                <td>${date}</td>

                <td>
                    ₹${Number(sale.total_amount).toFixed(2)}
                </td>

                <td>${sale.status}</td>

            </tr>
        `;
    });
}


// ==================== PURCHASE REPORT ====================

async function loadPurchaseReport() {

    const token = getToken();

    if (!token) {
        return;
    }

    try {

        const response = await fetch("/api/reports/purchases", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            localStorage.clear();
            window.location.href = "/login";
            return;
        }

        const data = await response.json();

        if (!response.ok) {
            showReportMessage(
                data.error || "Failed to load purchase report",
                "danger"
            );
            return;
        }

        // Backend response:
        // { "report": [...] }
        displayPurchaseReport(data.report);

    } catch (error) {

        console.error("Purchase report error:", error);

        showReportMessage(
            "Unable to connect to server",
            "danger"
        );
    }
}


function displayPurchaseReport(data) {

    const tableBody =
        document.getElementById("purchaseReportBody");

    tableBody.innerHTML = "";

    if (!data || data.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    No purchase records found
                </td>
            </tr>
        `;

        return;
    }

    data.forEach(function (purchase) {

        const date = purchase.purchase_date
            ? new Date(purchase.purchase_date).toLocaleString()
            : "-";

        tableBody.innerHTML += `
            <tr>

                <td>${purchase.purchase_id}</td>

                <td>${purchase.supplier_name || "-"}</td>

                <td>${date}</td>

                <td>
                    ₹${Number(purchase.total_amount).toFixed(2)}
                </td>

                <td>${purchase.status}</td>

            </tr>
        `;
    });
}


// ==================== PROFIT REPORT ====================

async function loadProfitReport() {

    const token = getToken();

    if (!token) {
        return;
    }

    try {

        const response = await fetch("/api/reports/profit", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            localStorage.clear();
            window.location.href = "/login";
            return;
        }

        const data = await response.json();

        if (!response.ok) {
            showReportMessage(
                data.error || "Failed to load profit report",
                "danger"
            );
            return;
        }

        // Backend response:
        // {
        //     "report": {
        //         "total_sales": ...,
        //         "total_purchases": ...,
        //         "profit": ...
        //     }
        // }

        const report = data.report;

        document.getElementById("totalSales").textContent =
        `₹${Number(report.total_sales).toFixed(2)}`;

        document.getElementById("totalPurchases").textContent =
            `₹${Number(report.total_purchases).toFixed(2)}`;

        document.getElementById("cogs").textContent =
            `₹${Number(report.cogs).toFixed(2)}`;

        document.getElementById("profit").textContent =
            `₹${Number(report.profit).toFixed(2)}`;

    } catch (error) {

        console.error("Profit report error:", error);

        showReportMessage(
            "Unable to connect to server",
            "danger"
        );
    }
}


// ==================== INITIALIZE REPORTS ====================

async function initializeReports() {

    await Promise.all([
        loadStockReport(),
        loadSalesReport(),
        loadPurchaseReport(),
        loadProfitReport()
    ]);
}

initializeReports();