document
  .getElementById("loginForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

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
    }
  });
