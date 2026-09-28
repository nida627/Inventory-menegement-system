document
    .getElementById("registerForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const errorMessage =
            document.getElementById("errorMessage");

        const successMessage =
            document.getElementById("successMessage");


        // Hide old messages
        errorMessage.classList.add("d-none");
        successMessage.classList.add("d-none");


        // Password confirmation
        if (password !== confirmPassword) {

            errorMessage.textContent =
                "Passwords do not match.";

            errorMessage.classList.remove("d-none");

            return;
        }


        try {

            const response = await fetch("/api/auth/register", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })

            });


            const data = await response.json();


            if (!response.ok) {

                errorMessage.textContent =
                    data.error || "Registration failed.";

                errorMessage.classList.remove("d-none");

                return;
            }


            successMessage.textContent =
                data.message || "Registration successful!";

            successMessage.classList.remove("d-none");


            // Redirect to login
            setTimeout(function () {

                window.location.href = "/login";

            }, 1000);


        } catch (error) {

            console.error("Registration error:", error);

            errorMessage.textContent =
                "Unable to connect to server.";

            errorMessage.classList.remove("d-none");

        }

    });