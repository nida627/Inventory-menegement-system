let inventoryProducts = [];


// ==========================================
// LOAD CURRENT INVENTORY
// ==========================================

async function loadInventory() {

    const token = localStorage.getItem("access_token");

    if (!token) {
        window.location.href = "/login";
        return;
    }

    try {

        const response = await fetch("/api/inventory", {
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
            showInventoryMessage(
                data.error || "Failed to load inventory",
                "danger"
            );
            return;
        }

        inventoryProducts = data.inventory || [];

        displayInventory(inventoryProducts);

        document.getElementById("totalProducts").textContent =
            inventoryProducts.length;

    } catch (error) {

        console.error("Inventory loading error:", error);

        showInventoryMessage(
            "Unable to connect to server",
            "danger"
        );
    }
}


// ==========================================
// DISPLAY CURRENT INVENTORY
// ==========================================

function displayInventory(products) {

    const tableBody =
        document.getElementById("stockTableBody");

    tableBody.innerHTML = "";

    if (!products || products.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    No inventory records found
                </td>
            </tr>
        `;

        return;
    }


    products.forEach(function(product) {

        let statusClass = "text-success";
        let statusText = "In Stock";


        if (product.stock_status === "low_stock") {
            statusClass = "text-warning";
            statusText = "Low Stock";
        }


        if (product.stock_status === "out_of_stock") {
            statusClass = "text-danger";
            statusText = "Out of Stock";
        }


        tableBody.innerHTML += `
            <tr>

                <td>${product.product_id}</td>

                <td>${product.name}</td>

                <td>${product.sku}</td>

                <td>${product.category || "-"}</td>

                <td>${product.quantity}</td>

                <td>${product.minimum_stock}</td>

                <td>
                    <span class="${statusClass}">
                        ${statusText}
                    </span>
                </td>

            </tr>
        `;
    });
}


// ==========================================
// LOAD LOW STOCK / OUT OF STOCK COUNTS
// ==========================================

async function loadStockStatus() {

    const token = localStorage.getItem("access_token");

    if (!token) {
        window.location.href = "/login";
        return;
    }

    try {

        const lowStockResponse = await fetch(
            "/api/inventory/low-stock",
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const outOfStockResponse = await fetch(
            "/api/inventory/out-of-stock",
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        if (
            lowStockResponse.status === 401 ||
            outOfStockResponse.status === 401
        ) {
            localStorage.clear();
            window.location.href = "/login";
            return;
        }


        const lowStockData =
            await lowStockResponse.json();

        const outOfStockData =
            await outOfStockResponse.json();


        document.getElementById("lowStockCount").textContent =
            (lowStockData.low_stock_products || []).length;


        document.getElementById("outOfStockCount").textContent =
            (outOfStockData.out_of_stock_products || []).length;


    } catch (error) {

        console.error(
            "Stock status loading error:",
            error
        );
    }
}


// ==========================================
// LOAD STOCK MOVEMENTS
// ==========================================

async function loadMovements() {

    const token = localStorage.getItem("access_token");

    if (!token) {
        window.location.href = "/login";
        return;
    }

    try {

        const response = await fetch(
            "/api/inventory/movements",
            {
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

            showInventoryMessage(
                data.error || "Failed to load movements",
                "danger"
            );

            return;
        }


        displayMovements(data.movements || []);


    } catch (error) {

        console.error(
            "Movement loading error:",
            error
        );
    }
}


// ==========================================
// DISPLAY STOCK MOVEMENTS
// ==========================================

function displayMovements(movements) {

    const tableBody =
        document.getElementById("movementTableBody");

    tableBody.innerHTML = "";


    if (!movements || movements.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    No stock movements found
                </td>
            </tr>
        `;

        return;
    }


    movements.forEach(function(movement) {

        const quantity =
            Number(movement.quantity || 0);


        const quantityDisplay =
            quantity > 0
                ? `+${quantity}`
                : quantity;


        tableBody.innerHTML += `
            <tr>

                <td>${movement.id}</td>

                <td>${movement.product_name || "-"}</td>

                <td>${movement.movement_type || "-"}</td>

                <td>${quantityDisplay}</td>

                <td>
                    ${movement.reference_type || "-"}
                    ${
                        movement.reference_id
                            ? "#" + movement.reference_id
                            : ""
                    }
                </td>

                <td>${movement.note || "-"}</td>

                <td>
                    ${
                        movement.created_at
                            ? new Date(
                                movement.created_at
                            ).toLocaleString()
                            : "-"
                    }
                </td>

            </tr>
        `;
    });
}


// ==========================================
// LOAD PRODUCTS FOR STOCK ADJUSTMENT
// ==========================================

async function loadAdjustmentProducts() {

    const token = localStorage.getItem("access_token");

    if (!token) {
        window.location.href = "/login";
        return;
    }

    try {

        const response = await fetch(
            "/api/products",
            {
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
            return;
        }


        const select =
            document.getElementById("adjustmentProduct");


        select.innerHTML = `
            <option value="">
                Select Product
            </option>
        `;


        (data.products || []).forEach(function(product) {

            select.innerHTML += `
                <option value="${product.id}">
                    ${product.name} (${product.sku})
                    - Stock: ${product.quantity}
                </option>
            `;
        });


    } catch (error) {

        console.error(
            "Product loading error:",
            error
        );
    }
}


// ==========================================
// OPEN ADJUSTMENT MODAL
// ==========================================

function openAdjustmentModal() {

    const role = getUserRole();

    if (role !== "admin" && role !== "manager") {

        showInventoryMessage(
            "You do not have permission to adjust stock",
            "danger"
        );

        return;
    }

    document.getElementById(
        "adjustmentProduct"
    ).value = "";

    document.getElementById(
        "adjustmentQuantity"
    ).value = "";

    document.getElementById(
        "adjustmentNote"
    ).value = "";

    document.getElementById(
        "adjustmentMessage"
    ).className = "alert d-none";

    loadAdjustmentProducts();
}


// ==========================================
// SAVE STOCK ADJUSTMENT
// ==========================================

async function saveAdjustment() {

    const role = getUserRole();

    if (role !== "admin" && role !== "manager") {

        showAdjustmentMessage(
            "You do not have permission to adjust stock",
            "danger"
        );

        return;
    }

    const token =
        localStorage.getItem("access_token");

    // ...baaki tumhara existing code same rahega
}

async function saveAdjustment() {

    const token =
        localStorage.getItem("access_token");


    if (!token) {
        window.location.href = "/login";
        return;
    }


    const productId =
        document.getElementById(
            "adjustmentProduct"
        ).value;


    const quantity =
        Number(
            document.getElementById(
                "adjustmentQuantity"
            ).value
        );


    const note =
        document.getElementById(
            "adjustmentNote"
        ).value.trim();


    if (!productId) {

        showAdjustmentMessage(
            "Please select a product",
            "danger"
        );

        return;
    }


    if (!quantity || quantity === 0) {

        showAdjustmentMessage(
            "Adjustment quantity cannot be zero",
            "danger"
        );

        return;
    }


    if (!note) {

        showAdjustmentMessage(
            "Please enter a reason",
            "danger"
        );

        return;
    }


    try {

        const response = await fetch(
            "/api/inventory/adjust",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({
                    product_id: Number(productId),
                    quantity: quantity,
                    note: note
                })
            }
        );


        if (response.status === 401) {

            localStorage.clear();
            window.location.href = "/login";

            return;
        }


        const data = await response.json();


        if (!response.ok) {

            showAdjustmentMessage(
                data.error || "Stock adjustment failed",
                "danger"
            );

            return;
        }


        showInventoryMessage(
            data.message || "Stock adjusted successfully",
            "success"
        );


        const modalElement =
            document.getElementById(
                "adjustmentModal"
            );


        const modal =
            bootstrap.Modal.getInstance(
                modalElement
            );


        modal.hide();


        await loadInventory();
        await loadStockStatus();
        await loadMovements();


    } catch (error) {

        console.error(
            "Stock adjustment error:",
            error
        );


        showAdjustmentMessage(
            "Unable to connect to server",
            "danger"
        );
    }
}


// ==========================================
// ADJUSTMENT MESSAGE
// ==========================================

function showAdjustmentMessage(message, type) {

    const messageBox =
        document.getElementById(
            "adjustmentMessage"
        );


    messageBox.textContent = message;

    messageBox.className =
        `alert alert-${type}`;
}


// ==========================================
// GENERAL INVENTORY MESSAGE
// ==========================================

function showInventoryMessage(message, type) {

    let messageBox =
        document.getElementById(
            "inventoryMessage"
        );


    if (!messageBox) {

        messageBox = document.createElement("div");

        messageBox.id = "inventoryMessage";

        document.body.appendChild(messageBox);
    }


    messageBox.textContent = message;

    messageBox.className =
        `alert alert-${type} position-fixed top-0 end-0 m-3`;


    setTimeout(function() {

        if (messageBox) {
            messageBox.remove();
        }

    }, 3000);
}


// ==========================================
// INITIALIZE INVENTORY PAGE
// ==========================================

async function initializeInventory() {

    controlInventoryUI();

    await loadInventory();

    await loadStockStatus();

    await loadMovements();
}

initializeInventory();

// ==========================================
// GET CURRENT USER
// ==========================================

function getCurrentUser() {

    const userData = localStorage.getItem("user");

    if (!userData) {
        return null;
    }

    try {
        return JSON.parse(userData);
    } catch (error) {
        console.error("Unable to read user information:", error);
        return null;
    }
}


// ==========================================
// GET USER ROLE
// ==========================================

function getUserRole() {

    const user = getCurrentUser();

    return user ? user.role : null;
}


// ==========================================
// CONTROL ROLE BASED UI
// ==========================================

function controlInventoryUI() {

    const role = getUserRole();

    const adjustButton =
        document.getElementById("adjustStockButton");

    // Staff can view inventory but cannot adjust stock
    if (role === "staff") {

        if (adjustButton) {
            adjustButton.classList.add("d-none");
        }

    }

}