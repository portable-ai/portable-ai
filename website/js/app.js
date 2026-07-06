const STORAGE_KEY = "portableAiPersonaDraft";

// Static browser-only copy of templates/portable-ai-persona-template.md.
// Embedded here so the GitHub Pages editor can create a new document without
// depending on fetch paths that may vary by deployment location.
const portableAiPersonaTemplate = `---
standard: PortableAI Persona
standard_version: 0.3
profile_name: My PortableAI Profile
profile_version: 1.0.0
last_updated: YYYY-MM-DD
---

# Profile

Briefly describe who you are and the durable context you want AI systems to know. The bullets below are placeholder examples — replace them with your own or delete lines you don't need.

## Identity

- e.g. Product manager based in Philadelphia
- e.g. Parent of two, comfortable with weekend engineering work

## Roles

- e.g. Head of Product at a health-tech startup
- e.g. Volunteer mentor at a local coding bootcamp

## Long-Term Goals

- e.g. Ship a stable v1 of my company's platform this year
- e.g. Learn conversational Spanish over the next two years

---

# Preferences

Describe stable preferences that should shape AI assistance.

## General Preferences

- e.g. Prefer concise answers with the recommendation up front
- e.g. Skip emoji and marketing language

## Product Preferences

- e.g. Ubuntu on my laptops, iOS on phone
- e.g. Neovim as primary editor; VS Code for pair-programming

## Recommendation Preferences

- e.g. Suggest open-source tools before commercial ones when quality is similar
- e.g. Weight long-term maintenance cost over initial ease

---

# Persona

Describe your personality, working style, and how you tend to think.

- e.g. Direct communicator; comfortable with pushback
- e.g. Thinks in systems and second-order effects
- e.g. Prefers writing over meetings for durable decisions

---

# Projects

List active, planned, inactive, or completed projects that are durable enough to belong in the context.

## Active Projects

- e.g. PortableAI open standard — reference editor and spec
- e.g. Home irrigation controller — Raspberry Pi + soil sensors

## Planned Projects

- e.g. Migrate personal notes from Evernote to plain Markdown

## Inactive Projects

- e.g. Weekly newsletter about neighborhood urbanism — paused Q1

## Completed Projects

- e.g. Kitchen renovation, finished last spring

---

# Interests

List durable interests, hobbies, and topics.

- e.g. Distributed systems and consensus protocols
- e.g. Urban planning and public transit
- e.g. Trail running

---

# Knowledge & Expertise

List areas where you have meaningful background knowledge or expertise.

- e.g. B2B SaaS product strategy — 10+ years
- e.g. Basic electrical wiring and home renovation
- e.g. Postgres performance tuning

---

# Decision Style

Describe how you make decisions.

- e.g. Prefer reversible decisions made fast; slow down for one-way doors
- e.g. Write short memos before big choices
- e.g. Trust data over anecdote, but weight lived experience of the people closest to the work

---

# Communication Style

Describe how AI systems should communicate with you.

- e.g. Lead with the answer; put reasoning after
- e.g. Ask a clarifying question if the request is genuinely ambiguous
- e.g. Flag when you're uncertain rather than hedging every sentence

---

# AI Collaboration Instructions

Describe how AI systems should work with you.

- e.g. Treat me as a peer collaborator, not a customer
- e.g. Push back when you disagree — say why
- e.g. Don't invent facts; say when you don't know

---

# Notes

Freeform notes that don't fit elsewhere.

- e.g. Prefers Fahrenheit for weather, Celsius for cooking
- e.g. Allergic to sulfa antibiotics
`;

// The editor state is intentionally just Markdown text. The Markdown document
// is the only canonical source; the Read-mode preview and any future
// AI-specific exports must be generated from this text rather than stored as
// separate primary artifacts.
const editor = document.querySelector("#persona-editor");
const preview = document.querySelector("#persona-preview");
const metadataCard = document.querySelector("#persona-metadata");
const status = document.querySelector("#save-status");
const copyButton = document.querySelector("#copy-markdown");
const downloadButton = document.querySelector("#download-markdown");
const clearButton = document.querySelector("#clear-draft");
// The in-app AI-draft flow was removed in favor of the dedicated
// "Generate a profile" page (generate-a-profile.html). The empty-state link to
// that page is all that remains in the editor.

const emptyState = document.querySelector("#empty-state");
const editorSurface = document.querySelector("#editor-surface");
const loadSampleButton = document.querySelector("#load-sample");
const openProfileButton = document.querySelector("#open-profile");
// The empty-state secondary card links straight to generate-a-profile.html; no JS.

const restoreBanner = document.querySelector("#restore-banner");
const restoreDraftButton = document.querySelector("#restore-draft");
const discardDraftButton = document.querySelector("#discard-draft");

const modeEditButton = document.querySelector("#mode-edit");
const modeReadButton = document.querySelector("#mode-read");
const panelEdit = document.querySelector("#panel-edit");
const panelRead = document.querySelector("#panel-read");
const modeButtons = [modeEditButton, modeReadButton];

// Hidden file input, created programmatically so the HTML stays clean.
const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.id = "markdown-file";
fileInput.accept = ".md,.markdown,text/markdown,text/plain";
fileInput.style.display = "none";
document.body.appendChild(fileInput);

// Markdown preview rendering.
//
// We use vendored marked.js (see website/js/vendor/marked.min.js) so the
// preview supports the full GitHub-Flavored Markdown grammar without a build
// step or CDN. This aligns with ADR-0001 (canonical Markdown) and ADR-0004
// (no login / no build reference editor).
//
// Security: PortableAI documents are Markdown-first. Raw HTML in a document
// is out of scope for the spec, so the preview escapes any raw HTML block
// or inline HTML rather than rendering it. This prevents XSS when a user
// loads a Markdown file from an untrusted source.

const escapeHtml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const configureMarked = () => {
  if (!window.marked || typeof window.marked.Marked !== "function") {
    return null;
  }

  const escapingRenderer = {
    html({ text }) {
      return escapeHtml(text);
    },
  };

  const instance = new window.marked.Marked({
    gfm: true,
    breaks: false,
    pedantic: false,
    renderer: escapingRenderer,
  });

  return instance;
};

const markedInstance = configureMarked();

const renderMarkdown = (markdown) => {
  if (!markedInstance) {
    // Fallback: if marked failed to load, show escaped source so the user
    // still sees their content rather than a broken preview.
    return `<pre>${escapeHtml(markdown)}</pre>`;
  }
  return markedInstance.parse(markdown);
};

const setStatus = (message) => {
  status.textContent = message;
};

// Guarded localStorage access. Browsers throw SecurityError when the page is
// opened from an opaque origin (e.g. a bare `file://` URL in some browsers)
// or when storage is disabled by policy. Per ADR-0004 the editor must work
// with no login and no server, so a storage failure is non-fatal — the user
// simply loses the auto-save-on-refresh convenience.
const safeLocalStorage = {
  get(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

const hasEditorContent = () => editor.value.trim().length > 0;

// Show/hide the empty state vs editor surface based on whether the editor
// currently has any content. Also toggles action buttons in the header/footer
// so the empty state stays uncluttered.
const updateSurfaceVisibility = () => {
  const hasContent = hasEditorContent();
  if (emptyState) emptyState.hidden = hasContent;
  if (editorSurface) editorSurface.hidden = !hasContent;
  if (downloadButton) downloadButton.hidden = !hasContent;
  if (copyButton) copyButton.hidden = !hasContent;
  if (clearButton) clearButton.hidden = !hasContent;
};

const saveDraft = () => {
  const ok = safeLocalStorage.set(STORAGE_KEY, editor.value);
  if (!hasEditorContent()) {
    // Don't proclaim "Draft saved" over an empty editor — the empty state
    // is the story on the screen. Clear the status entirely.
    setStatus("");
    return;
  }
  setStatus(
    ok
      ? "Draft saved locally in this browser."
      : "Editing locally. Browser storage is unavailable, so this draft will not persist across refreshes.",
  );
};

// updatePreview is the public entry point used by early callers
// (setEditorValue, the restore-from-localStorage path). It defers to
// renderPreview once that is defined further down. Using a `var` binding
// avoids the temporal-dead-zone hazard of referencing a `const` before
// initialization.
// eslint-disable-next-line no-var
var renderPreview;
const updatePreview = () => {
  if (typeof renderPreview === "function") {
    renderPreview();
  } else {
    preview.innerHTML = renderMarkdown(editor.value);
  }
};

const setEditorValue = (value) => {
  editor.value = value;
  saveDraft();
  updatePreview();
  updateSurfaceVisibility();
};

const loadSampleTemplate = () => {
  if (
    hasEditorContent() &&
    !window.confirm("Replace the current Markdown draft with a new PortableAI profile sample?")
  ) {
    setStatus("Kept the current draft.");
    return;
  }

  setEditorValue(portableAiPersonaTemplate);
  setStatus("Sample profile loaded. Edit the Markdown directly.");
};

// Compose the download filename: portableai-profile-YYYY-MM-DD.md.
// Locked in PR A — one predictable filename regardless of profile_name in
// front-matter, so profiles from different sessions line up on disk.
const buildDownloadFilename = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `portableai-profile-${yyyy}-${mm}-${dd}.md`;
};

const downloadMarkdown = () => {
  // Download the canonical Markdown document itself. Any future downloads for
  // prompts, JSON, or vendor-specific assistant formats must be derived from
  // editor.value at export time so Markdown remains the single source of truth.
  const blob = new Blob([editor.value], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = buildDownloadFilename();
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setStatus("Markdown downloaded. Your draft remains local to this browser.");
};

const copyTextToClipboard = async (text, fallbackField) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    if (fallbackField) {
      fallbackField.focus();
      fallbackField.select();
      document.execCommand("copy");
    }
  }
};

const copyMarkdown = async () => {
  await copyTextToClipboard(editor.value, editor);
  setStatus("Markdown copied to clipboard.");
};

const loadMarkdownFile = async (file) => {
  if (!file) {
    return;
  }

  if (
    hasEditorContent() &&
    !window.confirm("Replace the current Markdown draft with the selected file?")
  ) {
    fileInput.value = "";
    setStatus("Kept the current draft.");
    return;
  }

  try {
    const text = await file.text();
    setEditorValue(text);
    setStatus(`Loaded ${file.name} into the editor. Draft saved locally in this browser.`);
  } catch {
    setStatus("Could not load the selected Markdown file.");
  } finally {
    fileInput.value = "";
  }
};

// ---------------------------------------------------------------------------
// Restore-or-clear banner
//
// On page load, if a draft exists in localStorage we show a banner instead of
// silently restoring. This makes it obvious there's prior state and gives the
// user a one-click path to clear it. If they Restore, we hydrate the editor
// and switch to the editor surface. If they Clear, we drop the storage key
// and stay on the empty state.
// ---------------------------------------------------------------------------

const pendingDraft = safeLocalStorage.get(STORAGE_KEY);
const hasPendingDraft =
  pendingDraft !== null && pendingDraft.trim().length > 0;

const applyRestoreBannerState = () => {
  if (!restoreBanner) return;
  if (hasPendingDraft && !hasEditorContent()) {
    restoreBanner.hidden = false;
  } else {
    restoreBanner.hidden = true;
  }
};

const restorePendingDraft = () => {
  if (pendingDraft !== null) {
    setEditorValue(pendingDraft);
    setStatus("Restored a local draft from this browser.");
  }
  if (restoreBanner) restoreBanner.hidden = true;
};

const discardPendingDraft = () => {
  safeLocalStorage.remove(STORAGE_KEY);
  if (restoreBanner) restoreBanner.hidden = true;
  setStatus("");
  updateSurfaceVisibility();
};

// ---------------------------------------------------------------------------
// Document model: parse Markdown into { frontMatter, body } so the Read-mode
// metadata card can render front-matter separately without leaking raw YAML.
// ---------------------------------------------------------------------------

const FRONT_MATTER_FIELDS = [
  { key: "standard", label: "Standard" },
  { key: "standard_version", label: "Standard version" },
  { key: "profile_name", label: "Profile name" },
  { key: "profile_version", label: "Profile version" },
  { key: "last_updated", label: "Last updated" },
];

const parseFrontMatter = (yaml) => {
  const entries = [];
  const lines = yaml.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line || line.trim().startsWith("#")) {
      continue;
    }
    const idx = line.indexOf(":");
    if (idx === -1) {
      continue;
    }
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    entries.push([key, value]);
  }
  return entries;
};

const FRONT_MATTER_RE = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/;

const splitFrontMatter = (source) => {
  const match = source.match(FRONT_MATTER_RE);
  if (!match) {
    return { frontMatterEntries: [], body: source };
  }
  return {
    frontMatterEntries: parseFrontMatter(match[1]),
    body: source.slice(match[0].length),
  };
};

const prettyFrontMatterLabel = (key) => {
  const known = FRONT_MATTER_FIELDS.find((f) => f.key === key);
  if (known) return known.label;
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const updateMetadataCard = () => {
  if (!metadataCard) return;
  const { frontMatterEntries } = splitFrontMatter(editor.value);
  if (!frontMatterEntries.length) {
    metadataCard.hidden = true;
    metadataCard.innerHTML = "";
    return;
  }
  const rows = frontMatterEntries
    .map(([k, v]) => `<dt>${escapeHtml(prettyFrontMatterLabel(k))}</dt><dd class="metadata-value">${escapeHtml(v)}</dd>`)
    .join("");
  metadataCard.innerHTML = `<h3>Document metadata</h3><dl>${rows}</dl>`;
  metadataCard.hidden = false;
};

renderPreview = () => {
  const { body } = splitFrontMatter(editor.value);
  preview.innerHTML = renderMarkdown(body);
  updateMetadataCard();
};

// ---------------------------------------------------------------------------
// Mode switching: Edit / Read
// ---------------------------------------------------------------------------

const activateMode = (modeId) => {
  for (const btn of modeButtons) {
    if (!btn) continue;
    const selected = btn.id === modeId;
    btn.setAttribute("aria-selected", String(selected));
    btn.tabIndex = selected ? 0 : -1;
  }
  if (panelEdit) panelEdit.hidden = modeId !== "mode-edit";
  if (panelRead) panelRead.hidden = modeId !== "mode-read";
  if (modeId === "mode-read") {
    renderPreview();
  }
};

for (const btn of modeButtons) {
  if (!btn) continue;
  btn.addEventListener("click", () => activateMode(btn.id));
  btn.addEventListener("keydown", (event) => {
    const idx = modeButtons.indexOf(btn);
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      const next = modeButtons[(idx + 1) % modeButtons.length];
      next.focus();
      activateMode(next.id);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      const prev = modeButtons[(idx - 1 + modeButtons.length) % modeButtons.length];
      prev.focus();
      activateMode(prev.id);
    } else if (event.key === "Home") {
      event.preventDefault();
      modeButtons[0].focus();
      activateMode(modeButtons[0].id);
    } else if (event.key === "End") {
      event.preventDefault();
      const last = modeButtons[modeButtons.length - 1];
      last.focus();
      activateMode(last.id);
    }
  });
}

// ---------------------------------------------------------------------------
// Wiring
// ---------------------------------------------------------------------------

editor.addEventListener("input", () => {
  saveDraft();
  updateSurfaceVisibility();
  // Read-mode preview refreshes lazily when the user switches modes; no need
  // to re-render on every keystroke while they're in Edit mode.
});

copyButton.addEventListener("click", copyMarkdown);
downloadButton.addEventListener("click", downloadMarkdown);
loadSampleButton.addEventListener("click", loadSampleTemplate);
openProfileButton.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => loadMarkdownFile(fileInput.files[0]));

// The empty-state secondary card and "Generate a profile" action are plain
// links to generate-a-profile.html; they need no JS wiring here.

if (restoreDraftButton) {
  restoreDraftButton.addEventListener("click", restorePendingDraft);
}
if (discardDraftButton) {
  discardDraftButton.addEventListener("click", discardPendingDraft);
}

clearButton.addEventListener("click", () => {
  if (
    hasEditorContent() &&
    !window.confirm("Clear the current Markdown draft from the editor and this browser?")
  ) {
    setStatus("Kept the current draft.");
    return;
  }

  editor.value = "";
  safeLocalStorage.remove(STORAGE_KEY);
  updatePreview();
  updateSurfaceVisibility();
  setStatus("");
});

// Initial paint.
updateSurfaceVisibility();
applyRestoreBannerState();
updatePreview();
