const SECRET_KEY = "aaaa";
let accessGranted = false;
let voiceEnabled = true;
let audio = null;
let conversation = [];
let speakingInterval = null;

window.addEventListener("DOMContentLoaded", () => {
  const sonnieImg = document.getElementById("sonnie-visual");
  const speakBtn = document.getElementById("speakBtn");

  function setSonnieImage(state) {
    clearInterval(speakingInterval);
    if (!sonnieImg) return;

    switch (state) {
      case "thinking":
        sonnieImg.src = "img/sonnie_thinking.png";
        break;
      case "speaking":
        let toggle = false;
        speakingInterval = setInterval(() => {
          toggle = !toggle;
          sonnieImg.src = toggle
            ? "img/sonnie_talking_1.png"
            : "img/sonnie_talking_2.png";
        }, 250);
        break;
      default: // idle
        sonnieImg.src = "img/sonnie_home_1.png";
    }
  }

  function isInWebView() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    return /FBAN|FBAV|Instagram|Line|Twitter|WhatsApp/i.test(ua);
  }

  if (isInWebView()) {
    const warning = document.createElement("div");
    warning.style.position = "fixed";
    warning.style.top = "0";
    warning.style.left = "0";
    warning.style.width = "100%";
    warning.style.height = "100%";
    warning.style.background = "rgba(0,0,0,0.95)";
    warning.style.color = "#fff";
    warning.style.padding = "20px";
    warning.style.textAlign = "center";
    warning.style.zIndex = 10000;
    warning.style.display = "flex";
    warning.style.flexDirection = "column";
    warning.style.justifyContent = "center";
    warning.innerHTML = `⚠️ Il browser interno (Instagram, WhatsApp, ecc.) non supporta microfono o voce.<br><br>Apri il sito nel browser per usare Sonnie al 100%.<br>`;

    const openBtn = document.createElement("button");
    openBtn.textContent = "Apri in Browser";
    openBtn.style.marginTop = "20px";
    openBtn.style.background = "#ffcc00";
    openBtn.style.color = "#000";
    openBtn.style.border = "none";
    openBtn.style.padding = "10px 20px";
    openBtn.style.cursor = "pointer";
    openBtn.style.fontSize = "1em";

    openBtn.onclick = () => window.open(window.location.href, "_blank");

    warning.appendChild(openBtn);
    document.body.appendChild(warning);
  }

  async function speak(text) {
    if (!voiceEnabled || !text) return;
    setSonnieImage("speaking");

    try {
      const res = await fetch("https://59dd1aea-569d-4810-bc96-527af4969cc4-00-36bmgfvj5e4u2.janeway.replit.dev/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });

      const blob = await res.blob();
      if (audio) {
        audio.pause();
        audio = null;
      }

      audio = new Audio(URL.createObjectURL(blob));

      audio.oncanplaythrough = () => {
        audio.play().catch(err => {
          console.warn("Impossibile riprodurre audio:", err);
        });
      };

      audio.onended = () => {
        setSonnieImage("idle");
      };

    } catch (err) {
      console.error("Errore nella sintesi vocale:", err);
      setSonnieImage("idle");
    }
  }

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

  document.getElementById("chat-form").addEventListener("submit", async function (e) {
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

    setSonnieImage("thinking");

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

      speak(reply);

    } catch (err) {
      const errorDiv = document.createElement("div");
      errorDiv.textContent = "[Error contacting Sonnie]";
      box.appendChild(errorDiv);
      box.scrollTop = box.scrollHeight;
      setSonnieImage("idle");
    }
  });

  const micHint = document.createElement("div");
  micHint.id = "mic-hint";
  micHint.textContent = "🎙️ Prima volta? Consenti l'uso del microfono per parlare con Sonnie!";
  document.body.appendChild(micHint);

  if (speakBtn) {
    speakBtn.addEventListener("click", startVoice);
  }

  const toggleVoiceBtn = document.createElement("button");
  toggleVoiceBtn.textContent = "🔊 Voce: ON";
  Object.assign(toggleVoiceBtn.style, {
    position: "fixed",
    bottom: "70px",
    right: "20px",
    zIndex: 999,
    background: "#222",
    color: "#ffcc00",
    border: "1px solid #555",
    padding: "8px 12px",
    fontSize: "0.85em",
    cursor: "pointer"
  });
  document.body.appendChild(toggleVoiceBtn);

  toggleVoiceBtn.addEventListener("click", () => {
    voiceEnabled = !voiceEnabled;
    toggleVoiceBtn.textContent = voiceEnabled ? "🔊 Voce: ON" : "🔇 Voce: OFF";
  });

  function startVoice() {
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
      document.getElementById("prompt").value = transcript;
      document.getElementById("chat-form").dispatchEvent(new Event("submit"));
    };

    recognition.onerror = function (event) {
      micHint.textContent = "❌ Errore nell'ascolto: " + event.error;
      console.warn("SpeechRecognition error:", event.error);
    };

    recognition.onend = function () {
      micHint.textContent = "🎙️ Premi Speak per parlare con Sonnie.";
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn("Errore avvio riconoscimento vocale:", e);
    }
  }
});

