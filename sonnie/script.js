const SECRET_KEY = "sss";
let accessGranted = false;
let voiceEnabled = true;
let audio = null;
let conversation = [];
let speakingInterval = null;

let sonnieImg = null;

function setSonnieImage(state) {
  clearInterval(speakingInterval);
  if (!sonnieImg) return;

  switch (state) {
    case "thinking":
      sonnieImg.src = "img/sonnie_thinking.png";
      break;
    case "speaking":
      sonnieImg.src = "img/sonnie_talking_1.png";
      let toggle = false;
      speakingInterval = setInterval(() => {
        toggle = !toggle;
        sonnieImg.src = toggle
          ? "img/sonnie_talking_1.png"
          : "img/sonnie_talking_2.png";
      }, 250);
      break;
    default:
      sonnieImg.src = "img/sonnie_home_1.png";
  }
}

function isInWebView() {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  return /FBAN|FBAV|Instagram|Line|Twitter|WhatsApp/i.test(ua);
}

window.addEventListener("DOMContentLoaded", () => {
  sonnieImg = document.getElementById("sonnie-visual");

  if (isInWebView()) {
    const warning = document.createElement("div");
    Object.assign(warning.style, {
      position: "fixed",
      top: "0", left: "0", width: "100%", height: "100%",
      background: "rgba(0,0,0,0.95)", color: "#fff", padding: "20px",
      textAlign: "center", zIndex: 10000, display: "flex",
      flexDirection: "column", justifyContent: "center"
    });
    warning.innerHTML = `⚠️ Il browser interno (Instagram, WhatsApp, ecc.) non supporta microfono o voce.<br><br>Apri il sito nel browser per usare Sonnie al 100%.<br>`;

    const openBtn = document.createElement("button");
    openBtn.textContent = "Apri in Browser";
    Object.assign(openBtn.style, {
      marginTop: "20px", background: "#ffcc00", color: "#000",
      border: "none", padding: "10px 20px", cursor: "pointer", fontSize: "1em"
    });
    openBtn.onclick = () => window.open(window.location.href, "_blank");

    warning.appendChild(openBtn);
    document.body.appendChild(warning);
  }

  const micHint = document.createElement("div");
  micHint.id = "mic-hint";
  micHint.textContent = "🎙️ Tocca Sonnie per parlare.";
  document.body.appendChild(micHint);

  const toggleVoiceBtn = document.createElement("button");
  toggleVoiceBtn.id = "voice-toggle-btn";
  toggleVoiceBtn.textContent = "🔊 Voce: ON";
  Object.assign(toggleVoiceBtn.style, {
    position: "fixed", bottom: "70px", right: "20px", zIndex: 999,
    background: "#222", color: "#ffcc00", border: "1px solid #555",
    padding: "8px 12px", fontSize: "0.85em", cursor: "pointer"
  });
  document.body.appendChild(toggleVoiceBtn);

  toggleVoiceBtn.addEventListener("click", () => {
    voiceEnabled = !voiceEnabled;
    toggleVoiceBtn.textContent = voiceEnabled ? "🔊 Voce: ON" : "🔇 Voce: OFF";
  });

  // ✅ CLICK SULL’IMMAGINE PER ATTIVARE IL MICROFONO
  if (sonnieImg) sonnieImg.addEventListener("click", startVoice);
});

window.unlockChat = function () {
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
    setSonnieImage("idle");
  } else {
    errorMsg.style.display = "block";
  }
};

function startVoice() {
  setSonnieImage("thinking"); // 👈 Cambio immagine immediato
  const micHint = document.getElementById("mic-hint");
  micHint.textContent = "🎙️ Sto ascoltando...";

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    micHint.textContent = "❌ Il riconoscimento vocale non è supportato su questo dispositivo.";
    console.warn("SpeechRecognition non supportato");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "it-IT";
  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    micHint.textContent = "🧠 Elaborazione...";
    handleUserMessage(transcript);
  };

  recognition.onerror = function (event) {
    micHint.textContent = "❌ Errore nell'ascolto: " + event.error;
    console.warn("SpeechRecognition error:", event.error);
  };

  recognition.onend = function () {
    micHint.textContent = "🎙️ Tocca Sonnie per parlare.";
  };

  try {
    recognition.start();
  } catch (e) {
    console.warn("Errore avvio riconoscimento vocale:", e);
  }
}

async function handleUserMessage(text) {
  if (!accessGranted || !text) return;

  const box = document.getElementById("chat-box");
  conversation.push({ role: "user", content: text });

  const userDiv = document.createElement("div");
  userDiv.textContent = "> " + text;
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

    await speak(reply);
  } catch (err) {
    const errorDiv = document.createElement("div");
    errorDiv.textContent = "[Errore nella risposta di Sonnie]";
    box.appendChild(errorDiv);
    box.scrollTop = box.scrollHeight;
    setSonnieImage("idle");
  }
}

async function speak(text) {
  if (!voiceEnabled || !text) return;

  setSonnieImage("speaking");

  await new Promise(r => requestAnimationFrame(r));

  // 🔍 Rilevamento lingua
  const isEnglish = /[a-z]{3,}/i.test(text) && !/[àèéìòù]/i.test(text);
  const lang = isEnglish ? "en-US" : "it-IT";

  try {
    const res = await fetch("https://59dd1aea-569d-4810-bc96-527af4969cc4-00-36bmgfvj5e4u2.janeway.replit.dev/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, lang }) // 👈 Passiamo anche la lingua
    });

    const blob = await res.blob();
    if (audio) audio.pause();
    audio = new Audio(URL.createObjectURL(blob));

    audio.oncanplaythrough = () => audio.play().catch(err => console.warn("Errore audio:", err));
    audio.onended = () => setSonnieImage("idle");

  } catch (err) {
    console.error("Errore nella sintesi vocale:", err);
    setSonnieImage("idle");
  }
}

