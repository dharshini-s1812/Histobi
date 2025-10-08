document.addEventListener("DOMContentLoaded", () => {
  const feedbackForm = document.getElementById("feedback-form");
  const feedbackSlide = document.getElementById("feedback-slide");
  const feedbackInput = document.getElementById("feedback-input");
  const userNameInput = document.getElementById("user-name");
  const starRating = document.getElementById("star-rating");
  const avgRatingElem = document.getElementById("avgRating");
  const starsElem = document.getElementById("stars");

  const APP_ID = "gWSJnVHNKjc5lkpPWhaDysd4fbiuaUkiCBPJHHX9";
  const REST_KEY = "2U0x5WjGEfreUKvVVOCeNX4T45EKOJ3tXdM8038q";

  let feedbacks = []; // Global array to store feedbacks

  // Function to update average rating
  function updateAverage() {
    if (feedbacks.length === 0) {
      avgRatingElem.textContent = "0 ⭐";
      starsElem.innerHTML = "☆☆☆☆☆";
      return;
    }

    const total = feedbacks.reduce((sum, f) => sum + (f.Stars || 5), 0);
    const avg = total / feedbacks.length;

    avgRatingElem.textContent = avg.toFixed(1) + " ⭐";

    const fullStars = Math.round(avg);
    starsElem.innerHTML = "★".repeat(fullStars) + "☆".repeat(5 - fullStars);
  }

  // Load all feedbacks from backend
  async function loadFeedbacks() {
    feedbackSlide.innerHTML = "";
    try {
      const res = await fetch(
        "https://parseapi.back4app.com/classes/Feedback?limit=50&order=-createdAt",
        {
          headers: {
            "X-Parse-Application-Id": APP_ID,
            "X-Parse-REST-API-Key": REST_KEY,
            "Content-Type": "application/json"
          }
        }
      );
      const data = await res.json();
      if (!data.results) return;

      feedbacks = data.results;

      feedbacks.forEach(item => {
        const name = item.Name || "Anonymous";
        const message = item.Message || "";
        const stars = item.Stars || 5;

        const card = document.createElement("div");
        card.className = "feedback-card";
        card.innerHTML = `
          <div class="feedback-stars">${"⭐".repeat(stars)}</div>
          <p>"${message}" - ${name}</p>
        `;
        feedbackSlide.appendChild(card);
      });

      updateAverage();
    } catch (err) {
      console.error("Error loading feedbacks:", err);
    }
  }

  loadFeedbacks();

  // Handle form submission
  feedbackForm.addEventListener("submit", async e => {
    e.preventDefault();

    const feedbackText = feedbackInput.value.trim();
    const userName = userNameInput.value.trim() || "Anonymous";
    const stars = parseInt(starRating.value) || 5;

    if (!feedbackText) return alert("Please enter feedback!");

    try {
      // Send feedback to backend
      const res = await fetch("https://parseapi.back4app.com/classes/Feedback", {
        method: "POST",
        headers: {
          "X-Parse-Application-Id": APP_ID,
          "X-Parse-REST-API-Key": REST_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ Name: userName, Message: feedbackText, Stars: stars })
      });
      const newFeedback = await res.json();

      // Add new feedback locally
      const newCard = document.createElement("div");
      newCard.className = "feedback-card new-feedback";
      newCard.innerHTML = `
        <div class="feedback-stars">${"⭐".repeat(stars)}</div>
        <p>"${feedbackText}" - ${userName}</p>
      `;
      feedbackSlide.prepend(newCard);

      // Add to feedback array and update average
      feedbacks.unshift({ Stars: stars });
      updateAverage();

      feedbackForm.reset();
      starRating.value = "5";
      alert("Feedback submitted!");
    } catch (err) {
      console.error("Error submitting feedback:", err);
      alert("Failed to submit feedback.");
    }
  });
});































//   const APP_ID = "gWSJnVHNKjc5lkpPWhaDysd4fbiuaUkiCBPJHHX9";
//  const REST_KEY = "2U0x5WjGEfreUKvVVOCeNX4T45EKOJ3tXdM8038q";