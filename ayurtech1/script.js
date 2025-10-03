// ===== Authentication =====
function showSignup() {
  document.getElementById("login-form").style.display = "none";
  document.getElementById("signup-form").style.display = "block";
}
function showLogin() {
  document.getElementById("signup-form").style.display = "none";
  document.getElementById("login-form").style.display = "block";
}

// Fake storage for demo (replace with DB later)
let users = JSON.parse(localStorage.getItem("users")) || [];

// Signup
function signup() {
  let username = document.getElementById("signup-username").value;
  let password = document.getElementById("signup-password").value;

  if (username && password) {
    users.push({ username, password });
    localStorage.setItem("users", JSON.stringify(users));
    alert("Signup successful! Please login.");
    showLogin();
  } else {
    alert("Please enter all details.");
  }
}

// Login
function login() {
  let username = document.getElementById("login-username").value;
  let password = document.getElementById("login-password").value;

  let users = JSON.parse(localStorage.getItem("users")) || [];
  let user = users.find(u => u.username === username && u.password === password);

  if (user) {
    localStorage.setItem("loggedInUser", username);
    // ✅ Redirect to home page
    window.location.assign("home.html");
  } else {
    alert("Invalid username or password.");
  }
}


// Logout
function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
}

// ===== Medicine Search =====
function getMedicine() {
  let disease = document.getElementById("diseaseInput").value;
  if (!disease) {
    alert("Please enter a disease or symptom");
    return;
  }

  // Fake demo data (Replace with API / DB results later)
  let demoMedicines = {
    "fever": {
      remedies: "Giloy, Tulsi, Ashwagandha",
      composition: "Natural herbs, antioxidants, immunity boosters",
      company: "Dabur, Patanjali, Himalaya"
    },
    "cough": {
      remedies: "Tulsi Syrup, Mulethi, Honey",
      composition: "Herbal extracts, soothing agents",
      company: "Zandu, Himalaya, Baidyanath"
    }
  };

  let result = demoMedicines[disease.toLowerCase()] || {
    remedies: "No data found",
    composition: "-",
    company: "-"
  };

  document.getElementById("remedies-list").innerText = result.remedies;
  document.getElementById("composition-list").innerText = result.composition;
  document.getElementById("company-list").innerText = result.company;
}
