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
