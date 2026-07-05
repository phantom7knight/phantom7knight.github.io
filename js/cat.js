/* Easter egg: oneko, the classic pixel cat (sprite: CC0, github.com/adryd325/oneko.js).
   Behavior:
   - wanders the page and rests with real idle animations (licking, yawning, sleeping)
   - click the cat: it meows and starts following your cursor
   - click it again: it stops and goes back to wandering
   - if you keep the cursor moving and it chases too long without catching you,
     it gets tired, gives up ("zzz…") and takes a nap */
(function () {
  const SPRITE_URL = "/assets/img/oneko.gif";
  const WALK_SPEED = 10;   // px per 100ms tick while wandering
  const CHASE_SPEED = 13;  // a touch faster when it's after your cursor
  const REST_MIN_TICKS = 50;
  const REST_RANGE_TICKS = 250;
  const CATCH_DIST = 44;      // "caught you" radius while following
  const EXHAUST_TICKS = 110;  // ~11s of continuous chasing -> nap
  const NAP_REST_TICKS = 250; // how long it stays put after giving up

  const spriteSets = {
    idle: [[-3, -3]],
    alert: [[-7, -3]],
    scratchSelf: [[-5, 0], [-6, 0], [-7, 0]],
    scratchWallN: [[0, 0], [0, -1]],
    scratchWallS: [[-7, -1], [-6, -2]],
    scratchWallE: [[-2, -2], [-2, -3]],
    scratchWallW: [[-4, 0], [-4, -1]],
    tired: [[-3, -2]],
    sleeping: [[-2, 0], [-2, -1]],
    N: [[-1, -2], [-1, -3]],
    NE: [[0, -2], [0, -3]],
    E: [[-3, 0], [-3, -1]],
    SE: [[-5, -1], [-5, -2]],
    S: [[-6, -3], [-7, -2]],
    SW: [[-5, -3], [-6, -1]],
    W: [[-4, -2], [-4, -3]],
    NW: [[-1, 0], [-1, -1]],
  };

  const el = document.createElement("div");
  el.id = "ascii-cat";
  el.setAttribute("aria-hidden", "true");
  Object.assign(el.style, {
    width: "32px",
    height: "32px",
    position: "fixed",
    left: "0",
    top: "0",
    zIndex: "5",
    cursor: "pointer",
    imageRendering: "pixelated",
    backgroundImage: "url(" + SPRITE_URL + ")",
    // tint the white/gray sprite toward the site's terminal green
    filter: "sepia(1) saturate(6) hue-rotate(55deg) brightness(0.88) drop-shadow(0 0 3px rgba(110,232,93,0.35))",
  });
  document.body.appendChild(el);

  let posX = window.innerWidth - 48;
  let posY = window.innerHeight - 48;
  let targetX = posX;
  let targetY = posY;
  let frameCount = 0;
  let idleTime = 0;
  let idleAnimation = null;
  let idleAnimationFrame = 0;
  let restTicks = 25;

  let mouseX = null;
  let mouseY = null;
  let following = false;
  let chaseEffort = 0;

  document.addEventListener("mousemove", function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function clampX(v) { return Math.min(Math.max(16, v), window.innerWidth - 16); }
  function clampY(v) { return Math.min(Math.max(60, v), window.innerHeight - 16); }

  function pickTarget() {
    targetX = 32 + Math.random() * Math.max(32, window.innerWidth - 96);
    targetY = 80 + Math.random() * Math.max(32, window.innerHeight - 160);
  }

  function setSprite(name, frame) {
    const sprite = spriteSets[name][frame % spriteSets[name].length];
    el.style.backgroundPosition = sprite[0] * 32 + "px " + sprite[1] * 32 + "px";
  }

  function resetIdleAnimation() {
    idleAnimation = null;
    idleAnimationFrame = 0;
  }

  function idle() {
    idleTime += 1;

    if (idleTime > 10 && Math.floor(Math.random() * 150) === 0 && idleAnimation == null) {
      const options = ["sleeping", "scratchSelf"];
      if (posX < 32) options.push("scratchWallW");
      if (posY < 32) options.push("scratchWallN");
      if (posX > window.innerWidth - 32) options.push("scratchWallE");
      if (posY > window.innerHeight - 32) options.push("scratchWallS");
      idleAnimation = options[Math.floor(Math.random() * options.length)];
    }

    switch (idleAnimation) {
      case "sleeping":
        if (idleAnimationFrame < 8) {
          setSprite("tired", 0);
          break;
        }
        setSprite("sleeping", Math.floor(idleAnimationFrame / 4));
        if (idleAnimationFrame > 192) resetIdleAnimation();
        break;
      case "scratchWallN":
      case "scratchWallS":
      case "scratchWallE":
      case "scratchWallW":
      case "scratchSelf":
        setSprite(idleAnimation, idleAnimationFrame);
        if (idleAnimationFrame > 9) resetIdleAnimation();
        break;
      default:
        setSprite("idle", 0);
        return;
    }
    idleAnimationFrame += 1;
  }

  function bubble(text) {
    const b = document.createElement("div");
    b.textContent = text;
    Object.assign(b.style, {
      position: "fixed",
      left: posX - 16 + "px",
      top: posY - 44 + "px",
      zIndex: "6",
      color: "var(--accent, #6ee85d)",
      background: "rgba(14,21,17,0.95)",
      border: "1px solid var(--border-bright, #2e4534)",
      borderRadius: "6px",
      padding: "2px 10px",
      fontFamily: "inherit",
      fontSize: "12px",
      pointerEvents: "none",
    });
    document.body.appendChild(b);
    setTimeout(function () { b.remove(); }, 1400);
  }

  function fallAsleep() {
    following = false;
    chaseEffort = 0;
    targetX = posX;
    targetY = posY;
    restTicks = NAP_REST_TICKS;
    idleTime = 20;
    idleAnimation = "sleeping";
    idleAnimationFrame = 0;
    bubble("zzz…");
  }

  function frame() {
    frameCount += 1;

    if (following && mouseX !== null) {
      targetX = clampX(mouseX);
      targetY = clampY(mouseY);
    }

    const diffX = posX - targetX;
    const diffY = posY - targetY;
    const distance = Math.sqrt(diffX * diffX + diffY * diffY);
    const speed = following ? CHASE_SPEED : WALK_SPEED;
    const arriveDist = following ? CATCH_DIST : Math.max(4, speed);

    if (distance < arriveDist) {
      if (following) {
        // caught up — sit near the cursor and catch its breath
        chaseEffort = Math.max(0, chaseEffort - 2);
        idle();
        return;
      }
      restTicks -= 1;
      if (restTicks <= 0) {
        restTicks = REST_MIN_TICKS + Math.random() * REST_RANGE_TICKS;
        pickTarget();
        return;
      }
      idle();
      return;
    }

    if (following) {
      chaseEffort += 1;
      if (chaseEffort > EXHAUST_TICKS) {
        fallAsleep();
        return;
      }
    }

    resetIdleAnimation();

    if (idleTime > 1) {
      setSprite("alert", 0);
      // pause a beat after being alerted before moving
      idleTime = Math.min(idleTime, 7);
      idleTime -= 1;
      return;
    }

    let direction = diffY / distance > 0.5 ? "N" : "";
    direction += diffY / distance < -0.5 ? "S" : "";
    direction += diffX / distance > 0.5 ? "W" : "";
    direction += diffX / distance < -0.5 ? "E" : "";
    setSprite(direction, frameCount);

    posX -= (diffX / distance) * speed;
    posY -= (diffY / distance) * speed;

    posX = Math.min(Math.max(16, posX), window.innerWidth - 16);
    posY = Math.min(Math.max(16, posY), window.innerHeight - 16);

    el.style.left = posX - 16 + "px";
    el.style.top = posY - 16 + "px";
    el.dataset.x = Math.round(posX);
    el.dataset.y = Math.round(posY);
  }

  el.addEventListener("click", function () {
    if (!following) {
      following = true;
      chaseEffort = 0;
      resetIdleAnimation();
      bubble("meow~");
    } else {
      following = false;
      targetX = posX;
      targetY = posY;
      restTicks = REST_MIN_TICKS + Math.random() * REST_RANGE_TICKS;
      bubble("meow.");
    }
  });

  el.style.left = posX - 16 + "px";
  el.style.top = posY - 16 + "px";
  setSprite("idle", 0);

  // 10 fps tick, gated on rAF like the original oneko
  let lastTick;
  function onAnimationFrame(timestamp) {
    if (!el.isConnected) return;
    if (!lastTick) lastTick = timestamp;
    if (timestamp - lastTick > 100) {
      lastTick = timestamp;
      frame();
    }
    requestAnimationFrame(onAnimationFrame);
  }
  requestAnimationFrame(onAnimationFrame);

  window.addEventListener("resize", function () {
    posX = Math.min(posX, window.innerWidth - 16);
    posY = Math.min(posY, window.innerHeight - 16);
    targetX = Math.min(targetX, window.innerWidth - 16);
    targetY = Math.min(targetY, window.innerHeight - 16);
  });
})();
