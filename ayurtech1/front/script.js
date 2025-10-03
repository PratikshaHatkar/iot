// -----------------------------
// Authentication (Signup/Login)
// -----------------------------
function showSignup() {
  document.getElementById("login-form").style.display = "none";
  document.getElementById("signup-form").style.display = "block";
}
function showLogin() {
  document.getElementById("signup-form").style.display = "none";
  document.getElementById("login-form").style.display = "block";
}

let users = JSON.parse(localStorage.getItem("users")) || [];

// Create a default account if none exists (optional)
if (!users.length) {
  users.push({ username: "admin", password: "admin123" });
  users.push({ username: "ayuruser", password: "12345" });
  localStorage.setItem("users", JSON.stringify(users));
}

function signup() {
  let username = document.getElementById("signup-username").value.trim();
  let password = document.getElementById("signup-password").value.trim();
  if (!username || !password) { alert("Please enter username and password."); return; }
  let exists = users.some(u => u.username === username);
  if (exists) { alert("Username already exists. Choose another."); return; }
  users.push({ username, password });
  localStorage.setItem("users", JSON.stringify(users));
  alert("Signup successful. Please login.");
  showLogin();
}

function login() {
  let username = document.getElementById("login-username").value.trim();
  let password = document.getElementById("login-password").value.trim();
  users = JSON.parse(localStorage.getItem("users")) || users;
  let user = users.find(u => u.username === username && u.password === password);
  if (user) {
    localStorage.setItem("loggedInUser", username);
    // default landing is home
    window.location.assign("home.html");
  } else {
    alert("Invalid username or password.");
  }
}

function logout() {
  localStorage.removeItem("loggedInUser");
  // If index.html exists, go there; otherwise go to login (index.html)
  window.location.assign("index.html");
}

// Protect pages: if user not logged in, redirect to login
function protectPage() {
  const allowedPublic = ["index.html", ""];
  const path = window.location.pathname.split("/").pop();
  if (!localStorage.getItem("loggedInUser") && !allowedPublic.includes(path)) {
    window.location.assign("index.html");
  }
}

// Call protectPage on load for pages that include this script
try { protectPage(); } catch (e) { /* ignore if not needed */ }


// -----------------------------------
// Medicine Hub (Add / Render / Delete)
// -----------------------------------
function getMedicinesFromStore() {
  return JSON.parse(localStorage.getItem("medicines")) || [];
}
function saveMedicinesToStore(arr) {
  localStorage.setItem("medicines", JSON.stringify(arr));
}

function addMedicine() {
  const diseaseRaw = document.getElementById("diseaseField").value.trim();
  const medicineName = document.getElementById("medicineName").value.trim();
  const compositionRaw = document.getElementById("compositionField").value.trim();
  const company = document.getElementById("companyField").value.trim();
  const dosage = document.getElementById("dosageField").value.trim();
  const notes = document.getElementById("notesField").value.trim();
  const image = document.getElementById("imageField").value.trim();

  if (!diseaseRaw || !medicineName || !compositionRaw || !company) {
    alert("Please fill Disease, Medicine Name, Composition and Company.");
    return;
  }

  const diseases = diseaseRaw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  const composition = compositionRaw.split(",").map(s => s.trim()).filter(Boolean);

  let medicines = getMedicinesFromStore();
  medicines.push({
    diseases,            // array of disease keywords
    medicineName,
    composition,
    company,
    dosage,
    notes,
    image,
    createdAt: new Date().toISOString()
  });
  saveMedicinesToStore(medicines);
  alert("Medicine saved to Ayurvedic Hub.");
  renderMedicines();
  clearForm();
}

function clearForm() {
  document.getElementById("medicineForm").reset();
}

// Render list in admin
function renderMedicines() {
  const listDiv = document.getElementById("medList");
  if (!listDiv) return;
  const medicines = getMedicinesFromStore();
  if (!medicines.length) {
    listDiv.innerHTML = "<p>No medicines added yet.</p>";
    return;
  }

  // Build HTML
  let out = '<div class="med-grid">';
  medicines.forEach((m, idx) => {
    out += `
      <div class="med-card">
        <div class="med-card-top">
          <div>
            <strong>${escapeHtml(m.medicineName)}</strong>
            <div class="muted">for: ${m.diseases.join(", ")}</div>
          </div>
          <div class="med-actions">
            <button onclick="deleteMedicine(${idx})" class="danger small">Delete</button>
          </div>
        </div>

        ${m.image ? `<img src="${escapeHtml(m.image)}" alt="${escapeHtml(m.medicineName)}" class="med-thumb">` : ""}

        <div><strong>Company:</strong> ${escapeHtml(m.company)}</div>
        <div><strong>Composition:</strong> ${escapeHtml(m.composition.join(", "))}</div>
        <div><strong>Dosage:</strong> ${escapeHtml(m.dosage || "-")}</div>
        <div class="muted"><small>${escapeHtml(m.notes || "")}</small></div>
      </div>
    `;
  });
  out += "</div>";
  listDiv.innerHTML = out;
}

function deleteMedicine(index) {
  if (!confirm("Delete this medicine?")) return;
  let medicines = getMedicinesFromStore();
  if (index < 0 || index >= medicines.length) return;
  medicines.splice(index, 1);
  saveMedicinesToStore(medicines);
  renderMedicines();
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Render on load if admin page
if (window.location.pathname.endsWith("admin.html")) {
  document.addEventListener("DOMContentLoaded", () => {
    renderMedicines();
  });
}

// --------------------------
// Home Search (uses Hub)
// --------------------------
function getMedicine() {
  const input = document.getElementById("diseaseInput");
  if (!input) return;
  const q = input.value.trim().toLowerCase();
  if (!q) { alert("Please enter a disease or symptom"); return; }

  const medicines = getMedicinesFromStore();

  // Search hub: match if any disease keyword contains the query or equal
  const matched = medicines.filter(m =>
    m.diseases.some(d => d.includes(q) || q.includes(d))
  );

  // Prepare results
  if (matched.length) {
    let remediesHtml = "";
    let compHtml = "";
    let compInfo = "";
    matched.forEach(m => {
      remediesHtml += `<div class="result-item">
        <div class="result-title">${escapeHtml(m.medicineName)}</div>
        <div class="muted">Company: ${escapeHtml(m.company)}</div>
        <div class="small">Dosage: ${escapeHtml(m.dosage || "-")}</div>
      </div>`;
      compHtml += `<div class="small">${escapeHtml(m.composition.join(", "))}</div>`;
      compInfo += `<div class="small"> ${escapeHtml(m.company)} - ${escapeHtml(m.notes || "")}</div>`;
    });

    // Write into the three sections if available
    const r = document.getElementById("remedies-list");
    const c = document.getElementById("composition-list");
    const co = document.getElementById("company-list");
    if (r) r.innerHTML = remediesHtml;
    if (c) c.innerHTML = compHtml;
    if (co) co.innerHTML = compInfo;
    return;
  }

  // Fallback demo data (if hub empty or no match)
  const demoMedicines = {
    fever: {
      remedies: "Giloy, Tulsi, Ashwagandha",
      composition: "Tinospora cordifolia, Ocimum sanctum, Withania somnifera",
      company: "Dabur, Patanjali, Himalaya"
    },
    cough: {
      remedies: "Tulsi Syrup, Mulethi, Honey",
      composition: "Ocimum sanctum, Glycyrrhiza glabra, Honey",
      company: "Zandu, Himalaya, Baidyanath"
    }
  };

  const fallback = demoMedicines[q] || null;
  const r = document.getElementById("remedies-list");
  const c = document.getElementById("composition-list");
  const co = document.getElementById("company-list");
  if (fallback) {
    if (r) r.innerText = fallback.remedies;
    if (c) c.innerText = fallback.composition;
    if (co) co.innerText = fallback.company;
  } else {
    if (r) r.innerText = "No medicine found in hub or demo list. Add medicine via Ayurvedic Hub.";
    if (c) c.innerText = "-";
    if (co) co.innerText = "-";
  }
}

// Small helper for nav from admin to home
function goHome() {
  window.location.assign("home.html");
}
