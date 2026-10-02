document.addEventListener("DOMContentLoaded", function () {

    const toggle = document.getElementById("darkModeToggle");

    // Apply saved theme to every page
    const savedTheme = localStorage.getItem("devtrack-theme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }

    // Settings page has the toggle
    if (toggle) {

        toggle.checked = savedTheme === "dark";

        toggle.addEventListener("change", function () {

            if (toggle.checked) {

                document.body.classList.add("dark-mode");
                localStorage.setItem("devtrack-theme", "dark");

            } else {

                document.body.classList.remove("dark-mode");
                localStorage.setItem("devtrack-theme", "light");

            }

        });

    }

});