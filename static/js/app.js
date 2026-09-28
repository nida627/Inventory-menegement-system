// ==================== USER INFORMATION ====================

function loadUserInfo() {

    const userData = localStorage.getItem("user");

    if (!userData) {
        return;
    }

    try {

        const user = JSON.parse(userData);

        const userName = document.getElementById("userName");
        const userRole = document.getElementById("userRole");

        if (userName) {
            userName.textContent = user.name || "User";
        }

        if (userRole) {
            userRole.textContent = user.role || "staff";
        }

        controlMenuByRole(user.role);

    } catch (error) {

        console.error(
            "Unable to read user information:",
            error
        );

    }
}


// ==================== ROLE BASED MENU ====================

function controlMenuByRole(role) {

    // Default role
    role = role || "staff";

    const categoryLink =
        document.querySelector('a[href="/categories"]');

    const supplierLink =
        document.querySelector('a[href="/suppliers"]');

    const customerLink =
        document.querySelector('a[href="/customers"]');

    const productLink =
        document.querySelector('a[href="/products"]');

    const purchaseLink =
        document.querySelector('a[href="/purchases"]');


    /*
        Backend permissions:

        Admin:
        Full access

        Manager:
        Create / Update + stock adjustment

        Staff:
        View + sales/purchases
    */


    // ==================== STAFF ====================

    if (role === "staff") {

        /*
            Staff can view products, categories,
            suppliers, customers, purchases,
            sales, inventory and reports.

            So currently no menu needs to be hidden.
        */

        return;
    }


    // ==================== MANAGER ====================

    if (role === "manager") {

        /*
            Manager has access to all current
            application modules.

            Delete permissions are controlled
            by backend APIs.
        */

        return;
    }


    // ==================== ADMIN ====================

    if (role === "admin") {

        /*
            Admin has full access.
        */

        return;
    }
}


// ==================== LOGOUT ====================

function logout() {

    localStorage.removeItem("access_token");

    localStorage.removeItem("user");

    window.location.href = "/login";
}


// ==================== PAGE INITIALIZATION ====================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadUserInfo();

    }
);