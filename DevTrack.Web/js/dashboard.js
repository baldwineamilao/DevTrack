// ==========================================
// DEVTRACK DASHBOARD
// ==========================================

// ==========================================
// API URLs
// ==========================================

const PROJECTS_API_URL =
    "http://localhost:5104/api/Projects";

const TASKS_API_URL =
    "http://localhost:5104/api/Tasks";


// ==========================================
// GET JWT TOKEN
// ==========================================

const token =
    localStorage.getItem("token");


// If no token exists, send the user back to login
if (!token) {

    window.location.href =
        "index.html";

}


// ==========================================
// GET LOGGED-IN USER
// ==========================================

const storedUser =
    localStorage.getItem("user");

if (storedUser) {

    const user =
        JSON.parse(storedUser);


    // Display username
    const usernameDisplay =
        document.getElementById(
            "usernameDisplay"
        );

    if (usernameDisplay) {

        usernameDisplay.textContent =
            user.username;

    }


    // Display first letter in avatar
    const userAvatar =
        document.querySelector(
            ".user-avatar"
        );

    if (
        userAvatar &&
        user.username
    ) {

        userAvatar.textContent =
            user.username
                .charAt(0)
                .toUpperCase();

    }

}


// ==========================================
// LOAD DASHBOARD STATISTICS
// ==========================================

async function loadDashboardStatistics() {

    try {

        // ==========================================
        // LOAD PROJECTS
        // ==========================================

        const projectsResponse =
            await fetch(
                PROJECTS_API_URL,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

        if (!projectsResponse.ok) {

            throw new Error(
                "Failed to load projects."
            );

        }

        const projects =
            await projectsResponse.json();


        // ==========================================
        // LOAD TASKS
        // ==========================================

        const tasksResponse =
            await fetch(
                TASKS_API_URL,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

        if (!tasksResponse.ok) {

            throw new Error(
                "Failed to load tasks."
            );

        }

        const tasks =
            await tasksResponse.json();


        // ==========================================
        // CALCULATE STATISTICS
        // ==========================================

        const projectCount =
            projects.length;

        // Count only unfinished tasks
        const taskCount =
            tasks.filter(
                task =>
                    task.status !== "Done"
            ).length;

        const inProgressCount =
            tasks.filter(
                task =>
                    task.status ===
                        "In Progress"
            ).length;

        const completedCount =
            tasks.filter(
                task =>
                    task.status ===
                    "Done"
            ).length;


        // ==========================================
        // UPDATE DASHBOARD CARDS
        // ==========================================

        const statCards =
            document.querySelectorAll(
                ".stat-card"
            );

        if (statCards.length >= 4) {

            // Projects
            statCards[0]
                .querySelector("h3")
                .textContent =
                    projectCount;


            // Tasks
            statCards[1]
                .querySelector("h3")
                .textContent =
                    taskCount;


            // In Progress
            statCards[2]
                .querySelector("h3")
                .textContent =
                    inProgressCount;


            // Completed
            statCards[3]
                .querySelector("h3")
                .textContent =
                    completedCount;

        }


        console.log(
            "Dashboard statistics loaded:",
            {
                projects: projectCount,
                tasks: taskCount,
                inProgress: inProgressCount,
                completed: completedCount
            }
        );


    } catch (error) {

        console.error(
            "Dashboard statistics error:",
            error
        );

    }

}


// ==========================================
// LOAD RECENT PROJECTS
// ==========================================

async function loadRecentProjects() {

    const projectsContainer =
        document.getElementById("recentProjectsContainer");

    if (!projectsContainer) {
        console.warn(
            "recentProjectsContainer not found."
        );
        return;
    }

    try {

        const response =
            await fetch(
                PROJECTS_API_URL,
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );

        if (!response.ok) {

            throw new Error(
                `Failed to load projects. Status: ${response.status}`
            );

        }

        const projects =
            await response.json();


        // ==========================================
        // NO PROJECTS
        // ==========================================

        if (!projects || projects.length === 0) {

            projectsContainer.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">
                        +
                    </div>

                    <h3>
                        No projects yet
                    </h3>

                    <p>
                        Create your first project to start
                        tracking your development work.
                    </p>

                </div>

            `;

            return;
        }


        // ==========================================
        // CLEAR CONTAINER
        // ==========================================

        projectsContainer.innerHTML = "";


        // ==========================================
        // SHOW UP TO 3 PROJECTS
        // ==========================================

        projects
            .slice(0, 3)
            .forEach(project => {

                const projectCard =
                    document.createElement("div");

                projectCard.className =
                    "project-card";


                const createdDate =
                    project.createdAt
                        ? new Date(
                            project.createdAt
                        ).toLocaleDateString(
                            "en-US",
                            {
                                month: "short",
                                day: "numeric",
                                year: "numeric"
                            }
                        )
                        : "Unknown date";


                projectCard.innerHTML = `

                    <div class="project-card-header">

                        <div>

                            <h3>
                                ${project.name}
                            </h3>

                            <p>
                                ${
                                    project.description ||
                                    "No description provided."
                                }
                            </p>

                        </div>

                        <span class="project-icon">
                            ▣
                        </span>

                    </div>

                    <div class="project-card-footer">

                        <span>
                            Created ${createdDate}
                        </span>

                    </div>

                `;


                projectsContainer.appendChild(
                    projectCard
                );

            });


        console.log(
            "Recent projects loaded:",
            projects
        );


    } catch (error) {

        console.error(
            "Dashboard projects error:",
            error
        );


        projectsContainer.innerHTML = `

            <div class="empty-state">

                <h3>
                    Unable to load projects
                </h3>

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    }

}


// ==========================================
// LOAD RECENT TASKS
// ==========================================

async function loadRecentTasks() {

    const tasksContainer =
        document.getElementById("recentTasksContainer");

    if (!tasksContainer) {
        console.warn(
            "recentTasksContainer not found."
        );
        return;
    }

    try {

        const response =
            await fetch(
                TASKS_API_URL,
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                `Failed to load tasks. Status: ${response.status}`
            );

        }


        const tasks =
            await response.json();


        // ==========================================
        // NO TASKS
        // ==========================================

        if (!tasks || tasks.length === 0) {

            tasksContainer.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">
                        ✓
                    </div>

                    <h3>
                        No tasks yet
                    </h3>

                    <p>
                        Your assigned tasks will appear here.
                    </p>

                </div>

            `;

            return;
        }


        // ==========================================
        // CLEAR CONTAINER
        // ==========================================

        tasksContainer.innerHTML = "";


        // ==========================================
        // SHOW UP TO 3 TASKS
        // ==========================================

        tasks
            .slice(0, 3)
            .forEach(task => {

                const taskCard =
                    document.createElement("div");


                taskCard.className =
                    "dashboard-task-card";


                // ==========================================
                // STATUS
                // ==========================================

                const status =
                    task.status || "Unknown";


                const statusClass =
                    status
                        .toLowerCase()
                        .replace(
                            /\s+/g,
                            "-"
                        );


                taskCard.innerHTML = `

                    <div class="dashboard-task-info">

                        <h3>
                            ${task.title}
                        </h3>

                        <p>
                            ${
                                task.description ||
                                "No description provided."
                            }
                        </p>

                        <span class="dashboard-task-project">

                            Project:
                            ${
                                task.project
                                    ? task.project.name
                                    : "Unknown"
                            }

                        </span>

                    </div>


                    <div class="dashboard-task-status ${statusClass}">

                        ${status}

                    </div>

                `;


                tasksContainer.appendChild(
                    taskCard
                );

            });


        console.log(
            "Recent tasks loaded:",
            tasks
        );


    } catch (error) {

        console.error(
            "Dashboard tasks error:",
            error
        );


        tasksContainer.innerHTML = `

            <div class="empty-state">

                <h3>
                    Unable to load tasks
                </h3>

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    }

}


// ==========================================
// INITIALIZE DASHBOARD
// ==========================================

loadDashboardStatistics();

loadRecentProjects();

loadRecentTasks();