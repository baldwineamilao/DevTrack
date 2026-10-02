// ==========================================
// DEVTRACK SETTINGS
// ==========================================

// ==========================================
// API
// ==========================================

const API_URL = "http://localhost:5104/api/Users";


// ==========================================
// AUTHENTICATION
// ==========================================

const token = localStorage.getItem("token");

if (!token) {

    window.location.href = "index.html";

}


// ==========================================
// LOAD USER INFORMATION
// ==========================================

const storedUser = localStorage.getItem("user");

let currentUser = null;

if (storedUser) {

    currentUser = JSON.parse(storedUser);

    const usernameInput =
        document.getElementById("username");

    const emailInput =
        document.getElementById("email");

    const firstNameInput =
        document.getElementById("firstName");

    const lastNameInput =
        document.getElementById("lastName");


    if (usernameInput) {
        usernameInput.value =
            currentUser.username || "";
    }

    if (emailInput) {
        emailInput.value =
            currentUser.email || "";
    }

    if (firstNameInput) {
        firstNameInput.value =
            currentUser.firstName || "";
    }

    if (lastNameInput) {
        lastNameInput.value =
            currentUser.lastName || "";
    }

}


// ==========================================
// PROFILE PICTURE
// ==========================================

const profilePictureInput =
    document.getElementById("profilePictureInput");

const chooseProfilePictureButton =
    document.getElementById(
        "chooseProfilePictureButton"
    );

const profilePicture =
    document.getElementById("profilePicture");

const profilePicturePlaceholder =
    document.getElementById(
        "profilePicturePlaceholder"
    );


// ==========================================
// LOAD PROFILE PICTURE
// ==========================================

function loadProfilePicture() {

    if (!currentUser) {
        return;
    }

    if (currentUser.profilePicture) {

        profilePicture.src =
            `http://localhost:5104${currentUser.profilePicture}`;

        profilePicture.style.display =
            "block";

        profilePicturePlaceholder.style.display =
            "none";

    } else {

        profilePicture.style.display =
            "none";

        profilePicturePlaceholder.style.display =
            "flex";

    }

}

loadProfilePicture();


// ==========================================
// CHOOSE PROFILE PICTURE
// ==========================================

if (chooseProfilePictureButton) {

    chooseProfilePictureButton.addEventListener(
        "click",
        function () {

            profilePictureInput.click();

        }
    );

}


// ==========================================
// PREVIEW + UPLOAD PROFILE PICTURE
// ==========================================

if (profilePictureInput) {

    profilePictureInput.addEventListener(
        "change",
        async function () {

            const file =
                this.files[0];

            if (!file) {
                return;
            }


            // Check file type

            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];

            if (!allowedTypes.includes(file.type)) {

                alert(
                    "Only JPG, JPEG, PNG, and WEBP images are allowed."
                );

                this.value = "";

                return;

            }


            // Check file size

            if (file.size > 5 * 1024 * 1024) {

                alert(
                    "Image must be smaller than 5 MB."
                );

                this.value = "";

                return;

            }


            // Show preview immediately

            const reader =
                new FileReader();

            reader.onload =
                function (event) {

                    profilePicture.src =
                        event.target.result;

                    profilePicture.style.display =
                        "block";

                    profilePicturePlaceholder.style.display =
                        "none";

                };

            reader.readAsDataURL(file);


            // Upload

            try {

                chooseProfilePictureButton.disabled =
                    true;

                chooseProfilePictureButton.textContent =
                    "Uploading...";


                const formData =
                    new FormData();

                formData.append(
                    "file",
                    file
                );


                const response =
                    await fetch(
                        `${API_URL}/${currentUser.id}/profile-picture`,
                        {
                            method: "POST",

                            headers: {
                                "Authorization":
                                    `Bearer ${token}`
                            },

                            body: formData
                        }
                    );


                if (!response.ok) {

                    const errorText =
                        await response.text();

                    throw new Error(
                        errorText ||
                        "Failed to upload profile picture."
                    );

                }


                const updatedUser =
                    await response.json();


                // Update current user

                currentUser =
                    updatedUser;


                // Update local storage

                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        currentUser
                    )
                );


                // Load saved image

                loadProfilePicture();


                alert(
                    "Profile picture updated successfully!"
                );

            }
            catch (error) {

                console.error(
                    "Profile picture upload error:",
                    error
                );

                alert(
                    error.message ||
                    "Unable to upload profile picture."
                );


                // Restore previous picture

                loadProfilePicture();

            }
            finally {

                chooseProfilePictureButton.disabled =
                    false;

                chooseProfilePictureButton.textContent =
                    "Choose Picture";

                profilePictureInput.value =
                    "";

            }

        }
    );

}


// ==========================================
// SAVE PROFILE
// ==========================================

const saveProfileButton =
    document.getElementById(
        "saveProfileButton"
    );

if (saveProfileButton) {

    saveProfileButton.addEventListener(
        "click",
        async function () {

            if (!currentUser) {

                alert(
                    "User information could not be loaded."
                );

                return;

            }


            const username =
                document.getElementById("username")
                    .value
                    .trim();

            const email =
                document.getElementById("email")
                    .value
                    .trim();

            const firstName =
                document.getElementById("firstName")
                    .value
                    .trim();

            const lastName =
                document.getElementById("lastName")
                    .value
                    .trim();


            if (!username) {

                alert(
                    "Username is required."
                );

                return;

            }


            if (!email) {

                alert(
                    "Email is required."
                );

                return;

            }


            try {

                saveProfileButton.disabled =
                    true;

                saveProfileButton.textContent =
                    "Saving...";


                const response =
                    await fetch(
                        `${API_URL}/${currentUser.id}`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`
                            },

                            body: JSON.stringify({
                                username: username,
                                email: email,
                                firstName: firstName,
                                lastName: lastName
                            })
                        }
                    );


                if (!response.ok) {

                    const errorText =
                        await response.text();

                    throw new Error(
                        errorText ||
                        "Failed to update profile."
                    );

                }


                const updatedUser =
                    await response.json();


                // Preserve profile picture

                updatedUser.profilePicture =
                    currentUser.profilePicture;


                currentUser =
                    updatedUser;


                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        currentUser
                    )
                );


                alert(
                    "Profile updated successfully!"
                );

            }
            catch (error) {

                console.error(
                    "Save profile error:",
                    error
                );

                alert(
                    error.message ||
                    "Unable to update profile."
                );

            }
            finally {

                saveProfileButton.disabled =
                    false;

                saveProfileButton.textContent =
                    "Save Changes";

            }

        }
    );

}


// ==========================================
// LOGOUT CONFIRMATION
// ==========================================

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

    logoutButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            logoutModal.classList.add("show");

        }
    );

}


// ==========================================
// CANCEL LOGOUT
// ==========================================

if (cancelLogoutButton && logoutModal) {

    cancelLogoutButton.addEventListener(
        "click",
        function () {

            logoutModal.classList.remove("show");

        }
    );

}


// ==========================================
// CONFIRM LOGOUT
// ==========================================

if (confirmLogoutButton) {

    confirmLogoutButton.addEventListener(
        "click",
        function () {

            localStorage.removeItem("token");

            localStorage.removeItem("user");

            window.location.href =
                "index.html";

        }
    );

}


// ==========================================
// CLOSE WHEN CLICKING OUTSIDE
// ==========================================

if (logoutModal) {

    logoutModal.addEventListener(
        "click",
        function (event) {

            if (event.target === logoutModal) {

                logoutModal.classList.remove("show");

            }

        }
    );

}


// ==========================================
// DARK MODE
// ==========================================

const darkModeToggle =
    document.getElementById("darkModeToggle");


// ==========================================
// LOAD SAVED THEME
// ==========================================

function loadDarkMode() {

    const darkModeEnabled =
        localStorage.getItem("darkMode") === "enabled";

    if (darkModeEnabled) {

        document.body.classList.add("dark-mode");

    } else {

        document.body.classList.remove("dark-mode");

    }

    if (darkModeToggle) {

        darkModeToggle.checked =
            darkModeEnabled;

    }

}


// Load theme immediately
loadDarkMode();


// ==========================================
// HANDLE DARK MODE TOGGLE
// ==========================================

if (darkModeToggle) {

    darkModeToggle.addEventListener(
        "change",
        function () {

            if (this.checked) {

                document.body.classList.add(
                    "dark-mode"
                );

                localStorage.setItem(
                    "darkMode",
                    "enabled"
                );

            } else {

                document.body.classList.remove(
                    "dark-mode"
                );

                localStorage.setItem(
                    "darkMode",
                    "disabled"
                );

            }

        }
    );

}