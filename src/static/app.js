document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const signupContainer = document.getElementById("signup-container");
  const messageDiv = document.getElementById("message");
  const teacherLoginToggle = document.getElementById("teacher-login-toggle");
  const teacherLogout = document.getElementById("teacher-logout");
  const teacherLoginForm = document.getElementById("teacher-login-form");
  const teacherMessage = document.getElementById("teacher-message");
  let teacherAuthorization = null;

  function getAuthorizationHeaders() {
    return teacherAuthorization
      ? { Authorization: teacherAuthorization }
      : {};
  }

  function createAuthorizationHeader(username, password) {
    const bytes = new TextEncoder().encode(`${username}:${password}`);
    const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
    return `Basic ${btoa(binary)}`;
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft =
          details.max_participants - details.participants.length;

        // Create participants HTML with delete icons instead of bullet points
        const participantsHTML =
          details.participants.length > 0
            ? `<div class="participants-section">
              <h5>Participants:</h5>
              <ul class="participants-list">
                ${details.participants
                  .map(
                    (email) =>
                      `<li><span class="participant-email">${email}</span>${
                        teacherAuthorization
                          ? `<button class="delete-btn" data-activity="${name}" data-email="${email}" aria-label="Unregister ${email}" title="Unregister student">Remove</button>`
                          : ""
                      }</li>`
                  )
                  .join("")}
              </ul>
            </div>`
            : `<p><em>No participants yet</em></p>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-container">
            ${participantsHTML}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Add event listeners to delete buttons
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleUnregister);
      });
    } catch (error) {
      activitiesList.innerHTML =
        "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle unregister functionality
  async function handleUnregister(event) {
    const button = event.target;
    const activity = button.getAttribute("data-activity");
    const email = button.getAttribute("data-email");

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/unregister?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
          headers: getAuthorizationHeaders(),
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to unregister. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error unregistering:", error);
    }
  }

  teacherLoginToggle.addEventListener("click", () => {
    teacherLoginForm.classList.toggle("hidden");
    if (!teacherLoginForm.classList.contains("hidden")) {
      document.getElementById("teacher-username").focus();
    }
  });

  teacherLoginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = document.getElementById("teacher-username").value;
    const password = document.getElementById("teacher-password").value;
    const authorization = createAuthorizationHeader(username, password);

    try {
      const response = await fetch("/teacher/session", {
        headers: { Authorization: authorization },
      });
      const result = await response.json();

      if (!response.ok) {
        teacherMessage.textContent = result.detail || "Teacher login failed";
        teacherMessage.className = "error";
        teacherMessage.classList.remove("hidden");
        return;
      }

      teacherAuthorization = authorization;
      teacherLoginForm.reset();
      teacherLoginForm.classList.add("hidden");
      teacherLoginToggle.classList.add("hidden");
      teacherLogout.classList.remove("hidden");
      signupContainer.classList.remove("hidden");
      teacherMessage.classList.add("hidden");
      fetchActivities();
    } catch (error) {
      teacherMessage.textContent = "Failed to sign in. Please try again.";
      teacherMessage.className = "error";
      teacherMessage.classList.remove("hidden");
      console.error("Error signing in:", error);
    }
  });

  teacherLogout.addEventListener("click", () => {
    teacherAuthorization = null;
    teacherLoginForm.reset();
    signupContainer.classList.add("hidden");
    teacherLogout.classList.add("hidden");
    teacherLoginToggle.classList.remove("hidden");
    teacherMessage.classList.add("hidden");
    fetchActivities();
  });

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
          headers: getAuthorizationHeaders(),
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
