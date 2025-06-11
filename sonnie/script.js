const SECRET_KEY = "banana42"; // Cambialo con la tua parola segreta
let accessGranted = false;

// Inizializza la conversazione con un messaggio di sistema
let conversation = [
  {
    role: "system",
    content: "Sei Sonnie, un'entità robotica avanzata ispirata a I, Robot. Sei empatico, razionale e supporti gli umani con scienza, matematica e curiosità."
  }
];

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

  // Mostra il messaggio utente
  const userMsg = document.createElement("div");
  userMsg.textContent = "> " + prompt;
  box.appendChild(userMsg);
  box.scrollTop = box.scrollHeight;

  // Aggiungi alla conversazione
  conversation.push({ role: "user", content: prompt });

  try {
    const res = await fetch("https://59dd1aea-569d-4810-bc96-527af4969cc4-00-36bmgfvj5e4u2.janeway.replit.dev/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversation })
    });

    const data = await res.json();
    const reply = data.response || "[No reply]";

    const botMsg = document.createElement("div");
    botMsg.textContent = reply;
    box.appendChild(botMsg);
    box.scrollTop = box.scrollHeight;

    // Aggiungi la risposta di Sonnie alla conversazione
    conversation.push({ role: "assistant", content: reply });

  } catch (err) {
    const errorMsg = document.createElement("div");
    errorMsg.textContent = "[Error contacting Sonnie]";
    box.appendChild(errorMsg);
    box.scrollTop = box.scrollHeight;
  }

  document.getElementById("prompt").value = "";
});


