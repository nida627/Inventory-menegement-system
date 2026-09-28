async function loadDashboard() {

    const token = localStorage.getItem("access_token");

    if (!token) {
        window.location.href = "/login";
        return;
    }

    try {

        const response = await fetch("/api/dashboard/summary", {
            method: "GET",
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

        document.getElementById("totalProducts").textContent =
            data.total_products;

        document.getElementById("lowStock").textContent =
            data.low_stock;

        document.getElementById("outOfStock").textContent =
            data.out_of_stock;

        document.getElementById("totalSales").textContent =
            `₹${data.total_sales}`;

    } catch (error) {

        console.error("Dashboard error:", error);

    }
}

loadDashboard();