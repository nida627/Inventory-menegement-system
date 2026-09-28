// ==========================================
// Get Token
// ==========================================

function getToken() {

    return localStorage.getItem("access_token");

}


// ==========================================
// Get Current User
// ==========================================

function getCurrentUser() {

    const userData = localStorage.getItem("user");

    if (!userData) {
        return null;
    }

    try {

        return JSON.parse(userData);

    } catch (error) {

        console.error(
            "Unable to read user information:",
            error
        );

        return null;

    }

}


// ==========================================
// Get Current Role
// ==========================================

function getUserRole() {

    const user = getCurrentUser();

    return user ? user.role : null;

}


// ==========================================
// Authentication Check
// ==========================================

function checkAuthentication() {

    const token = getToken();

    if (!token) {

        window.location.href = "/login";

        return false;

    }

    return true;

}


// ==========================================
// Role Based UI
// ==========================================

function controlSupplierUI() {

    const role = getUserRole();


    const addButton =
        document.getElementById("addSupplierButton");


    // Staff = View Only

    if (role === "staff") {

        if (addButton) {
            addButton.classList.add("d-none");
        }

    }

}


// ==========================================
// Show Message
// ==========================================

function showMessage(message, type = "success") {

    const messageBox =
        document.getElementById("message");


    messageBox.textContent = message;


    messageBox.className =
        `alert alert-${type}`;


    setTimeout(function () {

        messageBox.classList.add("d-none");

    }, 3000);

}


// ==========================================
// Load Suppliers
// ==========================================

async function loadSuppliers() {

    if (!checkAuthentication()) {
        return;
    }


    const token = getToken();


    try {

        const response = await fetch(
            "/api/suppliers",
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        if (response.status === 401) {

            localStorage.clear();

            window.location.href = "/login";

            return;

        }


        const data =
            await response.json();


        const tableBody =
            document.getElementById(
                "suppliersTableBody"
            );


        if (!response.ok) {

            tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        class="text-center text-danger">

                        ${data.error ||
                        "Failed to load suppliers"}

                    </td>

                </tr>

            `;

            return;

        }


        tableBody.innerHTML = "";


        if (
            !data.suppliers ||
            data.suppliers.length === 0
        ) {

            tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        class="text-center">

                        No suppliers found

                    </td>

                </tr>

            `;

            return;

        }


        const role = getUserRole();


        data.suppliers.forEach(
            function (supplier) {


                let actionButtons = "";


                // ==================================
                // Admin
                // ==================================

                if (role === "admin") {

                    actionButtons = `

                        <button
                            class="btn btn-sm btn-primary me-1"
                            onclick="openEditSupplierModal(${supplier.id})">

                            Edit

                        </button>


                        <button
                            class="btn btn-sm btn-danger"
                            onclick="deleteSupplier(${supplier.id})">

                            Delete

                        </button>

                    `;

                }


                // ==================================
                // Manager
                // ==================================

                else if (role === "manager") {

                    actionButtons = `

                        <button
                            class="btn btn-sm btn-primary"
                            onclick="openEditSupplierModal(${supplier.id})">

                            Edit

                        </button>

                    `;

                }


                // ==================================
                // Staff
                // ==================================

                else {

                    actionButtons = `

                        <span class="text-muted">

                            View Only

                        </span>

                    `;

                }


                tableBody.innerHTML += `

                    <tr>

                        <td>
                            ${supplier.id}
                        </td>

                        <td>
                            ${supplier.name}
                        </td>

                        <td>
                            ${supplier.company_name || "-"}
                        </td>

                        <td>
                            ${supplier.email || "-"}
                        </td>

                        <td>
                            ${supplier.phone || "-"}
                        </td>

                        <td>
                            ${supplier.address || "-"}
                        </td>

                        <td>
                            ${actionButtons}
                        </td>

                    </tr>

                `;

            }
        );

    }

    catch (error) {

        console.error(
            "Supplier loading error:",
            error
        );

        showMessage(
            "Unable to connect to server",
            "danger"
        );

    }

}


// ==========================================
// Open Add Supplier Modal
// ==========================================

function openAddSupplierModal() {

    const role = getUserRole();


    // Staff cannot add

    if (
        role !== "admin" &&
        role !== "manager"
    ) {

        showMessage(
            "You do not have permission to add suppliers",
            "danger"
        );

        return;

    }


    document.getElementById(
        "supplierModalTitle"
    ).textContent =
        "Add Supplier";


    document.getElementById(
        "supplierForm"
    ).reset();


    document.getElementById(
        "supplierId"
    ).value = "";

}


// ==========================================
// Open Edit Supplier Modal
// ==========================================

async function openEditSupplierModal(
    supplierId
) {

    const role = getUserRole();


    // Staff cannot edit

    if (
        role !== "admin" &&
        role !== "manager"
    ) {

        showMessage(
            "You do not have permission to edit suppliers",
            "danger"
        );

        return;

    }


    const token = getToken();


    if (!token) {

        window.location.href = "/login";

        return;

    }


    try {

        const response = await fetch(
            `/api/suppliers/${supplierId}`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );


        if (response.status === 401) {

            localStorage.clear();

            window.location.href = "/login";

            return;

        }


        const data =
            await response.json();


        if (!response.ok) {

            showMessage(
                data.error ||
                "Failed to load supplier",
                "danger"
            );

            return;

        }


        // Backend returns supplier directly

        const supplier = data;


        document.getElementById(
            "supplierModalTitle"
        ).textContent =
            "Edit Supplier";


        document.getElementById(
            "supplierId"
        ).value =
            supplier.id;


        document.getElementById(
            "supplierName"
        ).value =
            supplier.name || "";


        document.getElementById(
            "supplierCompany"
        ).value =
            supplier.company_name || "";


        document.getElementById(
            "supplierEmail"
        ).value =
            supplier.email || "";


        document.getElementById(
            "supplierPhone"
        ).value =
            supplier.phone || "";


        document.getElementById(
            "supplierAddress"
        ).value =
            supplier.address || "";


        const modalElement =
            document.getElementById(
                "supplierModal"
            );


        const modal =
            new bootstrap.Modal(
                modalElement
            );


        modal.show();

    }

    catch (error) {

        console.error(
            "Supplier edit error:",
            error
        );

        showMessage(
            "Unable to connect to server",
            "danger"
        );

    }

}


// ==========================================
// Save Supplier
// ==========================================

async function saveSupplier() {

    const role = getUserRole();


    // Staff cannot create/update

    if (
        role !== "admin" &&
        role !== "manager"
    ) {

        showMessage(
            "You do not have permission to modify suppliers",
            "danger"
        );

        return;

    }


    const token = getToken();


    if (!token) {

        window.location.href = "/login";

        return;

    }


    const supplierId =
        document.getElementById(
            "supplierId"
        ).value;


    const name =
        document.getElementById(
            "supplierName"
        ).value.trim();


    const companyName =
        document.getElementById(
            "supplierCompany"
        ).value.trim();


    const email =
        document.getElementById(
            "supplierEmail"
        ).value.trim();


    const phone =
        document.getElementById(
            "supplierPhone"
        ).value.trim();


    const address =
        document.getElementById(
            "supplierAddress"
        ).value.trim();


    if (!name) {

        showMessage(
            "Supplier name is required",
            "danger"
        );

        return;

    }


    const supplierData = {

        name: name,

        company_name: companyName,

        email: email,

        phone: phone,

        address: address

    };


    try {

        let url =
            "/api/suppliers";

        let method =
            "POST";


        if (supplierId) {

            url =
                `/api/suppliers/${supplierId}`;

            method =
                "PUT";

        }


        const response =
            await fetch(url, {

                method: method,

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${token}`

                },

                body:
                    JSON.stringify(
                        supplierData
                    )

            });


        if (response.status === 401) {

            localStorage.clear();

            window.location.href =
                "/login";

            return;

        }


        const data =
            await response.json();


        if (!response.ok) {

            showMessage(
                data.error ||
                "Failed to save supplier",
                "danger"
            );

            return;

        }


        showMessage(
            data.message ||
            "Supplier saved successfully",
            "success"
        );


        const modalElement =
            document.getElementById(
                "supplierModal"
            );


        const modal =
            bootstrap.Modal.getInstance(
                modalElement
            );


        if (modal) {
            modal.hide();
        }


        await loadSuppliers();

    }

    catch (error) {

        console.error(
            "Supplier save error:",
            error
        );

        showMessage(
            "Unable to connect to server",
            "danger"
        );

    }

}


// ==========================================
// Delete Supplier
// ==========================================

async function deleteSupplier(
    supplierId
) {

    const role = getUserRole();


    // Only Admin can delete

    if (role !== "admin") {

        showMessage(
            "Only admin can delete suppliers",
            "danger"
        );

        return;

    }


    const token = getToken();


    if (!token) {

        window.location.href =
            "/login";

        return;

    }


    const confirmed =
        confirm(
            "Are you sure you want to delete this supplier?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/suppliers/${supplierId}`,
                {

                    method: "DELETE",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        if (response.status === 401) {

            localStorage.clear();

            window.location.href =
                "/login";

            return;

        }


        const data =
            await response.json();


        if (!response.ok) {

            showMessage(
                data.error ||
                "Failed to delete supplier",
                "danger"
            );

            return;

        }


        showMessage(
            data.message ||
            "Supplier deleted successfully",
            "success"
        );


        await loadSuppliers();

    }

    catch (error) {

        console.error(
            "Supplier delete error:",
            error
        );

        showMessage(
            "Unable to connect to server",
            "danger"
        );

    }

}


// ==========================================
// Page Load
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        if (!checkAuthentication()) {
            return;
        }


        controlSupplierUI();


        await loadSuppliers();

    }
);