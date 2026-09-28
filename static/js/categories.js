let editingCategoryId = null;


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

function controlCategoryUI() {

    const role = getUserRole();


    const addButton =
        document.getElementById("addCategoryButton");


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


    setTimeout(() => {

        messageBox.classList.add("d-none");

    }, 3000);

}


// ==========================================
// Load Categories
// ==========================================

async function loadCategories() {

    if (!checkAuthentication()) {
        return;
    }


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


        displayCategories(
            data.categories
        );

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
// Display Categories
// ==========================================

function displayCategories(categories) {

    const tableBody =
        document.getElementById(
            "categoriesTableBody"
        );


    tableBody.innerHTML = "";


    if (!categories || categories.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="text-center">

                    No categories found

                </td>

            </tr>

        `;

        return;

    }


    const role = getUserRole();


    categories.forEach(category => {

        let createdAt = "-";


        if (category.created_at) {

            createdAt =
                new Date(
                    category.created_at
                ).toLocaleDateString();

        }


        let actionButtons = "";


        // ==================================
        // Admin
        // ==================================

        if (role === "admin") {

            actionButtons = `

                <button
                    class="btn btn-sm btn-primary"
                    onclick="editCategory(${category.id})">

                    Edit

                </button>


                <button
                    class="btn btn-sm btn-danger"
                    onclick="deleteCategory(${category.id})">

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
                    class="btn btn-sm btn-outline-primary"
                    onclick="editCategory(${category.id})">

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
                    ${category.id}
                </td>

                <td>
                    ${category.name}
                </td>

                <td>
                    ${category.description || "-"}
                </td>

                <td>
                    ${createdAt}
                </td>

                <td>
                    ${actionButtons}
                </td>

            </tr>

        `;

    });

}


// ==========================================
// Open Add Category Modal
// ==========================================

function openAddCategoryModal() {

    const role = getUserRole();


    // Staff cannot add

    if (
        role !== "admin" &&
        role !== "manager"
    ) {

        showMessage(
            "You do not have permission to add categories",
            "danger"
        );

        return;

    }


    editingCategoryId = null;


    document.getElementById(
        "categoryModalTitle"
    ).textContent = "Add Category";


    document.getElementById(
        "categoryForm"
    ).reset();


    document.getElementById(
        "categoryId"
    ).value = "";

}


// ==========================================
// Save Category
// ==========================================

async function saveCategory() {

    const role = getUserRole();


    // Staff cannot create/update

    if (
        role !== "admin" &&
        role !== "manager"
    ) {

        showMessage(
            "You do not have permission to modify categories",
            "danger"
        );

        return;

    }


    const token = getToken();


    const name =
        document.getElementById(
            "categoryName"
        ).value.trim();


    const description =
        document.getElementById(
            "categoryDescription"
        ).value.trim();


    if (!name) {

        showMessage(
            "Category name is required",
            "danger"
        );

        return;

    }


    const categoryData = {

        name: name,

        description: description

    };


    try {

        let url = "/api/categories";

        let method = "POST";


        if (editingCategoryId) {

            url =
                `/api/categories/${editingCategoryId}`;

            method = "PUT";

        }


        const response = await fetch(url, {

            method: method,

            headers: {

                "Content-Type":
                    "application/json",

                "Authorization":
                    `Bearer ${token}`

            },

            body:
                JSON.stringify(categoryData)

        });


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

            editingCategoryId
                ? "Category updated successfully"
                : "Category created successfully"

        );


        const modalElement =
            document.getElementById(
                "categoryModal"
            );


        const modal =
            bootstrap.Modal.getInstance(
                modalElement
            );


        if (modal) {
            modal.hide();
        }


        await loadCategories();

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
// Edit Category
// ==========================================

async function editCategory(categoryId) {

    const role = getUserRole();


    // Staff cannot edit

    if (
        role !== "admin" &&
        role !== "manager"
    ) {

        showMessage(
            "You do not have permission to edit categories",
            "danger"
        );

        return;

    }


    const token = getToken();


    try {

        const response = await fetch(
            `/api/categories/${categoryId}`,
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
                data.error || "Failed to load category",
                "danger"
            );

            return;

        }


        const category =
            data;


        editingCategoryId =
            category.id;


        document.getElementById(
            "categoryModalTitle"
        ).textContent =
            "Edit Category";


        document.getElementById(
            "categoryId"
        ).value =
            category.id;


        document.getElementById(
            "categoryName"
        ).value =
            category.name;


        document.getElementById(
            "categoryDescription"
        ).value =
            category.description || "";


        const modalElement =
            document.getElementById(
                "categoryModal"
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
// Delete Category
// ==========================================

async function deleteCategory(categoryId) {

    const role = getUserRole();


    // Only Admin can delete

    if (role !== "admin") {

        showMessage(
            "Only admin can delete categories",
            "danger"
        );

        return;

    }


    const confirmed =
        confirm(
            "Are you sure you want to delete this category?"
        );


    if (!confirmed) {
        return;
    }


    const token = getToken();


    try {

        const response = await fetch(
            `/api/categories/${categoryId}`,
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

            window.location.href = "/login";

            return;

        }


        const data =
            await response.json();


        if (!response.ok) {

            showMessage(
                data.error ||
                "Failed to delete category",
                "danger"
            );

            return;

        }


        showMessage(
            "Category deleted successfully"
        );


        await loadCategories();

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


        controlCategoryUI();


        await loadCategories();

    }
);