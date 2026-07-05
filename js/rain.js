/* Matrix-style ascii rain background.
   Levels 0-3 (off / light / medium / heavy), default 2, cycled by the
   [rain:n] button and persisted in localStorage. Canvas sits behind all
   content (z-index -1) and ignores pointer events. */
(function () {
  const KEY = "site-rain-level";
  const GLYPHS = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789<>/{}[];=+*#$_|~";
  const FONT_SIZE = 14;
  const LEVELS = [
    null,
    { colFrac: 0.20, speedMin: 50,  speedMax: 110, headAlpha: 0.35, fade: 0.07 },
    { colFrac: 0.45, speedMin: 70,  speedMax: 160, headAlpha: 0.50, fade: 0.06 },
    { colFrac: 0.85, speedMin: 110, speedMax: 240, headAlpha: 0.65, fade: 0.05 },
  ];

  let level = 2;
  try {
    const saved = parseInt(localStorage.getItem(KEY), 10);
    if (saved >= 0 && saved <= 3) level = saved;
  } catch (e) {}

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    zIndex: "-1",
    pointerEvents: "none",
  });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  let cols = [];
  let W = 0, H = 0;

  function setup() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, W, H);
    cols = [];
    const cfg = LEVELS[level];
    if (!cfg) return;
    const total = Math.max(1, Math.floor(W / FONT_SIZE));
    const active = Math.max(1, Math.floor(total * cfg.colFrac));
    const indices = Array.from({ length: total }, function (_, i) { return i; });
    for (let i = 0; i < active && indices.length; i++) {
      const idx = indices.splice(Math.floor(Math.random() * indices.length), 1)[0];
      cols.push({
        x: idx * FONT_SIZE,
        y: Math.random() * H,
        speed: cfg.speedMin + Math.random() * (cfg.speedMax - cfg.speedMin),
      });
    }
  }

  let last = 0;
  function tick(now) {
    requestAnimationFrame(tick);
    if (now - last < 33) return; // ~30 fps is plenty for rain
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    const cfg = LEVELS[level];
    if (!cfg) return;

    // fade previous frame toward transparent to leave trails
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0," + cfg.fade + ")";
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "source-over";

    ctx.font = FONT_SIZE + "px monospace";
    for (const c of cols) {
      c.y += c.speed * dt;
      if (c.y > H + FONT_SIZE * 2) {
        c.y = -FONT_SIZE;
        c.speed = cfg.speedMin + Math.random() * (cfg.speedMax - cfg.speedMin);
      }
      const ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      ctx.fillStyle = "rgba(110,232,93," + cfg.headAlpha + ")";
      ctx.fillText(ch, c.x, c.y);
    }
  }

  // [rain:n] control, bottom-left
  const btn = document.createElement("button");
  btn.id = "rain-toggle";
  btn.type = "button";
  btn.title = "ascii rain intensity (0 = off)";
  Object.assign(btn.style, {
    position: "fixed",
    left: "14px",
    bottom: "12px",
    zIndex: "7",
    background: "var(--bg-panel, #0e1511)",
    border: "1px solid var(--border-bright, #2e4534)",
    borderRadius: "6px",
    fontFamily: "inherit",
    fontSize: "12px",
    padding: "4px 10px",
    cursor: "pointer",
  });
  function label() {
    btn.textContent = "[rain:" + level + "]";
    btn.style.color = level ? "var(--accent, #6ee85d)" : "var(--text-dim, #7d8f82)";
  }
  btn.addEventListener("click", function () {
    level = (level + 1) % LEVELS.length;
    try { localStorage.setItem(KEY, level); } catch (e) {}
    setup();
    label();
  });
  document.body.appendChild(btn);

  window.addEventListener("resize", setup);

  label();
  setup();
  requestAnimationFrame(tick);
})();
