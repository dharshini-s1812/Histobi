const searchInput = document.getElementById("heritage-search");
const suggestionsContainer = document.getElementById("suggestions-dropdown");
const resultsSection = document.getElementById("results-section");
const resultsContainer = document.getElementById("results-container");

let debounceTimer;

const heritageKeywords = [
  "temples", "forts", "monuments", "palaces", "heritage",
  "historical", "museum", "ruins", "ancient", "church"
];

// Helper: check for heritage keywords in category titles
function isCategoryHeritage(categoryTitle) {
  const title = categoryTitle.toLowerCase();
  return heritageKeywords.some(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, "i");
    return regex.test(title);
  });
}

// Debounced search input listener
searchInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  const query = searchInput.value.trim();
  if (!query) {
    suggestionsContainer.innerHTML = "";
    suggestionsContainer.classList.add("hidden");
    return;
  }
  debounceTimer = setTimeout(() => {
    fetchSuggestions(query);
  }, 300);
});

// Step 1: Fetch search suggestions with initial Wikipedia search API
async function fetchSuggestions(query) {
  suggestionsContainer.innerHTML = `<div class="p-2">Loading suggestions...</div>`;
  suggestionsContainer.classList.remove("hidden");

  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query + " India")}&srlimit=10&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const searchResults = searchData.query.search;

    if (searchResults.length === 0) {
      suggestionsContainer.innerHTML = `<div class="p-2">No heritage suggestions found</div>`;
      return;
    }

    const pageIds = searchResults.map(item => item.pageid).join("|");

    // Step 2: Batch fetch categories to filter heritage pages
    const catUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=categories&pageids=${pageIds}&cllimit=max&format=json&origin=*`;
    const catRes = await fetch(catUrl);
    const catData = await catRes.json();

    const filteredTitles = [];
    for (const pageid of Object.keys(catData.query.pages)) {
      const page = catData.query.pages[pageid];
      const title = page.title;
      const categories = page.categories || [];
      if (categories.some(cat => isCategoryHeritage(cat.title))) {
        filteredTitles.push(title);
      }
    }

    if (filteredTitles.length === 0) {
      suggestionsContainer.innerHTML = `<div class="p-2">No heritage suggestions found</div>`;
      return;
    }

    // Display filtered suggestions
    suggestionsContainer.innerHTML = filteredTitles
      .map(title => `<div class="suggestion-item p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded">${title}</div>`)
      .join("");

    // Add click listeners
    suggestionsContainer.querySelectorAll(".suggestion-item").forEach(item => {
      item.addEventListener("click", () => {
        searchInput.value = item.textContent;
        suggestionsContainer.classList.add("hidden");
        fetchPageSummary(item.textContent);
      });
    });

  } catch (err) {
    console.error(err);
    suggestionsContainer.innerHTML = `<div class="p-2 text-red-600">Error fetching suggestions</div>`;
  }
}

// Fetch and display Wikipedia summary for selected heritage site
async function fetchPageSummary(title) {
  if (!title) {
    resultsSection.classList.add("hidden");
    return;
  }
  resultsSection.classList.remove("hidden");
  resultsContainer.innerHTML = `<p class="text-center text-gray-500">Loading...</p>`;

  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Summary not found");
    const data = await res.json();

    const img = data.thumbnail ? data.thumbnail.source : "https://via.placeholder.com/300";
    const directionsLink = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(data.title)}`;

    // Check if it's likely a valid place for map directions
    const validMap = /temple|fort|palace|monument|museum|heritage|church|site|ruins/i.test(data.title);

    resultsContainer.innerHTML = `
      <div class="flex flex-col h-full bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-300 dark:border-gray-700 p-4 md:p-6 transition-transform duration-300 hover:scale-105">
        <div class="flex justify-center">
          <img 
            src="${img}" 
            alt="${data.title}" 
            class="w-full sm:w-80 md:w-96 lg:w-[28rem] h-56 sm:h-64 md:h-72 lg:h-80 object-cover rounded-lg mb-4 shadow-md transition-transform duration-300 hover:scale-105"
          />
        </div>
        <h2 class="text-xl md:text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-50">${data.title}</h2>
        <p class="text-gray-700 dark:text-gray-300 mb-4 line-clamp-5 flex-grow">${data.extract}</p>
        <div class="flex flex-wrap gap-3 mt-auto">
          <button onclick='narrate(${JSON.stringify(data.extract)})' class="px-4 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 transition hover:scale-105">🎙️ Narrate</button>
          ${validMap ? `<a href="${directionsLink}" target="_blank" class="px-4 py-2 rounded-lg text-white bg-yellow-700 hover:bg-yellow-800 transition hover:scale-105">🧭 Directions</a>` : ""}
          <a href="${data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(data.title)}`}" target="_blank" class="px-4 py-2 rounded-lg text-white bg-indigo-700 hover:bg-indigo-800 transition hover:scale-105">📜 Know More</a>
        </div>
      </div>
    `;

  } catch (error) {
    console.error(error);
    resultsContainer.innerHTML = `<p class="text-center text-red-700">No details found for "${title}". Please try another search.</p>`;
  }
}

// Text-to-speech narration function
function narrate(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  } else {
    alert("Sorry, your browser doesn't support speech synthesis.");
  }
}

document.getElementById("search-btn").onclick = () => fetchPageSummary(searchInput.value.trim());

searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    fetchPageSummary(searchInput.value.trim());
  }
});













