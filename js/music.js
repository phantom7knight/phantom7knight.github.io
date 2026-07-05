/* Background music toggle.
   Track: "Floating Cities" — Kevin MacLeod (incompetech.com), CC BY 4.0.
   Browsers block autoplay with sound, so playback always starts from a click;
   state and position persist across pages via localStorage. */
(function () {
  const TRACK = "/assets/audio/floating-cities.mp3";
  const VOLUME = 0.3;
  const KEY = "site-music";

  let audio = null;

  const btn = document.createElement("button");
  btn.id = "music-toggle";
  btn.type = "button";
  btn.title = "background music: “Floating Cities” — Kevin MacLeod (incompetech.com), CC BY 4.0";
  Object.assign(btn.style, {
    position: "fixed",
    left: "14px",
    bottom: "12px",
    zIndex: "7",
    background: "var(--bg-panel, #0e1511)",
    border: "1px solid var(--border-bright, #2e4534)",
    borderRadius: "6px",
    color: "var(--text-dim, #7d8f82)",
    fontFamily: "inherit",
    fontSize: "12px",
    padding: "4px 10px",
    cursor: "pointer",
  });

  function loadState() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveState(on) {
    localStorage.setItem(KEY, JSON.stringify({ on: on, t: audio ? audio.currentTime : 0 }));
  }

  function setLabel(on) {
    btn.textContent = on ? "[♪ on]" : "[♪ off]";
    btn.style.color = on ? "var(--accent, #6ee85d)" : "var(--text-dim, #7d8f82)";
  }

  function ensureAudio() {
    if (audio) return audio;
    audio = new Audio(TRACK);
    audio.loop = true;
    audio.volume = VOLUME;
    audio.preload = "none";
    const saved = loadState();
    if (saved.t) {
      audio.addEventListener("loadedmetadata", function () {
        if (saved.t < audio.duration) audio.currentTime = saved.t;
      }, { once: true });
    }
    // remember position so the track continues across page navigation
    setInterval(function () {
      if (audio && !audio.paused) saveState(true);
    }, 3000);
    return audio;
  }

  btn.addEventListener("click", function () {
    const a = ensureAudio();
    if (a.paused) {
      a.play().then(function () {
        setLabel(true);
        saveState(true);
      }).catch(function () {
        setLabel(false);
      });
    } else {
      a.pause();
      saveState(false);
      setLabel(false);
    }
  });

  // If the user had music on, try to resume; browsers usually allow this
  // once the user has interacted with the site, otherwise stay off.
  const saved = loadState();
  setLabel(false);
  if (saved.on) {
    const a = ensureAudio();
    a.play().then(function () { setLabel(true); }).catch(function () { setLabel(false); });
  }

  document.body.appendChild(btn);
})();
