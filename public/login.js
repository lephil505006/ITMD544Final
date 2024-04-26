document.addEventListener("DOMContentLoaded", function () {
  const loginButton = document.getElementById("loginButton");
  const registerButton = document.getElementById("registerButton");

  if (loginButton) {
    loginButton.addEventListener("click", function (event) {
      event.preventDefault();
      loginUser();
    });
  } else {
    console.error("Login button not found");
  }

  if (registerButton) {
    registerButton.onclick = register;
  } else {
    console.error("Register button not found");
  }
});

async function loginUser() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const messageDiv = document.getElementById("message");

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Failed to login");
    }

    const data = await response.json();
    messageDiv.textContent = "Login successful! Token: " + data.token;
    messageDiv.style.color = "green";
  } catch (error) {
    console.error("Error:", error);
    messageDiv.textContent = "Error: " + error.message;
    messageDiv.style.color = "red";
  }
}

async function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const messageDiv = document.getElementById("message");

  try {
    const response = await fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Failed to register");
    }

    const data = await response.json();
    messageDiv.textContent = "Registration successful!";
    messageDiv.style.color = "green";
  } catch (error) {
    console.error("Error:", error);
    messageDiv.textContent = "Error: " + error.message;
    messageDiv.style.color = "red";
  }
}

async function loginUser() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const messageDiv = document.getElementById("message");

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to login");
    }

    console.log("Login response:", data);
    messageDiv.textContent = "Login successful! Redirecting...";
    messageDiv.style.color = "green";

    sessionStorage.setItem("token", data.token);

    console.log("Redirecting to emoji.html");
    window.location.href = "/emoji.html";
  } catch (error) {
    console.error("Login Error:", error);
    messageDiv.textContent = "Error: " + (error.message || "Unknown Error");
    messageDiv.style.color = "red";
  }
}
