/* script.js */

const API_BASE_URL = "http://127.0.0.1:5000"; // Backend URL

// ====================================================
// Translation Dictionary and Functions
// ====================================================

const translations = {
  en: {
    pageTitle: "Ambulink - Emergency Response",
    headerTitle: "Ambulink - Emergency Response",
    navHome: "Home",
    navHospitals: "Hospitals",
    navStatus: "Request Status",
    navContact: "Contact",
    heroHeading: "Fast & Reliable Ambulance Service",
    heroSubText: "Emergency medical help at your fingertips.",
    callNow: "Call Now",
    checkStatus: "Check Request Status",
    footerText: "© 2025 Ambulink. Empowering Healthcare, Saving Lives.",
    hospitalsHeader: "Find Hospitals Near You",
    hospitalSearchPlaceholder: "Search hospitals...",
    searchButton: "Search",
    statusHeader: "Check Ambulance Request Status",
    statusSectionTitle: "Enter Your Request ID",
    requestIdPlaceholder: "Enter Request ID",
    statusButton: "Check Status"
  },
  hi: {
    pageTitle: "एम्बुलिंक - आपातकालीन सेवा",
    headerTitle: "एम्बुलिंक - आपातकालीन सेवा",
    navHome: "होम",
    navHospitals: "अस्पताल",
    navStatus: "अनुरोध स्थिति",
    navContact: "संपर्क करें",
    heroHeading: "तेजी से और विश्वसनीय एंबुलेंस सेवा",
    heroSubText: "आपकी उंगली पर आपातकालीन चिकित्सा सहायता।",
    callNow: "अभी कॉल करें",
    checkStatus: "अनुरोध स्थिति देखें",
    footerText: "© 2025 एम्बुलिंक. स्वास्थ्य सेवा सशक्त करना, जीवन बचाना।",
    hospitalsHeader: "अपने पास के अस्पताल खोजें",
    hospitalSearchPlaceholder: "नाम से अस्पताल खोजें...",
    searchButton: "खोजें",
    statusHeader: "एम्बुलेंस अनुरोध स्थिति जांचें",
    statusSectionTitle: "अपना अनुरोध आईडी दर्ज करें",
    requestIdPlaceholder: "अनुरोध आईडी दर्ज करें",
    statusButton: "स्थिति जांचें"
  }
};

function updateTranslations(lang) {
  document.querySelectorAll("[data-i18n]").forEach((elem) => {
    const key = elem.getAttribute("data-i18n");
    if (translations[lang] && translations[lang][key]) {
      elem.innerText = translations[lang][key];
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  updateTranslations("en");

  document.getElementById("lang-selector")?.addEventListener("change", function () {
    updateTranslations(this.value);
  });

  // Dark Mode Toggle
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", function () {
      document.body.classList.toggle("dark-mode");
      localStorage.setItem("darkMode", document.body.classList.contains("dark-mode") ? "enabled" : "disabled");
    });

    if (localStorage.getItem("darkMode") === "enabled") {
      document.body.classList.add("dark-mode");
    }
  }
  // Attach event listeners to forms
  document.getElementById("signup-form")?.addEventListener("submit", signupUser);
  document.getElementById("login-form")?.addEventListener("submit", loginUser);

  // Hide/Show Logout Button Based on Login Status
  let loggedInUser = localStorage.getItem("loggedInUser");
  if (loggedInUser) {
      document.getElementById("logout-btn").style.display = "block";
  } else {
      document.getElementById("logout-btn").style.display = "none";
  }
  // Initialize Maps
  initAmbulanceTracking();
  initHospitalMap();
  let ambulanceLayer = L.layerGroup().addTo(map);
  function loadAmbulanceLocations() {
    fetch(`${API_BASE_URL}/get_ambulance_locations`)
    .then(response => response.json())
    .then(data => {
        // Clear previous markers
        ambulanceLayer.clearLayers();

        // Add new markers
        Object.keys(data).forEach(ambulance => {
            let { lat, lon, status } = data[ambulance];
            let marker = L.marker([lat, lon], {
                icon: L.icon({
                    iconUrl: "images/ambulance-icon.png", // Replace with your actual icon
                    iconSize: [40, 40]
                })
            }).addTo(ambulanceLayer)
            .bindPopup(`<b>${ambulance}</b><br>Status: ${status}`);
        });
    })
    .catch(error => console.error("Error fetching ambulance data:", error));
}
  setInterval(loadAmbulanceLocations, 10000);


  // Chat widget toggle
  document.getElementById("chat-header")?.addEventListener("click", toggleChat);
});

// ====================================================
// Ambulance Tracking Map
// ====================================================

function initAmbulanceTracking() {
  let mapContainer = document.getElementById("map");
  if (!mapContainer) return;

  let map = L.map("map").setView([28.6139, 77.2090], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  let ambulanceMarkers = [];

  function updateAmbulanceLocation() {
    fetch("/get_ambulance_locations")
      .then(response => response.json())
      .then(data => {
        ambulanceMarkers.forEach(marker => map.removeLayer(marker));
        ambulanceMarkers = [];
        data.ambulances.forEach(ambulance => {
          let marker = L.marker([ambulance.lat, ambulance.lon])
            .addTo(map)
            .bindPopup(`Ambulance at (${ambulance.lat.toFixed(4)}, ${ambulance.lon.toFixed(4)})`);
          ambulanceMarkers.push(marker);
        });
      })
      .catch(error => console.error("Error fetching ambulance location:", error));
  }

  setInterval(updateAmbulanceLocation, 5000);
}

// ====================================================
// Hospital Map with Clustering
// ====================================================

function initHospitalMap() {
  let hospitalMapContainer = document.getElementById("hospital-map");
  if (!hospitalMapContainer) return;

  // Dark Mode Tile Layers
  let darkTileLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; OpenStreetMap contributors &copy; CartoDB"
  });

  let lightTileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  });

  // Initialize the Map
  let hospitalMap = L.map("hospital-map").setView([28.6139, 77.2090], 12);
  let currentTileLayer = lightTileLayer;  // Default Light Mode
  currentTileLayer.addTo(hospitalMap);

  let markers = L.markerClusterGroup();
  let loadingSpinner = document.getElementById("loading-spinner");

  // Show the loading spinner
  if (loadingSpinner) loadingSpinner.style.display = "block";

  // Get User's Location
  navigator.geolocation.getCurrentPosition(position => {
    let userLat = position.coords.latitude;
    let userLng = position.coords.longitude;

    // Add User Marker on Map
    let userMarker = L.marker([userLat, userLng], {
      icon: L.icon({ 
        iconUrl: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png', 
        iconSize: [32, 32] 
      })
    }).bindPopup("You are here").addTo(hospitalMap);
    document.getElementById("loading-spinner").style.display = "block";
    // Fetch Hospital Data
    fetch('http://127.0.0.1:5000/get_hospitals')
      .then(response => response.json())
      .then(data => {
        if (loadingSpinner) loadingSpinner.style.display = "none"; // Hide Spinner

        // Sort Hospitals by Distance from User
        let sortedHospitals = data.hospitals.map(hospital => {
          hospital.distance = L.latLng(userLat, userLng).distanceTo([hospital.lat, hospital.lon]);
          return hospital;
        }).sort((a, b) => a.distance - b.distance);

        // Add Hospitals to Map
        sortedHospitals.forEach(hospital => {
          let marker = L.marker([hospital.lat, hospital.lon])
            .bindPopup(`<b>${hospital.name}</b><br>${hospital.address}<br>Distance: ${(hospital.distance / 1000).toFixed(2)} km`);
          markers.addLayer(marker);
        });
        hospitalMap.addLayer(markers);
      })
      .catch(error => console.error("Error fetching hospitals:", error));

  }, () => {
    console.warn("Location permission denied.");
    if (loadingSpinner) loadingSpinner.style.display = "none"; // Hide Spinner
  });

  // Dark Mode Support for Map
  document.getElementById("dark-mode-toggle")?.addEventListener("click", function () {
    if (document.body.classList.contains("dark-mode")) {
      hospitalMap.removeLayer(currentTileLayer);
      darkTileLayer.addTo(hospitalMap);
      currentTileLayer = darkTileLayer;
    } else {
      hospitalMap.removeLayer(currentTileLayer);
      lightTileLayer.addTo(hospitalMap);
      currentTileLayer = lightTileLayer;
    }
  });
}


// ====================================================
// Emergency Call Function
// ====================================================

function callEmergency() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      fetch("/request_ambulance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: position.coords.latitude, lon: position.coords.longitude })
      })
        .then(response => response.json())
        .then(data => alert(data.message || "No ambulances available!"))
        .catch(error => alert("Error requesting ambulance. Try again!"));
    }, () => alert("Location permission denied."));
  } else {
    alert("Geolocation is not supported by your browser.");
  }
}

// ====================================================
// Chat Widget Toggle Function
// ====================================================

function toggleChat() {
  document.getElementById("chat-widget")?.classList.toggle("chat-closed");
}

// ====================================================
// Push Notification Request
// ====================================================

function requestPushNotification() {
  if ("Notification" in window && Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") new Notification("Ambulink Notifications Enabled!");
    });
  } else {
    alert("Push notifications are not supported.");
  }
}
function sortHospitalsByDistance(userLat, userLng, hospitals) {
    return hospitals.map(hospital => {
        hospital.distance = L.latLng(userLat, userLng).distanceTo([hospital.lat, hospital.lng]);
        return hospital;
    }).sort((a, b) => a.distance - b.distance);
}


// 🚀 Signup Function
function signupUser(event) {
    event.preventDefault();
    
    const username = document.getElementById("signup-username").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || data.error);
    })
    .catch(error => console.error("Error:", error));
}

// 🚀 Login Function
function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert("Login successful! Welcome " + data.user);
            localStorage.setItem("loggedInUser", data.user); // Store user session
            window.location.href = "index.html"; // Redirect to home
        } else {
            alert(data.error);
        }
    })
    .catch(error => console.error("Error:", error));
}

// 🚪 Logout Function
function logoutUser() {
    fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        credentials: "include"
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        localStorage.removeItem("loggedInUser");
        window.location.href = "login.html"; // Redirect to login page
    })
    .catch(error => console.error("Error:", error));
}
// Function to open the modal
function openModal(modalId) {
    document.getElementById(modalId).style.display = "block";
}

// Function to close the modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

// Close modal when clicking outside
window.onclick = function(event) {
    let modals = document.getElementsByClassName("modal");
    for (let modal of modals) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }
};
