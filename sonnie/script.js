const SECRET_KEY = "banana42"; // Cambialo con la tua parola segreta
let accessGranted = false;

function unlockChat() {
  const code = document.getElementById("access-code").value.trim();
  const errorMsg = document.getElementById("login-error");

  if (code === SECRET_KEY) {
    accessGranted = true;
    document.getElementById("login-section").style.display = "none";
    document.getElementById("chat-section").style.display = "block";
  } else {
    errorMsg.style.display = "block";
  }
}

document.getElementById("chat-form").addEventListener("submit", async function(e) {
  e.preventDefault();
  if (!accessGranted) return;

  const prompt = document.getElementById("prompt").value.trim();
  const box = document.getElementById("chat-box");
  if (!prompt) return;

  const userMsg = document.createElement("div");
  userMsg.textContent = "> " + prompt;
  box.appendChild(userMsg);
  box.scrollTop = box.scrollHeight;

  try {
    const res = await fetch("https://59dd1aea-569d-4810-bc96-527af4969cc4-00-36bmgfvj5e4u2.janeway.replit.dev/chat", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ message: prompt })
    });
    const data = await res.json();
    const botMsg = document.createElement("div");
    botMsg.textContent = data.response || "[No reply]";
    box.appendChild(botMsg);
    box.scrollTop = box.scrollHeight;
  } catch (err) {
    const errorMsg = document.createElement("div");
    errorMsg.textContent = "[Error contacting Sonnie]";
    box.appendChild(errorMsg);
    box.scrollTop = box.scrollHeight;
  }

  document.getElementById("prompt").value = "";
});

