// ==========================================
// Global Data
// ==========================================

let suppliers = [];

let products = [];


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

    const userData =
        localStorage.getItem("user");

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

function controlPurchaseUI() {

    const role = getUserRole();

    const addButton =
        document.getElementById(
            "addPurchaseButton"
        );


    // Staff = View Only

    if (role === "staff") {

        if (addButton) {

            addButton.classList.add(
                "d-none"
            );

        }

    }

}


// ==========================================
// Show Message
// ==========================================

function showMessage(
    message,
    type = "success"
) {

    const messageBox =
        document.getElementById(
            "message"
        );


    messageBox.textContent =
        message;


    messageBox.className =
        `alert alert-${type}`;


    setTimeout(function () {

        messageBox.classList.add(
            "d-none"
        );

    }, 3000);

}


// ==========================================
// Load Suppliers & Products
// ==========================================

async function loadPurchaseData() {

    if (!checkAuthentication()) {
        return;
    }


    const token = getToken();


    try {

        const supplierResponse =
            await fetch(
                "/api/suppliers",
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const productResponse =
            await fetch(
                "/api/products",
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        if (
            supplierResponse.status === 401 ||
            productResponse.status === 401
        ) {

            localStorage.clear();

            window.location.href =
                "/login";

            return;

        }


        const supplierData =
            await supplierResponse.json();


        const productData =
            await productResponse.json();


        if (!supplierResponse.ok) {

            showMessage(
                supplierData.error ||
                "Failed to load suppliers",
                "danger"
            );

            return;

        }


        if (!productResponse.ok) {

            showMessage(
                productData.error ||
                "Failed to load products",
                "danger"
            );

            return;

        }


        suppliers =
            supplierData.suppliers || [];


        products =
            productData.products || [];

    }

    catch (error) {

        console.error(
            "Purchase data loading error:",
            error
        );

        showMessage(
            "Unable to load purchase data",
            "danger"
        );

    }

}


// ==========================================
// Load Purchases
// ==========================================

async function loadPurchases() {

    if (!checkAuthentication()) {
        return;
    }


    const token = getToken();


    try {

        const response =
            await fetch(
                "/api/purchases",
                {
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


        const tableBody =
            document.getElementById(
                "purchasesTableBody"
            );


        if (!response.ok) {

            tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="5"
                        class="text-center text-danger">

                        ${data.error ||
                        "Failed to load purchases"}

                    </td>

                </tr>

            `;

            return;

        }


        tableBody.innerHTML = "";


        if (
            !data.purchases ||
            data.purchases.length === 0
        ) {

            tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="5"
                        class="text-center">

                        No purchases found

                    </td>

                </tr>

            `;

            return;

        }


        data.purchases.forEach(
            function (purchase) {

                tableBody.innerHTML += `

                    <tr>

                        <td>
                            ${purchase.id}
                        </td>

                        <td>
                            ${purchase.supplier_name || "-"}
                        </td>

                        <td>

                            ${
                                purchase.purchase_date
                                    ? new Date(
                                        purchase.purchase_date
                                      ).toLocaleDateString()
                                    : "-"
                            }

                        </td>

                        <td>

                            ₹${Number(
                                purchase.total_amount || 0
                            ).toFixed(2)}

                        </td>

                        <td>
                            ${purchase.status || "-"}
                        </td>

                    </tr>

                `;

            }
        );

    }

    catch (error) {

        console.error(
            "Purchase loading error:",
            error
        );

        showMessage(
            "Unable to connect to server",
            "danger"
        );

    }

}


// ==========================================
// Open Add Purchase Modal
// ==========================================

function openAddPurchaseModal() {

    const role =
        getUserRole();


    // Staff cannot create purchase

    if (
        role !== "admin" &&
        role !== "manager"
    ) {

        showMessage(
            "You do not have permission to create purchases",
            "danger"
        );

        return;

    }


    const supplierSelect =
        document.getElementById(
            "purchaseSupplier"
        );


    supplierSelect.innerHTML = `

        <option value="">
            Select Supplier
        </option>

    `;


    suppliers.forEach(
        function (supplier) {

            supplierSelect.innerHTML += `

                <option value="${supplier.id}">

                    ${supplier.name}

                    ${
                        supplier.company_name
                            ? ` - ${supplier.company_name}`
                            : ""
                    }

                </option>

            `;

        }
    );


    document.getElementById(
        "purchaseItems"
    ).innerHTML = "";


    document.getElementById(
        "purchaseTotal"
    ).textContent =
        "0.00";


    addPurchaseItem();

}


// ==========================================
// Add Purchase Item
// ==========================================

function addPurchaseItem() {

    const role =
        getUserRole();


    if (
        role !== "admin" &&
        role !== "manager"
    ) {

        return;

    }


    const container =
        document.getElementById(
            "purchaseItems"
        );


    const itemId =
        Date.now();


    let productOptions = `

        <option value="">
            Select Product
        </option>

    `;


    products.forEach(
        function (product) {

            productOptions += `

                <option value="${product.id}">

                    ${product.name}
                    (${product.sku})

                </option>

            `;

        }
    );


    const itemHtml = `

        <div
            class="border rounded p-3 mb-3 purchase-item"
            data-item-id="${itemId}">

            <div class="row g-2 align-items-end">


                <div class="col-md-5">

                    <label class="form-label">

                        Product

                    </label>


                    <select
                        class="form-select item-product"
                        onchange="calculatePurchaseTotal()">

                        ${productOptions}

                    </select>

                </div>


                <div class="col-md-3">

                    <label class="form-label">

                        Quantity

                    </label>


                    <input
                        type="number"
                        class="form-control item-quantity"
                        min="1"
                        value="1"
                        onchange="calculatePurchaseTotal()">

                </div>


                <div class="col-md-3">

                    <label class="form-label">

                        Unit Price

                    </label>


                    <input
                        type="number"
                        class="form-control item-price"
                        min="0"
                        step="0.01"
                        value="0"
                        onchange="calculatePurchaseTotal()">

                </div>


                <div class="col-md-1">

                    <button
                        type="button"
                        class="btn btn-danger"
                        onclick="removePurchaseItem(${itemId})">

                        ×

                    </button>

                </div>


            </div>

        </div>

    `;


    container.insertAdjacentHTML(
        "beforeend",
        itemHtml
    );


    calculatePurchaseTotal();

}


// ==========================================
// Remove Purchase Item
// ==========================================

function removePurchaseItem(itemId) {

    const item =
        document.querySelector(
            `[data-item-id="${itemId}"]`
        );


    if (item) {

        item.remove();

    }


    calculatePurchaseTotal();

}


// ==========================================
// Calculate Purchase Total
// ==========================================

function calculatePurchaseTotal() {

    const items =
        document.querySelectorAll(
            ".purchase-item"
        );


    let total = 0;


    items.forEach(
        function (item) {

            const quantity =
                Number(
                    item.querySelector(
                        ".item-quantity"
                    ).value
                );


            const price =
                Number(
                    item.querySelector(
                        ".item-price"
                    ).value
                );


            total +=
                quantity * price;

        }
    );


    document.getElementById(
        "purchaseTotal"
    ).textContent =
        total.toFixed(2);

}


// ==========================================
// Save Purchase
// ==========================================

async function savePurchase() {

    const role =
        getUserRole();


    // Staff cannot create purchase

    if (
        role !== "admin" &&
        role !== "manager"
    ) {

        showMessage(
            "You do not have permission to create purchases",
            "danger"
        );

        return;

    }


    const token =
        getToken();


    if (!token) {

        window.location.href =
            "/login";

        return;

    }


    const supplierId =
        document.getElementById(
            "purchaseSupplier"
        ).value;


    if (!supplierId) {

        showMessage(
            "Please select a supplier",
            "danger"
        );

        return;

    }


    const itemElements =
        document.querySelectorAll(
            ".purchase-item"
        );


    if (itemElements.length === 0) {

        showMessage(
            "Please add at least one product",
            "danger"
        );

        return;

    }


    const items = [];


    for (
        const item
        of itemElements
    ) {

        const productId =
            item.querySelector(
                ".item-product"
            ).value;


        const quantity =
            Number(
                item.querySelector(
                    ".item-quantity"
                ).value
            );


        const unitPrice =
            Number(
                item.querySelector(
                    ".item-price"
                ).value
            );


        if (!productId) {

            showMessage(
                "Please select a product for every item",
                "danger"
            );

            return;

        }


        if (quantity <= 0) {

            showMessage(
                "Quantity must be greater than 0",
                "danger"
            );

            return;

        }


        if (unitPrice < 0) {

            showMessage(
                "Unit price cannot be negative",
                "danger"
            );

            return;

        }


        items.push({

            product_id:
                Number(productId),

            quantity:
                quantity,

            unit_price:
                unitPrice

        });

    }


    try {

        const response =
            await fetch(
                "/api/purchases",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body: JSON.stringify({

                        supplier_id:
                            Number(supplierId),

                        items:
                            items

                    })

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
                "Failed to create purchase",
                "danger"
            );

            return;

        }


        showMessage(
            data.message ||
            "Purchase created successfully",
            "success"
        );


        const modalElement =
            document.getElementById(
                "purchaseModal"
            );


        const modal =
            bootstrap.Modal.getInstance(
                modalElement
            );


        if (modal) {

            modal.hide();

        }


        await loadPurchases();

    }

    catch (error) {

        console.error(
            "Purchase creation error:",
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


        controlPurchaseUI();


        await loadPurchaseData();

        await loadPurchases();

    }
);