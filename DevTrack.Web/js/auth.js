const API_URL = "http://localhost:5104/api/Users";


// ==========================================
// LOGIN
// ==========================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        const errorMessage = document.getElementById("errorMessage");
        const loginButton = document.getElementById("loginButton");

        errorMessage.textContent = "";
        loginButton.disabled = true;
        loginButton.textContent = "Logging in...";

        try {

            const response = await fetch(`${API_URL}/login`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            if (!response.ok) {

                const message = await response.text();

                throw new Error(
                    message || "Invalid username or password."
                );
            }

            const data = await response.json();

            // Save authentication data
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Go to dashboard
            window.location.href = "dashboard.html";

        } catch (error) {

            errorMessage.textContent = error.message;

        } finally {

            loginButton.disabled = false;
            loginButton.textContent = "Login";

        }

    });

}

// ==========================================
// LOGOUT
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const logoutButton =
        document.getElementById("logoutButton");

    const logoutModal =
        document.getElementById("logoutModal");

    const cancelLogoutButton =
        document.getElementById("cancelLogoutButton");

    const confirmLogoutButton =
        document.getElementById("confirmLogoutButton");


    // ==========================================
    // OPEN LOGOUT MODAL
    // ==========================================

    if (logoutButton && logoutModal) {

        logoutButton.addEventListener("click", function (event) {

            event.preventDefault();

            logoutModal.classList.add("show");

        });

    }


    // ==========================================
    // CANCEL LOGOUT
    // ==========================================

    if (cancelLogoutButton && logoutModal) {

        cancelLogoutButton.addEventListener("click", function (event) {

            event.preventDefault();

            logoutModal.classList.remove("show");

        });

    }


    // ==========================================
    // CONFIRM LOGOUT
    // ==========================================

    if (confirmLogoutButton) {

        confirmLogoutButton.addEventListener("click", function (event) {

            event.preventDefault();

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href = "index.html";

        });

    }


    // ==========================================
    // CLICK OUTSIDE MODAL
    // ==========================================

    if (logoutModal) {

        logoutModal.addEventListener("click", function (event) {

            if (event.target === logoutModal) {

                logoutModal.classList.remove("show");

            }

        });

    }

});