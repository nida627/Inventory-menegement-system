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

function controlCustomerUI() {

    const role = getUserRole();

    const addButton =
        document.getElementById("addCustomerButton");


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
// Load Customers
// ==========================================

async function loadCustomers() {

    if (!checkAuthentication()) {
        return;
    }


    const token = getToken();


    try {

        const response = await fetch(
            "/api/customers",
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
                "customersTableBody"
            );


        if (!response.ok) {

            tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        class="text-center text-danger">

                        ${data.error ||
                        "Failed to load customers"}

                    </td>

                </tr>

            `;

            return;

        }


        tableBody.innerHTML = "";


        if (
            !data.customers ||
            data.customers.length === 0
        ) {

            tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        class="text-center">

                        No customers found

                    </td>

                </tr>

            `;

            return;

        }


        const role = getUserRole();


        data.customers.forEach(
            function (customer) {

                let actionButtons = "";


                // ==================================
                // Admin
                // ==================================

                if (role === "admin") {

                    actionButtons = `

                        <button
                            class="btn btn-sm btn-primary me-1"
                            onclick="openEditCustomerModal(${customer.id})">

                            Edit

                        </button>


                        <button
                            class="btn btn-sm btn-danger"
                            onclick="deleteCustomer(${customer.id})">

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
                            onclick="openEditCustomerModal(${customer.id})">

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
                            ${customer.id}
                        </td>

                        <td>
                            ${customer.name}
                        </td>

                        <td>
                            ${customer.email || "-"}
                        </td>

                        <td>
                            ${customer.phone || "-"}
                        </td>

                        <td>
                            ${customer.address || "-"}
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
            "Customer loading error:",
            error
        );

        showMessage(
            "Unable to connect to server",
            "danger"
        );

    }

}


// ==========================================
// Open Add Customer Modal
// ==========================================

function openAddCustomerModal() {

    const role = getUserRole();


    // Staff cannot add

    if (
        role !== "admin" &&
        role !== "manager"
    ) {

        showMessage(
            "You do not have permission to add customers",
            "danger"
        );

        return;

    }


    document.getElementById(
        "customerModalTitle"
    ).textContent =
        "Add Customer";


    document.getElementById(
        "customerForm"
    ).reset();


    document.getElementById(
        "customerId"
    ).value = "";

}


// ==========================================
// Open Edit Customer Modal
// ==========================================

async function openEditCustomerModal(
    customerId
) {

    const role = getUserRole();


    // Staff cannot edit

    if (
        role !== "admin" &&
        role !== "manager"
    ) {

        showMessage(
            "You do not have permission to edit customers",
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


    try {

        const response = await fetch(
            `/api/customers/${customerId}`,
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

            window.location.href =
                "/login";

            return;

        }


        const data =
            await response.json();


        if (!response.ok) {

            showMessage(
                data.error ||
                "Failed to load customer",
                "danger"
            );

            return;

        }


        // Backend returns customer directly

        const customer = data;


        document.getElementById(
            "customerModalTitle"
        ).textContent =
            "Edit Customer";


        document.getElementById(
            "customerId"
        ).value =
            customer.id;


        document.getElementById(
            "customerName"
        ).value =
            customer.name || "";


        document.getElementById(
            "customerEmail"
        ).value =
            customer.email || "";


        document.getElementById(
            "customerPhone"
        ).value =
            customer.phone || "";


        document.getElementById(
            "customerAddress"
        ).value =
            customer.address || "";


        const modalElement =
            document.getElementById(
                "customerModal"
            );


        const modal =
            new bootstrap.Modal(
                modalElement
            );


        modal.show();

    }

    catch (error) {

        console.error(
            "Customer edit error:",
            error
        );

        showMessage(
            "Unable to connect to server",
            "danger"
        );

    }

}


// ==========================================
// Save Customer
// ==========================================

async function saveCustomer() {

    const role = getUserRole();


    // Staff cannot create/update

    if (
        role !== "admin" &&
        role !== "manager"
    ) {

        showMessage(
            "You do not have permission to modify customers",
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


    const customerId =
        document.getElementById(
            "customerId"
        ).value;


    const name =
        document.getElementById(
            "customerName"
        ).value.trim();


    const email =
        document.getElementById(
            "customerEmail"
        ).value.trim();


    const phone =
        document.getElementById(
            "customerPhone"
        ).value.trim();


    const address =
        document.getElementById(
            "customerAddress"
        ).value.trim();


    if (!name) {

        showMessage(
            "Customer name is required",
            "danger"
        );

        return;

    }


    const customerData = {

        name: name,

        email: email,

        phone: phone,

        address: address

    };


    try {

        let url =
            "/api/customers";

        let method =
            "POST";


        if (customerId) {

            url =
                `/api/customers/${customerId}`;

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
                        customerData
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
                "Failed to save customer",
                "danger"
            );

            return;

        }


        showMessage(
            data.message ||
            "Customer saved successfully",
            "success"
        );


        const modalElement =
            document.getElementById(
                "customerModal"
            );


        const modal =
            bootstrap.Modal.getInstance(
                modalElement
            );


        if (modal) {
            modal.hide();
        }


        await loadCustomers();

    }

    catch (error) {

        console.error(
            "Customer save error:",
            error
        );

        showMessage(
            "Unable to connect to server",
            "danger"
        );

    }

}


// ==========================================
// Delete Customer
// ==========================================

async function deleteCustomer(
    customerId
) {

    const role = getUserRole();


    // Only Admin can delete

    if (role !== "admin") {

        showMessage(
            "Only admin can delete customers",
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
            "Are you sure you want to delete this customer?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/customers/${customerId}`,
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
                "Failed to delete customer",
                "danger"
            );

            return;

        }


        showMessage(
            data.message ||
            "Customer deleted successfully",
            "success"
        );


        await loadCustomers();

    }

    catch (error) {

        console.error(
            "Customer delete error:",
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


        controlCustomerUI();


        await loadCustomers();

    }
);