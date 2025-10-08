// Heritage Sites (9 per state)
const heritageSites = {
  "Tamil Nadu": ["Brihadeeswarar Temple", "Mahabalipuram", "Meenakshi Amman Temple", "Ramanathaswamy Temple", "Kapaleeshwarar Temple", "Fort St. George", "Rock Fort Temple", "Kanchipuram Temples", "Gangaikonda Cholapuram"],
  "Delhi": ["Qutub Minar", "Red Fort", "Humayun's Tomb", "India Gate", "Lotus Temple", "Jama Masjid", "Rashtrapati Bhavan", "Akshardham Temple", "Raj Ghat"],
  "Rajasthan": ["Amber Fort", "City Palace Jaipur", "Jantar Mantar Jaipur", "Mehrangarh Fort", "Lake Palace", "Chittorgarh Fort", "Hawa Mahal", "Umaid Bhawan Palace", "Kumbhalgarh Fort"],
  "Uttar Pradesh": ["Taj Mahal", "Agra Fort", "Fatehpur Sikri", "Varanasi Ghats", "Sarnath", "Allahabad Fort", "Jhansi Fort", "Bara Imambara", "Chhota Imambara"],
  "Maharashtra": ["Ajanta Caves", "Ellora Caves", "Gateway of India", "Shaniwar Wada", "Elephanta Caves", "Bibi Ka Maqbara", "Raigad Fort", "Sindhudurg Fort", "Kanheri Caves"],
  "Karnataka": ["Hampi", "Mysore Palace", "Gol Gumbaz", "Badami Caves", "Belur Temple", "Halebidu Temples", "Shravanabelagola", "Bijapur Fort", "Bangalore Palace"],
  "West Bengal": ["Victoria Memorial", "Howrah Bridge", "Dakshineswar Kali Temple", "Belur Math", "Indian Museum", "Fort William Kolkata", "Birla Planetarium", "Marble Palace", "Kalighat Temple"],
  "Madhya Pradesh": ["Khajuraho Temples", "Sanchi Stupa", "Gwalior Fort", "Bhimbetka Caves", "Orchha Fort", "Ujjain Mahakaleshwar Temple", "Mandu Fort", "Omkareshwar Temple", "Chaturbhuj Temple"],
  "Odisha": ["Konark Sun Temple", "Jagannath Temple", "Lingaraja Temple", "Rajarani Temple", "Mukteswara Temple", "Udayagiri Caves", "Khandagiri Caves", "Simlipal National Park", "Chilika Lake"],
  "Kerala": ["Padmanabhaswamy Temple", "Athirappilly Falls", "Fort Kochi", "Bekal Fort", "Mattancherry Palace", "Periyar Wildlife Sanctuary", "Alleppey Backwaters", "Varkala Beach", "Sree Poornathrayesa Temple"],
  "Punjab": ["Golden Temple", "Jallianwala Bagh", "Wagah Border", "Qila Mubarak", "Sheesh Mahal Patiala", "Anandpur Sahib", "Pul Kanjari", "Ranjit Singh Museum", "Gobindgarh Fort"]
};

// Popular Sites (9 only)
const popularSites = [
  "Taj Mahal", "Qutub Minar", "Red Fort", "Ajanta Caves", "Hampi",
  "Brihadeeswarar Temple", "Amber Fort", "India Gate", "Mysore Palace"
];

// Fetch Popular Sites
const popularContainer = document.getElementById("popularSites");
popularSites.forEach(site => fetchWikiCard(site, popularContainer));

// Handle State Selection
document.getElementById("stateSelect").addEventListener("change", e => {
  const state = e.target.value;
  const stateContainer = document.getElementById("stateSites");
  stateContainer.innerHTML = "";

  if (state && heritageSites[state]) {
    heritageSites[state].forEach(site => fetchWikiCard(site, stateContainer));
  }
});

// Fetch Wikipedia summary and create card
async function fetchWikiCard(title, container) {
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
    const data = await res.json();

    const extract = data.extract
      ? data.extract.split(". ").slice(0, 5).join(". ") + "."
      : "No description available.";

    const card = document.createElement("div");
    card.className = "bg-white dark:bg-gray-800 shadow-md rounded-xl p-4 hover:shadow-xl transition transform hover:-translate-y-1 animate-fadeIn";
    card.innerHTML = `
      <img src="${data.thumbnail?.source || 'https://via.placeholder.com/300'}" alt="${title}" class="w-full h-40 object-cover rounded-md mb-3">
      <h4 class="text-lg font-bold mb-2 text-gray-800 dark:text-gray-200">${data.title}</h4>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">${extract}</p>
      <div class="flex gap-3 flex-wrap">
        <button onclick="narrateText('${data.title.replace(/'/g, "\\'")}: ${extract.replace(/'/g, "\\'")}')" class="px-3 py-1 bg-indigo-500 text-white rounded-md text-sm hover:bg-indigo-600">🔊 Narrate</button>
        <a href="https://www.google.com/maps/search/${encodeURIComponent(data.title)}" target="_blank" class="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600">📍 Map</a>
        <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(data.title)}" target="_blank" class="px-3 py-1 bg-yellow-500 text-white rounded-md text-sm hover:bg-yellow-600">📖 Know More</a>
      </div>
    `;
    container.appendChild(card);
  } catch (err) {
    console.error("Wiki fetch failed:", err);
  }
}

// Narration: reads both name and description
function narrateText(text) {
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-IN";
  speechSynthesis.speak(speech);
}

// Animation: fade-in effect
const style = document.createElement("style");
style.innerHTML = `
  @keyframes fadeIn { from {opacity:0; transform:translateY(20px);} to {opacity:1; transform:translateY(0);} }
  .animate-fadeIn { animation: fadeIn 0.8s ease-in-out; }
`;
document.head.appendChild(style);


