// ==========================================
// Global Data
// ==========================================

let customers = [];

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

    const user =
        getCurrentUser();

    return user
        ? user.role
        : null;

}


// ==========================================
// Authentication Check
// ==========================================

function checkAuthentication() {

    const token =
        getToken();

    if (!token) {

        window.location.href =
            "/login";

        return false;

    }

    return true;

}


// ==========================================
// Role Based UI
// ==========================================

function controlSaleUI() {

    const role =
        getUserRole();

    const addButton =
        document.getElementById(
            "addSaleButton"
        );


    /*
        Current backend uses
        @staff_required for sales.

        Therefore:

        Admin   -> Create Sale
        Manager -> Create Sale
        Staff   -> Create Sale

        So no role-based hiding
        is required here.
    */

    if (
        role !== "admin" &&
        role !== "manager" &&
        role !== "staff"
    ) {

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
// Load Customers & Products
// ==========================================

async function loadSaleData() {

    if (!checkAuthentication()) {
        return;
    }


    const token =
        getToken();


    try {

        const customerResponse =
            await fetch(
                "/api/customers",
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
            customerResponse.status === 401 ||
            productResponse.status === 401
        ) {

            localStorage.clear();

            window.location.href =
                "/login";

            return;

        }


        const customerData =
            await customerResponse.json();


        const productData =
            await productResponse.json();


        if (!customerResponse.ok) {

            showMessage(
                customerData.error ||
                "Failed to load customers",
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


        customers =
            customerData.customers || [];


        products =
            productData.products || [];

    }

    catch (error) {

        console.error(
            "Sale data loading error:",
            error
        );

        showMessage(
            "Unable to load sale data",
            "danger"
        );

    }

}


// ==========================================
// Load Sales
// ==========================================

async function loadSales() {

    if (!checkAuthentication()) {
        return;
    }


    const token =
        getToken();


    try {

        const response =
            await fetch(
                "/api/sales",
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
                "salesTableBody"
            );


        if (!response.ok) {

            tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        class="text-center text-danger">

                        ${data.error ||
                        "Failed to load sales"}

                    </td>

                </tr>

            `;

            return;

        }


        tableBody.innerHTML = "";


        if (
            !data.sales ||
            data.sales.length === 0
        ) {

            tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        class="text-center">

                        No sales found

                    </td>

                </tr>

            `;

            return;

        }


        data.sales.forEach(
            function (sale) {

                let cancelButton = "";


                if (
                    sale.status ===
                    "cancelled"
                ) {

                    cancelButton = `

                        <button
                            class="btn btn-sm btn-secondary"
                            disabled>

                            Cancelled

                        </button>

                    `;

                }

                else {

                    cancelButton = `

                        <button
                            class="btn btn-sm btn-warning"
                            onclick="cancelSale(${sale.id})">

                            Cancel

                        </button>

                    `;

                }


                tableBody.innerHTML += `

                    <tr>

                        <td>
                            ${sale.id}
                        </td>

                        <td>
                            ${sale.customer_name || "-"}
                        </td>

                        <td>

                            ${
                                sale.sale_date
                                    ? new Date(
                                        sale.sale_date
                                      ).toLocaleDateString()
                                    : "-"
                            }

                        </td>

                        <td>

                            ₹${Number(
                                sale.total_amount || 0
                            ).toFixed(2)}

                        </td>

                        <td>
                            ${sale.status || "-"}
                        </td>

                        <td>

                            ${cancelButton}

                        </td>

                    </tr>

                `;

            }
        );

    }

    catch (error) {

        console.error(
            "Sale loading error:",
            error
        );

        showMessage(
            "Unable to connect to server",
            "danger"
        );

    }

}


// ==========================================
// Open Add Sale Modal
// ==========================================

function openAddSaleModal() {

    const role =
        getUserRole();


    if (
        role !== "admin" &&
        role !== "manager" &&
        role !== "staff"
    ) {

        showMessage(
            "You do not have permission to create sales",
            "danger"
        );

        return;

    }


    const customerSelect =
        document.getElementById(
            "saleCustomer"
        );


    customerSelect.innerHTML = `

        <option value="">

            Select Customer

        </option>

    `;


    customers.forEach(
        function (customer) {

            customerSelect.innerHTML += `

                <option value="${customer.id}">

                    ${customer.name}

                </option>

            `;

        }
    );


    document.getElementById(
        "saleItems"
    ).innerHTML = "";


    document.getElementById(
        "saleTotal"
    ).textContent =
        "0.00";


    addSaleItem();

}


// ==========================================
// Add Sale Item
// ==========================================

function addSaleItem() {

    const role =
        getUserRole();


    if (
        role !== "admin" &&
        role !== "manager" &&
        role !== "staff"
    ) {

        return;

    }


    const container =
        document.getElementById(
            "saleItems"
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

                <option
                    value="${product.id}"
                    data-stock="${product.quantity}"
                    data-price="${product.price}">

                    ${product.name}
                    (${product.sku})

                    - Stock:
                    ${product.quantity}

                    - Price:
                    ₹${product.price}

                </option>

            `;

        }
    );


    const itemHtml = `

        <div
            class="border rounded p-3 mb-3 sale-item"
            data-item-id="${itemId}">


            <div
                class="row g-2 align-items-end">


                <!-- Product -->

                <div class="col-md-5">

                    <label class="form-label">

                        Product

                    </label>


                    <select
                        class="form-select item-product"
                        onchange="productSelected(this)">

                        ${productOptions}

                    </select>

                </div>


                <!-- Quantity -->

                <div class="col-md-3">

                    <label class="form-label">

                        Quantity

                    </label>


                    <input
                        type="number"
                        class="form-control item-quantity"
                        min="1"
                        value="1"
                        onchange="calculateSaleTotal()">

                </div>


                <!-- Unit Price -->

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
                        onchange="calculateSaleTotal()">

                </div>


                <!-- Remove -->

                <div class="col-md-1">

                    <button
                        type="button"
                        class="btn btn-danger"
                        onclick="removeSaleItem(${itemId})">

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


    calculateSaleTotal();

}


// ==========================================
// Remove Sale Item
// ==========================================

function removeSaleItem(itemId) {

    const item =
        document.querySelector(
            `[data-item-id="${itemId}"]`
        );


    if (item) {

        item.remove();

    }


    calculateSaleTotal();

}


// ==========================================
// Product Selected
// ==========================================

function productSelected(
    selectElement
) {

    const selectedOption =
        selectElement.options[
            selectElement.selectedIndex
        ];


    const price =
        selectedOption.getAttribute(
            "data-price"
        );


    const stock =
        Number(
            selectedOption.getAttribute(
                "data-stock"
            )
        );


    const item =
        selectElement.closest(
            ".sale-item"
        );


    const priceInput =
        item.querySelector(
            ".item-price"
        );


    const quantityInput =
        item.querySelector(
            ".item-quantity"
        );


    if (price !== null) {

        priceInput.value =
            price;

    }

    else {

        priceInput.value =
            0;

    }


    // If product is out of stock

    if (stock <= 0) {

        quantityInput.value =
            0;

        quantityInput.max =
            0;

    }

    else {

        quantityInput.value =
            1;

        quantityInput.max =
            stock;

    }


    calculateSaleTotal();

}


// ==========================================
// Calculate Sale Total
// ==========================================

function calculateSaleTotal() {

    const items =
        document.querySelectorAll(
            ".sale-item"
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
        "saleTotal"
    ).textContent =
        total.toFixed(2);

}


// ==========================================
// Save Sale
// ==========================================

async function saveSale() {

    const role =
        getUserRole();


    if (
        role !== "admin" &&
        role !== "manager" &&
        role !== "staff"
    ) {

        showMessage(
            "You do not have permission to create sales",
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


    const customerId =
        document.getElementById(
            "saleCustomer"
        ).value;


    if (!customerId) {

        showMessage(
            "Please select a customer",
            "danger"
        );

        return;

    }


    const itemElements =
        document.querySelectorAll(
            ".sale-item"
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

        const productSelect =
            item.querySelector(
                ".item-product"
            );


        const productId =
            productSelect.value;


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


        const selectedOption =
            productSelect.options[
                productSelect.selectedIndex
            ];


        const availableStock =
            Number(
                selectedOption.getAttribute(
                    "data-stock"
                )
            );


        if (quantity <= 0) {

            showMessage(
                "Quantity must be greater than 0",
                "danger"
            );

            return;

        }


        if (
            availableStock >= 0 &&
            quantity > availableStock
        ) {

            showMessage(
                `Insufficient stock. Available stock: ${availableStock}`,
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
                "/api/sales",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify({

                            customer_id:
                                Number(customerId),

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
                "Failed to create sale",
                "danger"
            );

            return;

        }


        showMessage(
            data.message ||
            "Sale created successfully",
            "success"
        );


        const modalElement =
            document.getElementById(
                "saleModal"
            );


        const modal =
            bootstrap.Modal.getInstance(
                modalElement
            );


        if (modal) {

            modal.hide();

        }


        // Refresh products because stock changed

        await loadSaleData();


        // Refresh sales table

        await loadSales();

    }

    catch (error) {

        console.error(
            "Sale creation error:",
            error
        );


        showMessage(
            "Unable to connect to server",
            "danger"
        );

    }

}


// ==========================================
// Cancel Sale
// ==========================================

async function cancelSale(
    saleId
) {

    const token =
        getToken();


    if (!token) {

        window.location.href =
            "/login";

        return;

    }


    const confirmed =
        confirm(
            "Are you sure you want to cancel this sale?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/sales/${saleId}/cancel`,
                {

                    method: "PUT",

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
                "Sale cannot be cancelled",
                "danger"
            );

            return;

        }


        showMessage(
            data.message ||
            "Sale cancelled successfully",
            "success"
        );


        // Sale cancellation restores stock

        await loadSaleData();

        await loadSales();

    }

    catch (error) {

        console.error(
            "Sale cancellation error:",
            error
        );


        showMessage(
            "Unable to connect to server",
            "danger"
        );

    }

}


// ==========================================
// Page Initialization
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        if (!checkAuthentication()) {
            return;
        }


        controlSaleUI();


        await loadSaleData();

        await loadSales();

    }
);