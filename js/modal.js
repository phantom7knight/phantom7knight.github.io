/* Intercepts clicks on links to individual project pages (/projects/xxx.html)
   anywhere on the site and opens that page's content in an in-page modal
   instead of navigating away. Click outside the modal (or Escape) closes it.
   Every modal also gets a "pop out" (⤢) button to load the real, standalone
   page when the user wants it — e.g. to bookmark, share, or reload directly. */
(function () {
  function isProjectDetailLink(a) {
    if (!a || !a.getAttribute("href") || a.target === "_blank") return false;
    if (a.hasAttribute("data-no-modal")) return false; // opt-out, for A/B comparison
    let path;
    try { path = new URL(a.href, location.href).pathname; } catch (e) { return false; }
    return /^\/projects\/[^/]+\.html$/.test(path);
  }

  let backdrop = null;
  let lastFocused = null;

  function onKeydown(e) {
    if (e.key === "Escape") closeModal();
  }

  function closeModal() {
    if (!backdrop) return;
    backdrop.remove();
    backdrop = null;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKeydown);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  async function openModal(url) {
    closeModal();
    lastFocused = document.activeElement;

    const expandBtn =
      '<a class="modal-expand" href="' + url + '" data-no-modal title="Open in its own page" aria-label="Open in its own page">⤢</a>';

    backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    backdrop.innerHTML =
      '<div class="modal-box" role="dialog" aria-modal="true">' +
      expandBtn +
      '<button class="modal-close" type="button" aria-label="Close">×</button>' +
      '<div class="modal-body"><p class="dim">loading…</p></div>' +
      "</div>";
    document.body.appendChild(backdrop);
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeydown);

    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop) closeModal();
    });
    backdrop.querySelector(".modal-close").addEventListener("click", closeModal);

    try {
      const res = await fetch(url);
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const main = doc.querySelector("main .container");
      const body = backdrop.querySelector(".modal-body");
      if (main) {
        // the modal's own close button replaces the inline back-arrow breadcrumb
        const pageTitle = main.querySelector(".page-title");
        if (pageTitle) pageTitle.remove();
        body.innerHTML = main.innerHTML;
      } else {
        body.innerHTML = "<p>Couldn't load this page.</p>";
      }
    } catch (e) {
      const body = backdrop.querySelector(".modal-body");
      if (body) body.innerHTML = "<p>Couldn't load this page.</p>";
    }
  }

  document.addEventListener("click", function (e) {
    const a = e.target.closest("a");
    if (isProjectDetailLink(a)) {
      e.preventDefault();
      openModal(a.href);
    }
  });
})();
