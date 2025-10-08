if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.classList.add('dark');
}

function getPlaces() {
  if (!navigator.geolocation) return alert("Geolocation not supported.");
  navigator.geolocation.getCurrentPosition(pos => {
    fetchPlaces(pos.coords.latitude, pos.coords.longitude);
  }, () => alert("Location access denied."));
}

function fetchPlaces(lat, lon) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lon}&gsradius=5000&gslimit=15&format=json&origin=*`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const pages = data.query.geosearch;
      const container = document.getElementById("places");
      container.innerHTML = "";

      pages.forEach(page => {
        if (/temple|fort|palace|monument|museum|heritage/i.test(page.title)) {
          displayPlace(page.pageid, page.title);
        }
      });
    });
}

// Truncate text to max 5 sentences
function getSnippet(text, maxSentences = 5) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  return sentences.slice(0, maxSentences).join(" ").trim();
}

// Equalize paragraph heights
function equalizeParagraphHeights() {
  const paragraphs = document.querySelectorAll(".place-snippet");
  let maxHeight = 0;

  paragraphs.forEach(p => {
    p.style.height = "auto"; // reset height
    if (p.offsetHeight > maxHeight) maxHeight = p.offsetHeight;
  });

  paragraphs.forEach(p => {
    p.style.height = maxHeight + "px";
  });
}

function displayPlace(pageid, title) {
  const container = document.getElementById("places");
  const div = document.createElement("div");
  div.className = "bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 flex flex-col transition-colors duration-500";

  div.innerHTML = `
    <h3 class="text-lg md:text-xl font-semibold mb-2 text-gray-800 dark:text-[#d4b878]">${title}</h3>
    <img id="img-${pageid}" class="w-full h-40 md:h-48 object-cover rounded-lg mb-2" alt="Loading image...">
    <p id="text-${pageid}" class="text-gray-600 dark:text-gray-300 mb-2 place-snippet">Loading...</p>
    <div class="flex flex-wrap gap-2 mt-2">
      <button id="speak-${pageid}" class="bg-[#84a98c] hover:bg-[#729879] text-white text-sm px-3 py-1 rounded-lg">📖 Narrate</button>
      <a id="dir-${pageid}" target="_blank" class="bg-[#b5a27d] hover:bg-[#a18f6d] text-white text-sm px-3 py-1 rounded-lg">🧭 Directions</a>
      <a id="know-${pageid}" target="_blank" class="bg-[#c8ad55] hover:bg-[#bfa546] text-white text-sm px-3 py-1 rounded-lg">📜 Know More</a>
    </div>
  `;
  container.appendChild(div);

  const summaryUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages|info&pageids=${pageid}&exintro=1&explaintext=1&pithumbsize=400&inprop=url&format=json&origin=*`;
  fetch(summaryUrl)
    .then(res => res.json())
    .then(data => {
      const page = data.query.pages[pageid];
      const extract = page.extract || "No description available.";
      const image = page.thumbnail?.source || "ttguide.png";

      document.getElementById(`img-${pageid}`).src = image;
      const snippet = getSnippet(extract);
      const paragraph = document.getElementById(`text-${pageid}`);
      paragraph.innerText = snippet;

      // Narrate button
      document.getElementById(`speak-${pageid}`).onclick = () => {
        const utterance = new SpeechSynthesisUtterance(snippet);
        utterance.lang = "en-US";
        speechSynthesis.speak(utterance);
      };

      // Directions button
      const directionsLink = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(title)}`;
      document.getElementById(`dir-${pageid}`).href = directionsLink;

      // Know More button
      const wikiLink = page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
      document.getElementById(`know-${pageid}`).href = wikiLink;

      // Equalize paragraph heights after rendering all cards
      equalizeParagraphHeights();
    });
}
