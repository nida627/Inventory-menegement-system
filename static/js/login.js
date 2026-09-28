document
    .getElementById("loginForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const errorMessage = document.getElementById("errorMessage");

        errorMessage.classList.add("d-none");

        try {

            const response = await fetch("/api/auth/login", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                errorMessage.textContent =
                    data.error || "Login failed";

                errorMessage.classList.remove("d-none");

                return;
            }

            localStorage.setItem(
                "access_token",
                data.access_token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            window.location.href = "/dashboard";

        } catch (error) {

            errorMessage.textContent =
                "Unable to connect to server";

            errorMessage.classList.remove("d-none");
        }
    });