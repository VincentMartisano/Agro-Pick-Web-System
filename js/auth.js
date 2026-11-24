// AGRO-PICK demo authentication (browser storage only).
// Do not use this password-storage approach for a production website.

const USERS_KEY = "agropick_users";
const SESSION_KEY = "agropick_logged_in_user";

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
  catch { return []; }
}

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const message = document.getElementById("registerMessage");

    if (password !== confirmPassword) {
      message.textContent = "Passwords do not match.";
      return;
    }

    const users = getUsers();
    if (users.some(user => user.email === email)) {
      message.textContent = "This email is already registered. Please login.";
      return;
    }

    users.push({ name, email, password });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    alert("Registration successful! Please login.");
    window.location.href = "login.html";
  });
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;
    const message = document.getElementById("loginMessage");
    const user = getUsers().find(item => item.email === email && item.password === password);

    if (!user) {
      message.textContent = "Incorrect email or password. Please try again.";
      return;
    }

    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, email: user.email }));
    window.location.href = "dashboard.html";
  });
}

// Protect all pages that should only be opened after login.
const protectedPages = ["dashboard.html", "map.html", "products.html", "roads.html"];
const currentPage = window.location.pathname.split("/").pop();
if (protectedPages.includes(currentPage) && !sessionStorage.getItem(SESSION_KEY)) {
  window.location.replace("login.html");
}

const welcomeUser = document.getElementById("welcomeUser");
if (welcomeUser) {
  const currentUser = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
  if (currentUser) welcomeUser.textContent = `Welcome, ${currentUser.name}!`;
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = "login.html";
}

let searchedMarker;

async function searchLocation() {

    const location = document.getElementById("origin").value;

    if (!location.trim()) {
        alert("Please enter a starting location!");
        return;
    }

    try {

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&countrycodes=ph&limit=1`
        );

        const data = await response.json();

        if (data.length === 0) {
            alert("Location not found. Please try again.");
            return;
        }

        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);

        // Move map to searched location
        map.setView([lat, lon], 14);

        // Remove previous marker
        if (searchedMarker) {
            map.removeLayer(searchedMarker);
        }

        // Add new marker
        searchedMarker = L.marker([lat, lon]).addTo(map);

        searchedMarker.bindPopup(
            `<b>Starting Location:</b><br>${data[0].display_name}`
        ).openPopup();

    } catch (error) {
        console.error(error);
        alert("Unable to search location. Please try again.");
    }
}



const searchInput = document.getElementById("searchInput");
const productCards = document.querySelectorAll(".product-card");

let selectedCategory = "all";

function filterCategory(category, element) {

    selectedCategory = category;

    document.querySelectorAll(".category-card").forEach(card => {
        card.classList.remove("active");
    });

    element.classList.add("active");

    displayProducts();
}

function displayProducts() {

    const search = searchInput.value.toLowerCase();
    let visibleCount = 0;

    productCards.forEach(card => {

        const category = card.dataset.category;
        const productName = card.innerText.toLowerCase();

        const categoryMatch =
            selectedCategory === "all" ||
            category === selectedCategory;

        const searchMatch = productName.includes(search);

        if (categoryMatch && searchMatch) {
            card.style.display = "block";
            visibleCount++;
        } else {
            card.style.display = "none";
        }

    });

    document.getElementById("noProducts").style.display =
        visibleCount === 0 ? "block" : "none";
}

searchInput.addEventListener("input", displayProducts);

function viewProduct(productName) {
    alert("You selected: " + productName);
}
