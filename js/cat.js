/* Easter egg: a tiny cat that trots around the whole page.
   Driven by requestAnimationFrame (not CSS transitions) so it moves even
   when the OS reduced-motion setting is on. Click it: meow + dash. */
(function () {
  const SIZE_PX = 20;
  const WALK_SPEED = 70;   // px per second
  const DASH_SPEED = 340;  // px per second when startled
  const IDLE_MIN = 1500;   // ms sitting between strolls
  const IDLE_RANGE = 4500;
  const START_DELAY = 2500;

  const cat = document.createElement("div");
  cat.id = "ascii-cat";
  cat.textContent = "🐈";
  cat.setAttribute("aria-hidden", "true");
  Object.assign(cat.style, {
    position: "fixed",
    left: "0",
    top: "0",
    zIndex: "5",
    fontSize: SIZE_PX + "px",
    lineHeight: "1",
    cursor: "pointer",
    userSelect: "none",
    willChange: "transform",
    filter: "drop-shadow(0 0 4px rgba(110,232,93,0.45))",
  });
  document.body.appendChild(cat);

  let x = window.innerWidth - 50;
  let y = window.innerHeight - 50;
  let tx = x, ty = y;
  let speed = WALK_SPEED;
  let idleUntil = performance.now() + START_DELAY;
  let last = performance.now();
  let bob = 0;
  let facing = 1; // 🐈 faces left by default; scaleX(-1) faces right

  function pickTarget() {
    tx = 15 + Math.random() * Math.max(30, window.innerWidth - 15 - SIZE_PX * 2 - 15);
    ty = 70 + Math.random() * Math.max(30, window.innerHeight - 70 - SIZE_PX * 2 - 15);
  }

  function render(offsetY) {
    cat.style.transform =
      "translate3d(" + x + "px," + (y + offsetY) + "px,0) scaleX(" + facing + ")";
    cat.dataset.x = Math.round(x);
    cat.dataset.y = Math.round(y);
  }

  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    const dx = tx - x;
    const dy = ty - y;
    const dist = Math.hypot(dx, dy);

    if (dist > 1) {
      // walking: step toward target with a little trot-bob
      const step = Math.min(dist, speed * dt);
      x += (dx / dist) * step;
      y += (dy / dist) * step;
      bob += dt * (speed > WALK_SPEED ? 30 : 16);
      facing = dx < 0 ? 1 : -1;
      render(Math.sin(bob) * 1.5);
    } else if (now >= idleUntil) {
      speed = WALK_SPEED;
      idleUntil = now + IDLE_MIN + Math.random() * IDLE_RANGE;
      pickTarget();
    } else {
      render(0); // sitting
    }

    requestAnimationFrame(tick);
  }

  function meow() {
    const bubble = document.createElement("div");
    bubble.textContent = "meow~";
    Object.assign(bubble.style, {
      position: "fixed",
      left: "0",
      top: "0",
      zIndex: "6",
      transform: "translate3d(" + (x - 8) + "px," + (y - 26) + "px,0)",
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

    // startled: dash somewhere else right now
    speed = DASH_SPEED;
    idleUntil = 0;
    pickTarget();
  }

  cat.addEventListener("click", meow);

  render(0);
  requestAnimationFrame(function (now) { last = now; tick(now); });

  window.addEventListener("resize", function () {
    x = Math.min(x, window.innerWidth - SIZE_PX * 2);
    y = Math.min(y, window.innerHeight - SIZE_PX * 2);
    tx = Math.min(tx, window.innerWidth - SIZE_PX * 2);
    ty = Math.min(ty, window.innerHeight - SIZE_PX * 2);
    render(0);
  });
})();
