/* Theme cycler: dark (default) -> light-green -> light -> dark ...
   The actual attribute is set synchronously by the inline anti-flash
   snippet in <head>; this script only owns the button UI and click
   handling, reading whatever data-theme is already applied. */
(function () {
  const KEY = "site-theme";
  const THEMES = ["dark", "light-green", "light"];

  function current() {
    const t = document.documentElement.getAttribute("data-theme");
    return THEMES.includes(t) ? t : "dark";
  }

  function apply(theme) {
    if (theme === "dark") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", theme);
  }

  const btn = document.createElement("button");
  btn.id = "theme-toggle";
  btn.type = "button";
  btn.title = "cycle color theme (dark / light-green / light)";
  Object.assign(btn.style, {
    position: "fixed",
    left: "14px",
    bottom: "12px",
    zIndex: "7",
    background: "var(--bg-panel)",
    border: "1px solid var(--border-bright)",
    borderRadius: "6px",
    color: "var(--text-dim)",
    fontFamily: "inherit",
    fontSize: "12px",
    padding: "4px 10px",
    cursor: "pointer",
  });

  function label() {
    btn.textContent = "[theme:" + current() + "]";
  }

  btn.addEventListener("click", function () {
    const idx = THEMES.indexOf(current());
    const next = THEMES[(idx + 1) % THEMES.length];
    apply(next);
    try { localStorage.setItem(KEY, next); } catch (e) {}
    label();
  });

  label();
  document.body.appendChild(btn);
})();
