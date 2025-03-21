/* script.js */

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
    footerText: "© 2025 Ambulink. Empowering Healthcare, Saving Lives."
    // Add additional keys for other pages as needed...
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
    footerText: "© 2025 एम्बुलिंक. स्वास्थ्य सेवा सशक्त करना, जीवन बचाना।"
    // Add additional keys for other pages as needed...
  }
};
const translations = {
  en: {
    pageTitleHospitals: "Hospitals Near You - Ambulink",
    hospitalsHeader: "Find Hospitals Near You",
    hospitalsSectionTitle: "Nearby Hospitals",
    hospitalSearchPlaceholder: "Search hospitals by name...",
    searchButton: "Search",
    footerTextHospitals: "© 2025 Ambulink. Empowering Healthcare, Saving Lives."
  },
  hi: {
    pageTitleHospitals: "आपके पास अस्पताल - एम्बुलिंक",
    hospitalsHeader: "अपने पास के अस्पताल खोजें",
    hospitalsSectionTitle: "निकटतम अस्पताल",
    hospitalSearchPlaceholder: "नाम से अस्पताल खोजें...",
    searchButton: "खोजें",
    footerTextHospitals: "© 2025 एम्बुलिंक। स्वास्थ्य सेवा सशक्त करना, जीवन बचाना।"
  }
};
const translations = {
  en: {
    pageTitleStatus: "Ambulance Request Status - Ambulink",
    statusHeader: "Check Ambulance Request Status",
    navHome: "Home",
    navHospitals: "Hospitals",
    navStatus: "Request Status",
    navContact: "Contact",
    statusSectionTitle: "Enter Your Request ID",
    requestIdPlaceholder: "Enter Request ID",
    statusButton: "Check Status",
  },
  hi: {
    pageTitleStatus: "एम्बुलेंस अनुरोध स्थिति - एम्बुलिंक",
    statusHeader: "एम्बुलेंस अनुरोध स्थिति जांचें",
    navHome: "होम",
    navHospitals: "अस्पताल",
    navStatus: "अनुरोध स्थिति",
    navContact: "संपर्क करें",
    statusSectionTitle: "अपना अनुरोध आईडी दर्ज करें",
    requestIdPlaceholder: "अनुरोध आईडी दर्ज करें",
    statusButton: "स्थिति जांचें",
  }
};

function updateTranslations(lang) {
  // Update <title> if it has a data-i18n attribute
  const titleTag = document.querySelector("title[data-i18n]");
  if (titleTag && translations[lang].pageTitle) {
    titleTag.innerText = translations[lang].pageTitle;
  }
  // Update elements with data-i18n attribute
  document.querySelectorAll("[data-i18n]").forEach((elem) => {
    const key = elem.getAttribute("data-i18n");
    if (translations[lang] && translations[lang][key]) {
      elem.innerText = translations[lang][key];
    }
  });
  // Update placeholders for inputs and textareas with data-i18n-placeholder attribute
  document.querySelectorAll("[data-i18n-placeholder]").forEach((elem) => {
    const key = elem.getAttribute("data-i18n-placeholder");
    if (translations[lang] && translations[lang][key]) {
      elem.setAttribute("placeholder", translations[lang][key]);
    }
  });
}

// ====================================================
// DOMContentLoaded: Initialize Site Features & Translations
// ====================================================

document.addEventListener("DOMContentLoaded", function () {
  // Initialize translations with default language (English)
  updateTranslations("en");

  // Language Selector Event Listener
  const langSelector = document.getElementById("lang-selector");
  if (langSelector) {
    langSelector.addEventListener("change", function () {
      const lang = this.value;
      updateTranslations(lang);
      console.log("Selected language:", lang);
    });
  }

  // Dark Mode Toggle
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", function () {
      document.body.classList.toggle("dark-mode");
      const icon = this.querySelector("i");
      icon.classList.toggle("fa-moon");
      icon.classList.toggle("fa-sun");
    });
  }

  // Initialize AOS animations (if available)
  if (typeof AOS !== "undefined") {
    AOS.init();
  }

  // Chat widget toggle (only if the element exists)
  const chatHeader = document.getElementById("chat-header");
  if (chatHeader) {
    chatHeader.addEventListener("click", toggleChat);
  }

  // Contact form submission with feedback
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const feedbackElem = document.getElementById("contact-feedback");
      if (feedbackElem) {
        feedbackElem.innerText =
          "Your message has been sent. We'll get back to you soon.";
      }
      contactForm.reset();
    });
  }

  // ====================================================
  // Ambulance Tracking Map (for index.html)
  // ====================================================

  let mapContainer = document.getElementById("map");
  if (mapContainer) {
    let map = L.map("map").setView([28.6139, 77.2090], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
    let ambulanceMarker = L.marker([28.6139, 77.2090])
      .addTo(map)
      .bindPopup("Ambulance is here!")
      .openPopup();

    function updateAmbulanceLocation() {
      fetch("http://127.0.0.1:5000/get_ambulance_locations")
        .then((response) => response.json())
        .then((data) => {
          const ambulances = Object.values(data);
          if (ambulances.length > 0) {
            const firstAmbulance = ambulances[0];
            ambulanceMarker
              .setLatLng([firstAmbulance.lat, firstAmbulance.lon])
              .bindPopup(
                `Ambulance at (${firstAmbulance.lat.toFixed(
                  4
                )}, ${firstAmbulance.lon.toFixed(4)})`
              )
              .openPopup();
            map.setView([firstAmbulance.lat, firstAmbulance.lon], 14);
          }
        })
        .catch((error) =>
          console.error("Error fetching ambulance location:", error)
        );
    }
    setInterval(updateAmbulanceLocation, 5000);
  }

  // ====================================================
  // Hospital Map with Marker Clustering (for hospitals.html)
  // ====================================================

  const hospitalMapContainer = document.getElementById("hospital-map");
  if (hospitalMapContainer) {
    const hospitalMap = L.map("hospital-map").setView([28.6139, 77.2090], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(hospitalMap);

    // Create marker cluster group
    const markers = L.markerClusterGroup();

    // Fetch hospital data from the backend
    fetch("http://127.0.0.1:5000/get_hospitals")
      .then((response) => response.json())
      .then((data) => {
        if (data.hospitals) {
          data.hospitals.forEach((hospital) => {
            const hospitalIcon = L.icon({
              iconUrl: "hospital-icon.png", // Ensure this icon exists or use a default marker
              iconSize: [32, 32],
            });
            const marker = L.marker([hospital.lat, hospital.lon], {
              icon: hospitalIcon,
            }).bindPopup(
              `<b>${hospital.name}</b><br>${hospital.address}<br>
               <span class="rating" data-hospital="${hospital.name}">
               Rating: <i class="fa fa-star"></i> <i class="fa fa-star"></i> <i class="fa fa-star"></i>
               </span>`
            );
            markers.addLayer(marker);
          });
          hospitalMap.addLayer(markers);
        }
      })
      .catch((error) =>
        console.error("Error fetching hospitals:", error)
      );

    // Expose searchHospitals function globally so inline onclick works
    window.searchHospitals = function () {
      const searchValue = document.getElementById("hospital-search").value.toLowerCase();
      markers.clearLayers();
      fetch("http://127.0.0.1:5000/get_hospitals")
        .then((response) => response.json())
        .then((data) => {
          if (data.hospitals) {
            data.hospitals.forEach((hospital) => {
              if (hospital.name.toLowerCase().includes(searchValue)) {
                const hospitalIcon = L.icon({
                  iconUrl: "hospital-icon.png",
                  iconSize: [32, 32],
                });
                const marker = L.marker([hospital.lat, hospital.lon], {
                  icon: hospitalIcon,
                }).bindPopup(
                  `<b>${hospital.name}</b><br>${hospital.address}`
                );
                markers.addLayer(marker);
              }
            });
            hospitalMap.addLayer(markers);
          }
        });
    };
  }
});

// ====================================================
// Ambulance Request: Triggered on "Call Now"
// ====================================================

function callEmergency() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const userLocation = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        fetch("http://127.0.0.1:5000/request_ambulance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userLocation),
        })
          .then((response) => response.json())
          .then((data) => {
            alert(data.message || "No ambulances available!");
          })
          .catch((error) => {
            console.error("Error requesting ambulance:", error);
            alert("Error requesting ambulance. Try again!");
          });
      },
      function () {
        alert("Location permission denied.");
      }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
}

// ====================================================
// Check Request Status Function
// ====================================================

function checkRequestStatus() {
  const requestId = document.getElementById("request-id").value;
  if (!requestId) {
    alert("Please enter a valid request ID.");
    return;
  }
  fetch(`http://127.0.0.1:5000/status?id=${requestId}`)
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("status-result").innerText =
        data.message || "Invalid Request ID.";
    })
    .catch((error) => console.error("Error checking status:", error));
}

// ====================================================
// Chat Widget Toggle Function
// ====================================================

function toggleChat() {
  const chatWidget = document.getElementById("chat-widget");
  if (chatWidget) {
    chatWidget.classList.toggle("chat-closed");
  }
}

// ====================================================
// Push Notification Request Function
// ====================================================

function requestPushNotification() {
  if ("Notification" in window) {
    if (Notification.permission === "granted") {
      new Notification("Ambulink Notifications Enabled!");
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("Ambulink Notifications Enabled!");
        }
      });
    }
  } else {
    alert("Push notifications are not supported by your browser.");
  }
}
