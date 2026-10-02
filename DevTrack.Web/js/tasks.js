const TASKS_API_URL = "http://localhost:5104/api/Tasks";
const PROJECTS_API_URL = "http://localhost:5104/api/Projects";

let editingTaskId = null;
let taskToDeleteId = null;


// ==========================================
// LOAD TASKS
// ==========================================

async function loadTasks() {

    const tasksContainer =
        document.getElementById("tasksContainer");

    if (!tasksContainer) {
        return;
    }

    try {

        const response =
            await fetch(TASKS_API_URL);

        if (!response.ok) {
            throw new Error("Failed to load tasks.");
        }

        const tasks =
            await response.json();


        if (tasks.length === 0) {

            tasksContainer.innerHTML = `
                <div class="empty-state">

                    <div class="empty-icon">
                        ✓
                    </div>

                    <h3>No tasks yet</h3>

                    <p>
                        Create your first task to start tracking your work.
                    </p>

                </div>
            `;

            return;
        }


        // ==========================================
        // GROUP TASKS BY STATUS
        // ==========================================

        const statuses = [
            "Todo",
            "In Progress",
            "Done"
        ];

        tasksContainer.innerHTML = "";


        statuses.forEach(status => {

            const statusTasks =
                tasks.filter(task =>
                    task.status === status
                );


            const section =
                document.createElement("div");

            section.className =
                "task-status-section";


            section.innerHTML = `

                <div class="task-status-header">

                    <div>

                        <h3>
                            ${status}
                        </h3>

                        <span>
                            ${statusTasks.length}
                            ${statusTasks.length === 1
                                ? "task"
                                : "tasks"}
                        </span>

                    </div>

                </div>

            `;


            const taskList =
                document.createElement("div");

            taskList.className =
                "task-list";


            // ==========================================
            // NO TASKS IN THIS STATUS
            // ==========================================

            if (statusTasks.length === 0) {

                taskList.innerHTML = `
                    <div class="task-empty">
                        No ${status.toLowerCase()} tasks.
                    </div>
                `;

            }


            // ==========================================
            // DISPLAY TASKS
            // ==========================================

            statusTasks.forEach(task => {

                const taskCard =
                    document.createElement("div");

                taskCard.className =
                    "task-card";


                const dueDate =
                    task.dueDate
                        ? new Date(
                            task.dueDate
                        ).toLocaleDateString(
                            "en-US",
                            {
                                month: "short",
                                day: "numeric",
                                year: "numeric"
                            }
                        )
                        : "No due date";


                taskCard.innerHTML = `

                    <div class="task-card-header">

                        <div>

                            <h3>
                                ${task.title}
                            </h3>

                            <p>
                                ${task.description || "No description provided."}
                            </p>

                        </div>

                        <span class="task-status">
                            ${task.status}
                        </span>

                    </div>


                    <div class="task-card-info">

                        <span>
                            Project:
                            ${
                                task.project
                                    ? task.project.name
                                    : "Unknown"
                            }
                        </span>

                        <span>
                            Priority:
                            ${task.priority}
                        </span>

                        <span>
                            Due:
                            ${dueDate}
                        </span>

                    </div>


                    <div class="task-card-actions">

                        ${
                            task.status !== "Done"
                                ? `
                                    <button
                                        class="complete-task-button"
                                        data-task-id="${task.id}">
                                        ✓ Mark as Done
                                    </button>
                                  `
                                : ""
                        }

                        <button
                            class="edit-task-button"
                            data-task-id="${task.id}">
                            Edit
                        </button>

                        <button
                            class="delete-task-button"
                            data-task-id="${task.id}">
                            Delete
                        </button>

                    </div>

                `;


                taskList.appendChild(taskCard);


                // ==========================================
                // MARK TASK AS DONE BUTTON
                // ==========================================

                const completeButton =
                    taskCard.querySelector(
                        ".complete-task-button"
                    );

                if (completeButton) {

                    completeButton.addEventListener(
                        "click",
                        () => markTaskAsDone(task.id)
                    );

                }


                // ==========================================
                // EDIT BUTTON
                // ==========================================

                const editButton =
                    taskCard.querySelector(
                        ".edit-task-button"
                    );

                if (editButton) {

                    editButton.addEventListener(
                        "click",
                        () => openEditTaskModal(task)
                    );

                }


                // ==========================================
                // DELETE BUTTON
                // ==========================================

                const deleteButton =
                    taskCard.querySelector(
                        ".delete-task-button"
                    );

                if (deleteButton) {

                    deleteButton.addEventListener(
                        "click",
                        () => deleteTask(task.id)
                    );

                }

            });


            section.appendChild(taskList);

            tasksContainer.appendChild(section);

        });


    } catch (error) {

        console.error(
            "Tasks error:",
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
// MARK TASK AS DONE
// ==========================================

async function markTaskAsDone(taskId) {

    try {

        const response = await fetch(
            `${TASKS_API_URL}/${taskId}/complete`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({})
            }
        );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText ||
                "Failed to mark task as done."
            );

        }


        console.log(
            `Task ${taskId} marked as Done.`
        );


        // Reload tasks
        await loadTasks();


    } catch (error) {

        console.error(
            "Mark task as done error:",
            error
        );

        alert(
            "Unable to mark task as done.\n\n" +
            error.message
        );

    }

}


// ==========================================
// LOAD PROJECTS
// ==========================================

async function loadProjectsForTask() {

    const projectSelect =
        document.getElementById("taskProject");

    if (!projectSelect) {
        return;
    }


    try {

        const response =
            await fetch(PROJECTS_API_URL);

        if (!response.ok) {

            throw new Error(
                "Failed to load projects."
            );

        }

        const projects =
            await response.json();


        projectSelect.innerHTML = `
            <option value="">
                Select a project
            </option>
        `;


        projects.forEach(project => {

            const option =
                document.createElement("option");

            option.value =
                project.id;

            option.textContent =
                project.name;

            projectSelect.appendChild(option);

        });


    } catch (error) {

        console.error(
            "Project loading error:",
            error
        );

    }

}


// ==========================================
// OPEN CREATE TASK MODAL
// ==========================================

function openTaskModal() {

    editingTaskId = null;


    const modal =
        document.getElementById("taskModal");

    const title =
        modal.querySelector("h2");

    const submitButton =
        document.getElementById(
            "createTaskSubmit"
        );


    title.textContent =
        "Create New Task";

    submitButton.textContent =
        "Create Task";


    document
        .getElementById("taskForm")
        .reset();


    loadProjectsForTask();


    modal.classList.add("show");

}


// ==========================================
// OPEN EDIT TASK MODAL
// ==========================================

function openEditTaskModal(task) {

    editingTaskId =
        task.id;


    const modal =
        document.getElementById("taskModal");


    const title =
        modal.querySelector("h2");

    const submitButton =
        document.getElementById(
            "createTaskSubmit"
        );


    title.textContent =
        "Edit Task";

    submitButton.textContent =
        "Save Changes";


    document.getElementById(
        "taskTitle"
    ).value =
        task.title;


    document.getElementById(
        "taskDescription"
    ).value =
        task.description || "";


    document.getElementById(
        "taskStatus"
    ).value =
        task.status;


    document.getElementById(
        "taskPriority"
    ).value =
        task.priority;


    if (task.dueDate) {

        document.getElementById(
            "taskDueDate"
        ).value =
            task.dueDate.substring(0, 10);

    } else {

        document.getElementById(
            "taskDueDate"
        ).value =
            "";

    }


    loadProjectsForTask()
        .then(() => {

            document.getElementById(
                "taskProject"
            ).value =
                task.projectId;

        });


    modal.classList.add("show");

}


// ==========================================
// CLOSE TASK MODAL
// ==========================================

function closeTaskModal() {

    const modal =
        document.getElementById(
            "taskModal"
        );

    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

    editingTaskId = null;

}


// ==========================================
// CREATE / UPDATE TASK
// ==========================================

async function createTask(event) {

    event.preventDefault();


    const title =
        document.getElementById(
            "taskTitle"
        ).value.trim();


    const description =
        document.getElementById(
            "taskDescription"
        ).value.trim();


    const projectId =
        document.getElementById(
            "taskProject"
        ).value;


    const status =
        document.getElementById(
            "taskStatus"
        ).value;


    const priority =
        document.getElementById(
            "taskPriority"
        ).value;


    const dueDate =
        document.getElementById(
            "taskDueDate"
        ).value;


    if (!title) {

        alert(
            "Please enter a task title."
        );

        return;

    }


    if (!projectId) {

        alert(
            "Please select a project."
        );

        return;

    }


    const createButton =
        document.getElementById(
            "createTaskSubmit"
        );


    createButton.disabled =
        true;


    createButton.textContent =
        editingTaskId
            ? "Saving..."
            : "Creating...";


    try {

        const taskData = {

            title: title,

            description: description,

            status: status,

            priority: priority,

            dueDate:
                dueDate || null,

            projectId:
                parseInt(projectId),

            assignedUserId:
                null

        };


        // ==========================================
        // UPDATE
        // ==========================================

        if (editingTaskId) {

            const response =
                await fetch(
                    `${TASKS_API_URL}/${editingTaskId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                taskData
                            )
                    }
                );


            if (!response.ok) {

                const errorText =
                    await response.text();

                throw new Error(
                    errorText ||
                    "Failed to update task."
                );

            }

        }


        // ==========================================
        // CREATE
        // ==========================================

        else {

            const response =
                await fetch(
                    TASKS_API_URL,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                taskData
                            )
                    }
                );


            if (!response.ok) {

                const errorText =
                    await response.text();

                throw new Error(
                    errorText ||
                    "Failed to create task."
                );

            }

        }


        document
            .getElementById("taskForm")
            .reset();


        closeTaskModal();


        await loadTasks();


    } catch (error) {

        console.error(
            "Task save error:",
            error
        );

        alert(
            "Unable to save task.\n\n" +
            error.message
        );

    } finally {

        createButton.disabled =
            false;

        createButton.textContent =
            "Create Task";

    }

}


// ==========================================
// OPEN DELETE CONFIRMATION
// ==========================================

function deleteTask(taskId) {

    taskToDeleteId =
        taskId;


    const modal =
        document.getElementById(
            "deleteTaskModal"
        );


    if (modal) {

        modal.classList.add(
            "show"
        );

    }

}


// ==========================================
// CLOSE DELETE CONFIRMATION
// ==========================================

function closeDeleteTaskModal() {

    const modal =
        document.getElementById(
            "deleteTaskModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }


    taskToDeleteId =
        null;

}


// ==========================================
// CONFIRM DELETE TASK
// ==========================================

async function confirmDeleteTask() {

    if (!taskToDeleteId) {
        return;
    }


    const deleteButton =
        document.getElementById(
            "confirmDeleteTaskButton"
        );


    deleteButton.disabled =
        true;

    deleteButton.textContent =
        "Deleting...";


    try {

        const response =
            await fetch(
                `${TASKS_API_URL}/${taskToDeleteId}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText ||
                "Failed to delete task."
            );

        }


        closeDeleteTaskModal();


        await loadTasks();


    } catch (error) {

        console.error(
            "Delete task error:",
            error
        );

        alert(
            "Unable to delete task.\n\n" +
            error.message
        );

    } finally {

        deleteButton.disabled =
            false;

        deleteButton.textContent =
            "Delete Task";

    }

}


// ==========================================
// BUTTON EVENTS
// ==========================================

const createTaskButton =
    document.getElementById(
        "createTaskButton"
    );

if (createTaskButton) {

    createTaskButton.addEventListener(
        "click",
        openTaskModal
    );

}


const closeTaskButton =
    document.getElementById(
        "closeTaskModal"
    );

if (closeTaskButton) {

    closeTaskButton.addEventListener(
        "click",
        closeTaskModal
    );

}


const cancelTaskButton =
    document.getElementById(
        "cancelTaskButton"
    );

if (cancelTaskButton) {

    cancelTaskButton.addEventListener(
        "click",
        closeTaskModal
    );

}


const taskForm =
    document.getElementById(
        "taskForm"
    );

if (taskForm) {

    taskForm.addEventListener(
        "submit",
        createTask
    );

}


const cancelDeleteTaskButton =
    document.getElementById(
        "cancelDeleteTaskButton"
    );

if (cancelDeleteTaskButton) {

    cancelDeleteTaskButton.addEventListener(
        "click",
        closeDeleteTaskModal
    );

}


const confirmDeleteTaskButton =
    document.getElementById(
        "confirmDeleteTaskButton"
    );

if (confirmDeleteTaskButton) {

    confirmDeleteTaskButton.addEventListener(
        "click",
        confirmDeleteTask
    );

}


// ==========================================
// INITIALIZE
// ==========================================

loadProjectsForTask();

loadTasks();