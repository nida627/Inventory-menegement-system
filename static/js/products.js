let editingProductId = null;

// ==========================================
// Get JWT Token
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

    console.error("Unable to read user:", error);

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
// Control Product UI
// ==========================================

function controlProductUI() {


const role = getUserRole();

const addButton =
    document.getElementById("addProductButton");

if (!addButton) {
    return;
}


// Staff = View Only

if (role === "staff") {

    addButton.classList.add("d-none");

}


}

// ==========================================
// Check Login
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
// Show Message
// ==========================================

function showMessage(message, type = "success") {


const messageBox =
    document.getElementById("message");

messageBox.textContent = message;

messageBox.className =
    `alert alert-${type}`;

setTimeout(() => {

    messageBox.classList.add("d-none");

}, 3000);


}

// ==========================================
// Load Products
// ==========================================

async function loadProducts() {


if (!checkAuthentication()) {
    return;
}

const token = getToken();

try {

    const response = await fetch(
        "/api/products",
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


    const data = await response.json();


    if (!response.ok) {

        showMessage(
            data.error || "Failed to load products",
            "danger"
        );

        return;

    }


    displayProducts(data.products);

}

catch (error) {

    console.error(error);

    showMessage(
        "Unable to connect to server",
        "danger"
    );

}


}

// ==========================================
// Display Products
// ==========================================

function displayProducts(products) {


const tableBody =
    document.getElementById("productsTableBody");

tableBody.innerHTML = "";


if (!products || products.length === 0) {

    tableBody.innerHTML = `
        <tr>
            <td colspan="8" class="text-center">
                No products found
            </td>
        </tr>
    `;

    return;

}


const role = getUserRole();


products.forEach(product => {

    let stockClass = "";


    if (product.quantity === 0) {

        stockClass = "text-danger fw-bold";

    }

    else if (
        product.quantity <= product.minimum_stock
    ) {

        stockClass = "text-warning fw-bold";

    }


    let actionButtons = "";


    // ==================================
    // Admin
    // ==================================

    if (role === "admin") {

        actionButtons = `

            <button
                class="btn btn-sm btn-primary me-1"
                onclick="editProduct(${product.id})">
                Edit
            </button>

            <button
                class="btn btn-sm btn-danger"
                onclick="deleteProduct(${product.id})">
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
                onclick="editProduct(${product.id})">

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

            <td>${product.id}</td>

            <td>${product.name}</td>

            <td>${product.sku}</td>

            <td>
                ${product.category_name || "-"}
            </td>

            <td>
                ₹${Number(product.price).toFixed(2)}
            </td>

            <td class="${stockClass}">
                ${product.quantity}
            </td>

            <td>
                ${product.minimum_stock}
            </td>

            <td>
                ${actionButtons}
            </td>

        </tr>

    `;

});


}

// ==========================================
// Load Categories
// ==========================================

async function loadCategories() {

const token = getToken();


try {

    const response = await fetch(
        "/api/categories",
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


    const data = await response.json();


    if (!response.ok) {

        showMessage(
            data.error || "Failed to load categories",
            "danger"
        );

        return;

    }


    const categorySelect =
        document.getElementById("productCategory");


    categorySelect.innerHTML = `
        <option value="">
            Select Category
        </option>
    `;


    data.categories.forEach(category => {

        categorySelect.innerHTML += `

            <option value="${category.id}">
                ${category.name}
            </option>

        `;

    });

}

catch (error) {

    console.error(error);

    showMessage(
        "Unable to load categories",
        "danger"
    );

}


}

// ==========================================
// Open Add Product Modal
// ==========================================

function openAddProductModal() {


const role = getUserRole();


// Only Admin and Manager

if (role !== "admin" && role !== "manager") {

    showMessage(
        "You do not have permission to add products",
        "danger"
    );

    return;

}


editingProductId = null;


document.getElementById(
    "productModalTitle"
).textContent = "Add Product";


document.getElementById(
    "productForm"
).reset();


document.getElementById(
    "productId"
).value = "";


// Quantity can be entered during product creation

document.getElementById(
    "productQuantity"
).disabled = false;


// Opening Cost can be entered during product creation

document.getElementById(
    "productOpeningCost"
).disabled = false;


// Default opening cost

document.getElementById(
    "productOpeningCost"
).value = "0";


}

// ==========================================
// Save Product
// ==========================================

async function saveProduct() {


const role = getUserRole();


// Staff cannot create/update

if (role !== "admin" && role !== "manager") {

    showMessage(
        "You do not have permission to modify products",
        "danger"
    );

    return;

}


const token = getToken();


const name =
    document.getElementById("productName").value.trim();


const sku =
    document.getElementById("productSku").value.trim();


const description =
    document.getElementById("productDescription").value.trim();


const price =
    document.getElementById("productPrice").value;


const quantity =
    document.getElementById("productQuantity").value;


const openingCost =
    document.getElementById("productOpeningCost").value;


const minimumStock =
    document.getElementById("productMinimumStock").value;


const categoryId =
    document.getElementById("productCategory").value;


if (
    !name ||
    !sku ||
    !price ||
    !quantity ||
    !categoryId
) {

    showMessage(
        "Please fill all required fields",
        "danger"
    );

    return;

}


// Opening Cost validation

if (openingCost === "" || Number(openingCost) < 0) {

    showMessage(
        "Opening cost cannot be negative",
        "danger"
    );

    return;

}


const productData = {

    name: name,

    sku: sku,

    description: description,

    price: Number(price),

    minimum_stock: Number(minimumStock),

    category_id: Number(categoryId)

};


// ==========================================
// Quantity + Opening Cost
// Only during product creation
// ==========================================

if (!editingProductId) {

    productData.quantity =
        Number(quantity);

    productData.opening_cost =
        Number(openingCost);

}


try {

    let url = "/api/products";

    let method = "POST";


    if (editingProductId) {

        url =
            `/api/products/${editingProductId}`;

        method = "PUT";

    }


    const response = await fetch(
        url,
        {
            method: method,

            headers: {

                "Content-Type":
                    "application/json",

                "Authorization":
                    `Bearer ${token}`

            },

            body: JSON.stringify(productData)

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
            data.error || "Operation failed",
            "danger"
        );

        return;

    }


    showMessage(

        editingProductId
            ? "Product updated successfully"
            : "Product created successfully"

    );


    const modalElement =
        document.getElementById(
            "productModal"
        );


    const modal =
        bootstrap.Modal.getInstance(
            modalElement
        );


    modal.hide();


    await loadProducts();

}

catch (error) {

    console.error(error);

    showMessage(
        "Unable to connect to server",
        "danger"
    );

}


}

// ==========================================
// Edit Product
// ==========================================

async function editProduct(productId) {


const role = getUserRole();


// Staff cannot edit

if (role !== "admin" && role !== "manager") {

    showMessage(
        "You do not have permission to edit products",
        "danger"
    );

    return;

}


const token = getToken();


try {

    const response = await fetch(
        `/api/products/${productId}`,
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


    if (!response.ok) {

        showMessage(
            data.error || "Failed to load product",
            "danger"
        );

        return;

    }


    // Backend returns product directly

    const product = data;


    editingProductId =
        product.id;


    document.getElementById(
        "productModalTitle"
    ).textContent = "Edit Product";


    document.getElementById(
        "productId"
    ).value = product.id;


    document.getElementById(
        "productName"
    ).value = product.name;


    document.getElementById(
        "productSku"
    ).value = product.sku;


    document.getElementById(
        "productDescription"
    ).value =
        product.description || "";


    document.getElementById(
        "productPrice"
    ).value =
        product.price;


    document.getElementById(
        "productQuantity"
    ).value =
        product.quantity;


    // Quantity cannot be edited directly

    document.getElementById(
        "productQuantity"
    ).disabled = true;


    // Opening Cost is historical
    // and cannot be edited

    document.getElementById(
        "productOpeningCost"
    ).value = "0";


    document.getElementById(
        "productOpeningCost"
    ).disabled = true;


    document.getElementById(
        "productMinimumStock"
    ).value =
        product.minimum_stock;


    document.getElementById(
        "productCategory"
    ).value =
        product.category_id;


    const modalElement =
        document.getElementById(
            "productModal"
        );


    const modal =
        new bootstrap.Modal(
            modalElement
        );


    modal.show();

}

catch (error) {

    console.error(error);

    showMessage(
        "Unable to connect to server",
        "danger"
    );

}


}

// ==========================================
// Delete Product
// ==========================================

async function deleteProduct(productId) {


const role = getUserRole();


// Only Admin can delete

if (role !== "admin") {

    showMessage(
        "Only admin can delete products",
        "danger"
    );

    return;

}


const confirmed =
    confirm(
        "Are you sure you want to delete this product?"
    );


if (!confirmed) {
    return;
}


const token = getToken();


try {

    const response = await fetch(
        `/api/products/${productId}`,
        {
            method: "DELETE",

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


    if (!response.ok) {

        showMessage(
            data.error || "Failed to delete product",
            "danger"
        );

        return;

    }


    showMessage(
        "Product deleted successfully"
    );


    await loadProducts();

}

catch (error) {

    console.error(error);

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


    controlProductUI();

    await loadCategories();

    await loadProducts();

}

);
