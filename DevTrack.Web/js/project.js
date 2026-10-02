// ==========================================
// DEVTRACK PROJECT DETAILS
// ==========================================

const API_URL =
    "http://localhost:5104/api/Projects";


// ==========================================
// GET PROJECT ID
// ==========================================

const urlParams =
    new URLSearchParams(window.location.search);

const projectId =
    urlParams.get("id");


// ==========================================
// ELEMENTS
// ==========================================

const projectTitle =
    document.getElementById("projectTitle");

const projectDetails =
    document.getElementById("projectDetails");


// ==========================================
// LOAD PROJECT
// ==========================================

async function loadProject() {

    if (!projectId) {

        projectTitle.textContent =
            "Project Not Found";

        projectDetails.innerHTML = `
            <div class="empty-state">

                <h3>
                    Invalid project
                </h3>

                <p>
                    No project ID was provided.
                </p>

            </div>
        `;

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/${projectId}`
            );


        if (!response.ok) {

            throw new Error(
                "Project could not be found."
            );

        }


        const project =
            await response.json();


        // Project title

        projectTitle.textContent =
            project.name;


        // Format date

        const createdDate =
            new Date(
                project.createdAt
            ).toLocaleDateString(
                "en-US",
                {
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                }
            );


        // Project details

        projectDetails.innerHTML = `

            <div class="project-detail-header">

                <div class="project-icon large">
                    ▣
                </div>

                <div>

                    <h2>
                        ${project.name}
                    </h2>

                    <p>
                        ${project.description ||
                        "No description provided."}
                    </p>

                </div>

            </div>


            <div class="project-detail-info">

                <div>

                    <span>
                        Created
                    </span>

                    <strong>
                        ${createdDate}
                    </strong>

                </div>


                <div>

                    <span>
                        Project ID
                    </span>

                    <strong>
                        #${project.id}
                    </strong>

                </div>


                <div>

                    <span>
                        Owner ID
                    </span>

                    <strong>
                        #${project.ownerId}
                    </strong>

                </div>

            </div>

        `;


    } catch (error) {

        console.error(
            "Project error:",
            error
        );


        projectTitle.textContent =
            "Unable to Load";


        projectDetails.innerHTML = `

            <div class="empty-state">

                <h3>
                    Unable to load project
                </h3>

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    }

}


// ==========================================
// INITIALIZE
// ==========================================

loadProject();