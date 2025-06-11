const SECRET_KEY = "banana42"; 
let accessGranted = false;
let voiceEnabled = true;
let audio = null; // nuovo per riproduzione vocale
let conversation = [];

// 🔊 Funzione per far parlare Sonnie usando il backend Google Cloud
async function speak(text) {
  if (!voiceEnabled || !text) return;
  try {
    const res = await fetch("https://59dd1aea-569d-4810-bc96-527af4969cc4-00-36bmgfvj5e4u2.janeway.replit.dev/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    const blob = await res.blob();
    if (audio) audio.pause();
    audio = new Audio(URL.createObjectURL(blob));
    audio.play();
  } catch (err) {
    console.error("Errore nella sintesi vocale:", err);
  }
}

function unlockChat() {
  const code = document.getElementById("access-code").value.trim();
  const errorMsg = document.getElementById("login-error");

  if (code === SECRET_KEY) {
    accessGranted = true;
    document.getElementById("login-section").style.display = "none";
    document.getElementById("chat-section").style.display = "block";
    conversation = [
      {
        role: "system",
        content: "Sei Sonnie, un'entità robotica avanzata ispirata a I, Robot. Sei empatico, razionale e supporti gli umani con scienza, matematica e curiosità."
      }
    ];
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

  const userMsg = { role: "user", content: prompt };
  conversation.push(userMsg);

  const userDiv = document.createElement("div");
  userDiv.textContent = "> " + prompt;
  box.appendChild(userDiv);
  box.scrollTop = box.scrollHeight;

  try {
    const res = await fetch("https://59dd1aea-569d-4810-bc96-527af4969cc4-00-36bmgfvj5e4u2.janeway.replit.dev/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversation })
    });

    const data = await res.json();
    const reply = data.response || "[No reply]";

    conversation.push({ role: "assistant", content: reply });

    const botDiv = document.createElement("div");
    botDiv.textContent = reply;
    box.appendChild(botDiv);
    box.scrollTop = box.scrollHeight;

    speak(reply); // 🔈 usa Google Cloud TTS

  } catch (err) {
    const errorDiv = document.createElement("div");
    errorDiv.textContent = "[Error contacting Sonnie]";
    box.appendChild(errorDiv);
    box.scrollTop = box.scrollHeight;
  }
});

// 🎤 VOICE UI SETUP
const micHint = document.createElement("div");
micHint.id = "mic-hint";
micHint.textContent = "🎙️ Prima volta? Consenti l'uso del microfono per parlare con Sonnie!";
document.body.appendChild(micHint);

speakBtn.addEventListener("click", startVoice);

// 🔇 Bottone per attivare/disattivare voce
const toggleVoiceBtn = document.createElement("button");
toggleVoiceBtn.textContent = "🔊 Voce: ON";
toggleVoiceBtn.style.position = "fixed";
toggleVoiceBtn.style.bottom = "70px";
toggleVoiceBtn.style.right = "20px";
toggleVoiceBtn.style.zIndex = 999;
toggleVoiceBtn.style.background = "#222";
toggleVoiceBtn.style.color = "#ffcc00";
toggleVoiceBtn.style.border = "1px solid #555";
toggleVoiceBtn.style.padding = "8px 12px";
toggleVoiceBtn.style.fontSize = "0.85em";
toggleVoiceBtn.style.cursor = "pointer";
document.body.appendChild(toggleVoiceBtn);

toggleVoiceBtn.addEventListener("click", () => {
  voiceEnabled = !voiceEnabled;
  toggleVoiceBtn.textContent = voiceEnabled ? "🔊 Voce: ON" : "🔇 Voce: OFF";
});

// 🎤 Riconoscimento vocale
function startVoice() {
  micHint.textContent = "🎙️ Sto ascoltando...";
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "it-IT";
  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById("prompt").value = transcript;
    document.getElementById("chat-form").dispatchEvent(new Event("submit"));
  };

  recognition.onerror = function() {
    micHint.textContent = "❌ Errore nell'ascolto. Riprova.";
  };

  recognition.onend = function() {
    micHint.textContent = "🎙️ Premi Speak per parlare con Sonnie.";
  };

  recognition.start();
}
