// ==========================================
// DEVTRACK ACTIVITY
// ==========================================

const ACTIVITY_API_URL =
    "http://localhost:5104/api/Activities";


// ==========================================
// LOAD ACTIVITIES
// ==========================================

async function loadActivities() {

    const activityContainer =
        document.getElementById("activityContainer");

    if (!activityContainer) {
        return;
    }

    try {

        const response =
            await fetch(ACTIVITY_API_URL);

        if (!response.ok) {
            throw new Error(
                "Failed to load activities."
            );
        }

        const activities =
            await response.json();


        if (activities.length === 0) {

            activityContainer.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">
                        ◷
                    </div>

                    <h3>
                        No activity yet
                    </h3>

                    <p>
                        Your recent development activity will appear here.
                    </p>

                </div>

            `;

            return;
        }


        activityContainer.innerHTML = "";


        activities
            .sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            )
            .forEach(activity => {

                const activityCard =
                    document.createElement("div");

                activityCard.className =
                    "activity-card";


                const createdDate =
                    new Date(
                        activity.createdAt
                    ).toLocaleString(
                        "en-US",
                        {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit"
                        }
                    );


                activityCard.innerHTML = `

                    <div class="activity-icon">
                        ◷
                    </div>

                    <div class="activity-content">

                        <h3>
                            ${activity.action}
                        </h3>

                        <p>
                            ${activity.description}
                        </p>

                        <span class="activity-date">
                            ${createdDate}
                        </span>

                    </div>

                `;


                activityContainer.appendChild(
                    activityCard
                );

            });


    } catch (error) {

        console.error(
            "Activity error:",
            error
        );

        activityContainer.innerHTML = `

            <div class="empty-state">

                <h3>
                    Unable to load activity
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

loadActivities();