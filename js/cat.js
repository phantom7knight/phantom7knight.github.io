/* Easter egg: a semicolon cat that wanders around the page.
   Click it and it meows, then bolts. Sits still for reduced-motion users. */
(function () {
  const FRAME_A = [
    "   ;;      ;;",
    "  ;;;;    ;;;;",
    "  ;;;;;;;;;;;;",
    " ;;  *    *  ;;",
    " ;;    ;;    ;;",
    "  ;;;      ;;;        ;;",
    "   ;;;;;;;;;;;;;;;;  ;;",
    "   ;;;;;;;;;;;;;;;;;;;",
    "   ;;  ;;    ;;  ;;",
    "  ;;;  ;;   ;;;  ;;",
  ].join("\n");

  const FRAME_B = [
    "   ;;      ;;",
    "  ;;;;    ;;;;",
    "  ;;;;;;;;;;;;",
    " ;;  *    *  ;;",
    " ;;    ;;    ;;",
    "  ;;;      ;;;     ;;",
    "   ;;;;;;;;;;;;;;;; ;;",
    "   ;;;;;;;;;;;;;;;;;;",
    "   ;; ;;      ;; ;;",
    "   ;; ;;;     ;; ;;;",
  ].join("\n");

  const SPEED = 45;          // px per second
  const IDLE_MIN = 2500;     // ms between strolls
  const IDLE_RANGE = 5000;
  const START_DELAY = 4000;

  const cat = document.createElement("div");
  cat.id = "ascii-cat";
  cat.setAttribute("aria-hidden", "true");
  cat.title = ";";
  const pre = document.createElement("pre");
  pre.textContent = FRAME_A;
  cat.appendChild(pre);

  Object.assign(cat.style, {
    position: "fixed",
    left: "0",
    top: "0",
    zIndex: "5",
    cursor: "pointer",
    userSelect: "none",
    willChange: "transform",
  });
  Object.assign(pre.style, {
    margin: "0",
    fontFamily: "inherit",
    fontSize: "7px",
    lineHeight: "1.1",
    color: "var(--accent, #6ee85d)",
    textShadow: "0 0 6px rgba(110,232,93,0.35)",
    transition: "transform 0.2s",
  });

  document.body.appendChild(cat);

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let x = window.innerWidth - 140;
  let y = window.innerHeight - 110;
  let walkTimer = null;
  let frameTimer = null;

  function place(nx, ny, durationMs) {
    cat.style.transition = durationMs ? "transform " + durationMs + "ms linear" : "none";
    cat.style.transform = "translate3d(" + nx + "px," + ny + "px,0)";
  }

  function startFrames() {
    stopFrames();
    let flip = false;
    frameTimer = setInterval(function () {
      flip = !flip;
      pre.textContent = flip ? FRAME_B : FRAME_A;
    }, 350);
  }

  function stopFrames() {
    if (frameTimer) { clearInterval(frameTimer); frameTimer = null; }
    pre.textContent = FRAME_A;
  }

  function stroll() {
    const w = cat.offsetWidth || 120;
    const h = cat.offsetHeight || 90;
    const maxX = Math.max(0, window.innerWidth - w - 10);
    const maxY = Math.max(60, window.innerHeight - h - 10);
    const nx = Math.random() * maxX;
    const ny = 60 + Math.random() * (maxY - 60);
    const dist = Math.hypot(nx - x, ny - y);
    const dur = (dist / SPEED) * 1000;

    // face the direction of travel
    pre.style.transform = nx < x ? "scaleX(1)" : "scaleX(-1)";

    startFrames();
    place(nx, ny, dur);
    x = nx; y = ny;

    walkTimer = setTimeout(function () {
      stopFrames();
      walkTimer = setTimeout(stroll, IDLE_MIN + Math.random() * IDLE_RANGE);
    }, dur);
  }

  function meow() {
    const bubble = document.createElement("div");
    bubble.textContent = "meow~";
    Object.assign(bubble.style, {
      position: "fixed",
      zIndex: "6",
      transform: "translate3d(" + (x + 20) + "px," + (y - 24) + "px,0)",
      color: "var(--accent, #6ee85d)",
      background: "rgba(14,21,17,0.95)",
      border: "1px solid var(--border-bright, #2e4534)",
      borderRadius: "6px",
      padding: "2px 10px",
      fontFamily: "inherit",
      fontSize: "12px",
      pointerEvents: "none",
    });
    document.body.appendChild(bubble);
    setTimeout(function () { bubble.remove(); }, 1200);

    if (reducedMotion) return;
    // startled: bolt somewhere else immediately
    if (walkTimer) { clearTimeout(walkTimer); walkTimer = null; }
    const nx = Math.random() * Math.max(0, window.innerWidth - 140);
    const ny = 60 + Math.random() * Math.max(60, window.innerHeight - 200);
    const dur = (Math.hypot(nx - x, ny - y) / (SPEED * 4)) * 1000;
    pre.style.transform = nx < x ? "scaleX(1)" : "scaleX(-1)";
    startFrames();
    place(nx, ny, dur);
    x = nx; y = ny;
    walkTimer = setTimeout(function () {
      stopFrames();
      walkTimer = setTimeout(stroll, IDLE_MIN + Math.random() * IDLE_RANGE);
    }, dur);
  }

  cat.addEventListener("click", meow);

  place(x, y, 0);

  if (!reducedMotion) {
    setTimeout(stroll, START_DELAY);
  }

  window.addEventListener("resize", function () {
    x = Math.min(x, Math.max(0, window.innerWidth - 140));
    y = Math.min(y, Math.max(60, window.innerHeight - 110));
    place(x, y, 0);
  });
})();
