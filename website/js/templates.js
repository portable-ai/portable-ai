// Profile-type template registry.
//
// SINGLE SOURCE OF TRUTH for the "Load a template" flow in the reference editor.
//
// IMPORTANT: this file contains NO template body text. The template Markdown
// lives in the repo under templates/*.md and is the sole source of truth for
// wording and examples. app.js fetch()es the .md file at load time, so
// clarifying a template or adding an example is a pure content edit to the .md
// — it requires NO change to any JavaScript and NO release of the site code.
//
// This registry only maps, per profile type:
//   - key         the document_type (matches prompt.js and the specs)
//   - label       the human-readable name shown in the UI type picker
//   - file        the template's path, by convention templates/portable-ai-<type>-template.md
//
// Naming contract: document_type key <-> UI label <-> template filename are
// mechanically linked. Adding a new profile type = ship its templates/*.md file
// and add one entry here; nothing else in the editor hard-codes the type list.
// (This mirrors the pattern in prompt.js for the "Generate a profile" prompts.)
//
// Exposed as window.PORTABLE_AI_TEMPLATES. No build step, no modules — plain
// <script> include, matching the rest of the reference editor.

(function () {
  // Ordered map. First key is the default selected type.
  const TEMPLATES = {
    persona: {
      label: "Persona",
      documentType: "persona",
      file: "templates/portable-ai-persona-template.md",
    },
    "software-project": {
      label: "Software Project",
      documentType: "software-project",
      file: "templates/portable-ai-software-project-template.md",
    },
  };

  const DEFAULT_TYPE = Object.keys(TEMPLATES)[0];

  // Resolve a template's URL relative to the current page so the fetch works
  // regardless of where the site is deployed (project subpath, custom domain,
  // etc.). The editor is a browser tool used alongside cloud AIs, so it is
  // always served over http(s); loading a template from a bare file:// origin
  // is intentionally not supported (see app.js for the graceful message).
  function url(type) {
    const entry = TEMPLATES[type] || TEMPLATES[DEFAULT_TYPE];
    return new URL(entry.file, document.baseURI).href;
  }

  window.PORTABLE_AI_TEMPLATES = {
    map: TEMPLATES,
    defaultType: DEFAULT_TYPE,
    get(type) {
      return TEMPLATES[type] || TEMPLATES[DEFAULT_TYPE];
    },
    url,
    // Ordered [key, entry] pairs for building the picker.
    entries() {
      return Object.entries(TEMPLATES);
    },
  };
})();
