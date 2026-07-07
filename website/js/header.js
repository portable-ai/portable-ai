// Fixed top header: mobile menu toggle.
// Self-contained so both index.html and learn.html can share it without pulling
// in the editor-specific app.js. On small screens the hamburger toggles the nav
// panel open/closed; on wide screens the nav is always visible and this is inert.
(function () {
  const toggle = document.querySelector("#nav-toggle");
  const nav = document.querySelector("#site-nav");
  if (!toggle || !nav) return;

  function setOpen(open) {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("site-nav--open", open);
  }

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  // Close the menu after following a link.
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });

  // Close on Escape.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
})();

// Footer version + build-date stamp.
// Reads the single source of truth in version.js and fills the footer. If that
// script or the elements are missing, the static fallback text in the HTML
// remains, so the footer degrades gracefully with no JS. Runs after DOM ready
// so it works regardless of where these scripts sit relative to the footer.
function stampFooter() {
  const info = window.PORTABLE_AI_VERSION;
  if (!info) return;

  const versionEl = document.querySelector("#footer-version");
  if (versionEl && info.version) {
    versionEl.textContent = info.version;
  }

  const buildEl = document.querySelector("#footer-build");
  if (buildEl && info.buildDate) {
    // Render as a machine-readable <time> with a human-friendly label.
    const d = new Date(info.buildDate + "T00:00:00Z");
    const label = Number.isNaN(d.getTime())
      ? info.buildDate
      : d.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        });
    buildEl.setAttribute("datetime", info.buildDate);
    buildEl.textContent = "Updated " + label;
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", stampFooter);
} else {
  stampFooter();
}
