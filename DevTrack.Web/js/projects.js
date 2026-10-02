// ==========================================
// DEVTRACK PROJECTS
// ==========================================

const PROJECTS_API_URL = "http://localhost:5104/api/Projects";

const token =
    localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}


// ==========================================
// LOAD PROJECTS
// ==========================================

async function loadProjects() {

    const projectsContainer =
        document.getElementById("projectsContainer");

    try {

        const response = await fetch(PROJECTS_API_URL);

        if (!response.ok) {
            throw new Error("Failed to load projects.");
        }

        const projects = await response.json();

        if (projects.length === 0) {

            projectsContainer.innerHTML = `
                <div class="empty-state">

                    <div class="empty-icon">
                        ▣
                    </div>

                    <h3>No projects yet</h3>

                    <p>
                        Create your first project to start tracking your development work.
                    </p>

                </div>
            `;

            return;
        }

        projectsContainer.innerHTML = "";

        projects.forEach(project => {

    const projectCard = document.createElement("div");

    projectCard.className = "project-card";

    const createdDate =
        new Date(project.createdAt).toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric",
                year: "numeric"
            }
        );

    projectCard.innerHTML = `

    <div class="project-card-header">

    <div class="project-icon">
        ▣
    </div>

    <div class="project-options">

        <button
            class="project-menu"
            data-project-id="${project.id}"
            title="Project options">
            ⋮
        </button>

        <div
            class="project-dropdown"
            id="projectDropdown-${project.id}">

            <button
                class="edit-project-button"
                data-id="${project.id}">
                Edit Project
            </button>

            <button
                class="delete-project-button"
                data-id="${project.id}">
                Delete Project
            </button>

        </div>

    </div>

</div>


    <div class="project-card-body">

        <h3>${project.name}</h3>

        <p>
            ${project.description || "No description provided."}
        </p>

    </div>


    <div class="project-card-footer">

        <span class="project-date">
            Created ${createdDate}
        </span>

        <button
            class="view-project-button"
            data-project-id="${project.id}">
            View →
        </button>

    </div>

`;

    projectsContainer.appendChild(projectCard);

    const viewButton =
    projectCard.querySelector(".view-project-button");

viewButton.addEventListener("click", function () {

    const projectId =
        this.dataset.projectId;

    window.location.href =
        `project.html?id=${projectId}`;

});

});

    } catch (error) {

        console.error("Projects error:", error);

        projectsContainer.innerHTML = `
            <div class="empty-state">

                <h3>Unable to load projects</h3>

                <p>
                    Make sure the DevTrack API is running.
                </p>

            </div>
        `;
    }
}


// ==========================================
// OPEN CREATE PROJECT MODAL
// ==========================================

function openProjectModal() {

    const modal =
        document.getElementById("projectModal");

    if (modal) {
        modal.classList.add("show");
    }
}


// ==========================================
// CLOSE CREATE PROJECT MODAL
// ==========================================

function closeProjectModal() {

    const modal =
        document.getElementById("projectModal");

    if (modal) {
        modal.classList.remove("show");
    }
}


// ==========================================
// CREATE PROJECT
// ==========================================

async function createProject(event) {

    event.preventDefault();

    const nameInput =
        document.getElementById("projectName");

    const descriptionInput =
        document.getElementById("projectDescription");

    const createButton =
        document.getElementById("createProjectSubmit");

    const name =
        nameInput.value.trim();

    const description =
        descriptionInput.value.trim();

    if (!name) {
        alert("Please enter a project name.");
        return;
    }


    // Get logged-in user

    const storedUser =
        localStorage.getItem("user");

    if (!storedUser) {
        alert("You are not logged in.");
        window.location.href = "index.html";
        return;
    }

    const user =
        JSON.parse(storedUser);


    if (!user.id) {
        alert("Unable to determine the logged-in user.");
        return;
    }


    // Disable button

    createButton.disabled = true;
    createButton.textContent = "Creating...";


    try {

        const response = await fetch(PROJECTS_API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                name: name,

                description: description,

                ownerId: user.id

            })

        });


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText || "Failed to create project."
            );

        }


        // Clear form

        nameInput.value = "";
        descriptionInput.value = "";


        // Close modal

        closeProjectModal();


        // Reload projects

        await loadProjects();


    } catch (error) {

        console.error("Create project error:", error);

        alert(
            "Unable to create project.\n\n" +
            error.message
        );

    } finally {

        createButton.disabled = false;
        createButton.textContent = "Create Project";

    }
}


// ==========================================
// BUTTON EVENTS
// ==========================================

const createProjectButton =
    document.getElementById("createProjectButton");

if (createProjectButton) {

    createProjectButton.addEventListener(
        "click",
        openProjectModal
    );

}


const closeProjectButton =
    document.getElementById("closeProjectModal");

if (closeProjectButton) {

    closeProjectButton.addEventListener(
        "click",
        closeProjectModal
    );

}


// ==========================================
// CANCEL PROJECT CREATION
// ==========================================

const cancelProjectButton =
    document.getElementById("cancelProjectButton");

if (cancelProjectButton) {

    cancelProjectButton.addEventListener(
        "click",
        closeProjectModal
    );

}


// ==========================================
// PROJECT FORM
// ==========================================

const projectForm =
    document.getElementById("projectForm");

if (projectForm) {

    projectForm.addEventListener(
        "submit",
        createProject
    );

}

// ==========================================
// PROJECT OPTIONS MENU
// ==========================================

document.addEventListener(
    "click",
    function (event) {

        const menuButton =
            event.target.closest(".project-menu");

        // Clicked the three-dot button
        if (menuButton) {

            event.stopPropagation();

            const projectOptions =
                menuButton.closest(".project-options");

            const dropdown =
                projectOptions.querySelector(
                    ".project-dropdown"
                );

            // Close other dropdowns
            document
                .querySelectorAll(
                    ".project-dropdown.show"
                )
                .forEach(menu => {

                    if (menu !== dropdown) {
                        menu.classList.remove("show");
                    }

                });

            // Toggle current dropdown
            dropdown.classList.toggle("show");

            return;
        }

        // Clicked somewhere outside
        if (
            !event.target.closest(
                ".project-options"
            )
        ) {

            document
                .querySelectorAll(
                    ".project-dropdown.show"
                )
                .forEach(menu => {

                    menu.classList.remove("show");

                });

        }

    }
);

// ==========================================
// EDIT PROJECT
// ==========================================

let projectToEdit = null;

const editProjectModal =
    document.getElementById(
        "editProjectModal"
    );

const editProjectForm =
    document.getElementById(
        "editProjectForm"
    );

const editProjectName =
    document.getElementById(
        "editProjectName"
    );

const editProjectDescription =
    document.getElementById(
        "editProjectDescription"
    );

const closeEditProjectModal =
    document.getElementById(
        "closeEditProjectModal"
    );

const cancelEditProject =
    document.getElementById(
        "cancelEditProject"
    );

const saveEditProject =
    document.getElementById(
        "saveEditProject"
    );

    // ==========================================
// OPEN EDIT PROJECT MODAL
// ==========================================

document.addEventListener(
    "click",
    async function (event) {

        const editButton =
            event.target.closest(
                ".edit-project-button"
            );

        if (!editButton) {
            return;
        }

        const projectId =
            editButton.dataset.id;

        try {

            const response =
                await fetch(
                    `${PROJECTS_API_URL}/${projectId}`
                );

            if (!response.ok) {
                throw new Error(
                    "Failed to load project."
                );
            }

            const project =
                await response.json();

            projectToEdit =
                project.id;

            editProjectName.value =
                project.name;

            editProjectDescription.value =
                project.description || "";

            editProjectModal.classList.add(
                "show"
            );

        } catch (error) {

            console.error(
                "Load project error:",
                error
            );

            alert(
                "Unable to load project details."
            );

        }

    }
);

// ==========================================
// SAVE PROJECT CHANGES
// ==========================================

if (editProjectForm) {

    editProjectForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            if (!projectToEdit) {
                return;
            }

            const name =
                editProjectName.value.trim();

            const description =
                editProjectDescription.value.trim();

            if (!name) {

                alert(
                    "Please enter a project name."
                );

                return;

            }

            saveEditProject.disabled = true;

            saveEditProject.textContent =
                "Saving...";

            try {

                const storedUser =
                    localStorage.getItem("user");

                if (!storedUser) {

                    alert(
                        "You are not logged in."
                    );

                    window.location.href =
                        "index.html";

                    return;

                }

                const user =
                    JSON.parse(storedUser);

                if (!user.id) {

                    throw new Error(
                        "Unable to determine the logged-in user."
                    );

                }

                const response =
                    await fetch(
                        `${PROJECTS_API_URL}/${projectToEdit}`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                name: name,

                                description:
                                    description,

                                ownerId: user.id

                            })

                        }
                    );

                if (!response.ok) {

                    const errorText =
                        await response.text();

                    console.error(
                        "API response:",
                        response.status,
                        errorText
                    );

                    throw new Error(
                        `API Error ${response.status}: ${
                            errorText ||
                            "Failed to update project."
                        }`
                    );

                }

                // Close modal

                editProjectModal.classList.remove(
                    "show"
                );

                // Reset selected project

                projectToEdit = null;

                // Reload projects

                await loadProjects();

            } catch (error) {

                console.error(
                    "Update project error:",
                    error
                );

                alert(
                    "Unable to update project.\n\n" +
                    error.message
                );

            } finally {

                saveEditProject.disabled =
                    false;

                saveEditProject.textContent =
                    "Save Changes";

            }

        }
    );

}

// ==========================================
// CLOSE EDIT PROJECT MODAL
// ==========================================

if (closeEditProjectModal) {

    closeEditProjectModal.addEventListener(
        "click",
        function () {

            editProjectModal.classList.remove(
                "show"
            );

            projectToEdit = null;

        }
    );

}


// ==========================================
// CANCEL EDIT PROJECT
// ==========================================

if (cancelEditProject) {

    cancelEditProject.addEventListener(
        "click",
        function () {

            editProjectModal.classList.remove(
                "show"
            );

            projectToEdit = null;

        }
    );

}


// ==========================================
// DELETE PROJECT
// ==========================================

async function deleteProject(projectId) {

    try {

        const response =
            await fetch(
                `http://localhost:5104/api/Projects/${projectId}`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

        if (!response.ok) {

            throw new Error(
                "Failed to delete project."
            );

        }

        await loadProjects();

    } catch (error) {

        console.error(
            "Delete project error:",
            error
        );

        alert(
            "Unable to delete project."
        );

    }

}

// ==========================================
// DELETE PROJECT MODAL
// ==========================================

let projectToDelete = null;

const deleteProjectModal =
    document.getElementById(
        "deleteProjectModal"
    );

const cancelDeleteProject =
    document.getElementById(
        "cancelDeleteProject"
    );

const confirmDeleteProject =
    document.getElementById(
        "confirmDeleteProject"
    );


// ==========================================
// OPEN DELETE MODAL
// ==========================================

document.addEventListener(
    "click",
    function (event) {

        const deleteButton =
            event.target.closest(
                ".delete-project-button"
            );

        if (!deleteButton) {
            return;
        }

        projectToDelete =
            deleteButton.dataset.id;

        deleteProjectModal.classList.add(
            "show"
        );

    }
);


// ==========================================
// CANCEL DELETE
// ==========================================

if (cancelDeleteProject) {

    cancelDeleteProject.addEventListener(
        "click",
        function () {

            projectToDelete = null;

            deleteProjectModal.classList.remove(
                "show"
            );

        }
    );

}


// ==========================================
// CONFIRM DELETE
// ==========================================

if (confirmDeleteProject) {

    confirmDeleteProject.addEventListener(
        "click",
        async function () {

            if (!projectToDelete) {
                return;
            }

            const projectId =
                projectToDelete;

            projectToDelete = null;

            deleteProjectModal.classList.remove(
                "show"
            );

            await deleteProject(projectId);

        }
    );

}


// ==========================================
// INITIALIZE
// ==========================================

loadProjects();