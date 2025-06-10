document.getElementById("chat-form").addEventListener("submit", async function(e) {
  e.preventDefault();
  const key = document.getElementById("key").value.trim();
  const prompt = document.getElementById("prompt").value.trim();
  const box = document.getElementById("chat-box");
  if (!key || !prompt) return;

  const userMsg = document.createElement("div");
  userMsg.textContent = "> " + prompt;
  box.appendChild(userMsg);
  box.scrollTop = box.scrollHeight;

  try {
    const res = await fetch("https://sonnie-terminal.replit.app/chat", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ key, prompt })
    });
    const data = await res.json();
    const botMsg = document.createElement("div");
    botMsg.textContent = data.reply || "[No reply]";
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
