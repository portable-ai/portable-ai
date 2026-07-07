// Single source of truth for the site's displayed version and build date.
// Bump these at release time (e.g. when promoting an RC or cutting v0.3.0).
// header.js reads these to stamp the footer on every page.
window.PORTABLE_AI_VERSION = {
  // Matches the current git tag on main.
  version: "v0.3.0-rc.1",
  // ISO date (YYYY-MM-DD) the site was last built/deployed.
  buildDate: "2026-07-06",
};
