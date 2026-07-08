// Single source of truth for the site's displayed version and release date.
// Bump both together at release time (e.g. when promoting an RC or cutting
// v0.3.0) so the footer always shows the release the visitor is looking at.
// header.js reads these to stamp the footer on every page.
window.PORTABLE_AI_VERSION = {
  // Matches the current git tag on main.
  version: "v0.3.0",
  // ISO date (YYYY-MM-DD) the current version was released.
  releaseDate: "2026-07-07",
};
