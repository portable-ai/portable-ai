const STORAGE_KEY = "portableAiPersonaDraft";

// Static browser-only copy of templates/portable-ai-persona-template.md.
// Embedded here so the GitHub Pages editor can create a new document without
// depending on fetch paths that may vary by deployment location.
const portableAiPersonaTemplate = `---
standard: PortableAI Persona
standard_version: 0.3
profile_name: My PortableAI Profile
profile_version: 1.0.0
last_updated: 2026-07-07
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
const addSectionButton = document.querySelector("#add-section");
// The app container whose data-mode drives Home vs Edit (#121).
const appMain = document.querySelector("main.page");
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

// The status gutter is always present and must never read empty (#122): an
// empty message falls back to the idle "Ready…" state.
const READY_STATUS = "Ready\u2026";
const setStatus = (message) => {
  status.textContent = message || READY_STATUS;
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
// Grow the Edit textarea to fit its content so it never scrolls internally —
// the whole page scrolls instead. This keeps Edit and Read in one coordinate
// space, which makes the teleport gutter (#83) simple and accurate. Called on
// input, on programmatic value changes, and when Edit mode becomes visible
// (a hidden textarea reports scrollHeight 0, so we must resize once shown).
const autoGrowEditor = () => {
  if (!editor) return;
  if (editor.offsetParent === null && !editor.clientHeight) return; // hidden
  editor.style.height = "auto";
  editor.style.height = `${editor.scrollHeight}px`;
};

const updateSurfaceVisibility = () => {
  const hasContent = hasEditorContent();
  if (emptyState) emptyState.hidden = hasContent;
  if (editorSurface) editorSurface.hidden = !hasContent;
  if (downloadButton) downloadButton.hidden = !hasContent;
  if (copyButton) copyButton.hidden = !hasContent;
  if (clearButton) clearButton.hidden = !hasContent;
  if (addSectionButton) addSectionButton.hidden = !hasContent;
  // Drive the Home vs Edit state (#121): content present => edit mode
  // (compact "Edit profile" title, action nav visible); empty => home mode
  // (value-prop hero, entry actions, no action nav).
  if (appMain) appMain.dataset.mode = hasContent ? "edit" : "home";
  autoGrowEditor();
  // Rebuild the teleport gutter for whatever just became visible (#83).
  if (typeof refreshGutters === "function") scheduleGutterRefresh();
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

// Detect and strip a PortableAI integrity block (Core Spec §7) from a loaded
// document. The block is an HTML comment that opens with `<!-- portable-ai:integrity`
// and, when present, is the last non-empty content in the document.
//
// This editor does not compute or verify hashes, so per Core Spec §10 it MUST
// NOT leave a stale integrity block in a document it has edited ("remove the
// block on save rather than leave a stale hash"). The block is derived content
// (ADR-0003), so dropping it loses nothing semantic — it will be recomputed by
// whatever tool produces a fresh export. Stripping on load also keeps every
// edit safe by construction: there is never a block in the working document to
// invalidate or to append past (e.g. via "Add section").
//
// We remove the trailing block and any whitespace between it and the preceding
// content, then restore a single trailing newline. Matching is anchored to the
// end of the document and is deliberately conservative: we only strip a block
// that is the last non-empty content, matching the spec's placement rule.
const INTEGRITY_BLOCK_AT_END = /\n*<!--\s*portable-ai:integrity[\s\S]*?-->\s*$/;
const stripIntegrityBlock = (value) => {
  if (!INTEGRITY_BLOCK_AT_END.test(value)) {
    return { text: value, stripped: false };
  }
  const text = value.replace(INTEGRITY_BLOCK_AT_END, "").replace(/\s+$/, "") + "\n";
  return { text, stripped: true };
};

// Sets the editor content for every load path (sample, file, restored draft).
// Strips any stale integrity block first (see above) and reports whether it did
// so, letting the caller surface a message. Returns { strippedIntegrity }.
const setEditorValue = (value) => {
  const { text, stripped } = stripIntegrityBlock(value);
  editor.value = text;
  saveDraft();
  updatePreview();
  updateSurfaceVisibility();
  return { strippedIntegrity: stripped };
};

const INTEGRITY_STRIPPED_NOTE =
  "Removed a stale integrity block \u2014 this editor doesn't recompute hashes, so it'll be regenerated when you next export from a tool that does.";

const loadSampleTemplate = () => {
  if (
    hasEditorContent() &&
    !window.confirm("Replace the current profile with a new sample profile?")
  ) {
    setStatus("Kept the current draft.");
    return;
  }

  setEditorValue(portableAiPersonaTemplate);
  setStatus("Sample profile loaded. Edit it directly.");
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
  setStatus("Profile downloaded. Your draft remains local to this browser.");
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

// Append a new, empty section to the end of the document and drop the cursor on
// the blank line beneath its heading, ready for typing (#23). Sections are H1
// (`#`) to match every shipped document and template. We always append to the
// end — predictable and position-agnostic — rather than guessing an insertion
// point from the cursor or nearby content. The heading text is plain
// "New section"; per ADR-0007 its key is just derived from whatever the author
// renames it to, so there is nothing else to wire up here.
const SECTION_HEADING_PLACEHOLDER = "New section";
const addSection = () => {
  // Make sure the editor surface is showing (an all-whitespace or empty editor
  // sits behind the empty state); adding a section is a create action.
  const base = editor.value.replace(/\s+$/, "");
  const heading = `# ${SECTION_HEADING_PLACEHOLDER}`;
  // One blank line between the previous content and the new heading, then a
  // blank line under the heading where the cursor lands. When the editor is
  // empty, skip the leading separator so we don't start the file with blanks.
  const prefix = base.length ? `${base}\n\n` : "";
  const nextValue = `${prefix}${heading}\n\n`;
  editor.value = nextValue;

  // Reveal the editor surface + action buttons and grow the textarea to fit.
  updateSurfaceVisibility();
  // Switch to Edit so the cursor is on a real, visible textarea.
  activateMode("mode-edit");
  autoGrowEditor();

  // Place the caret on the blank line beneath the new heading, ready for input.
  const caret = nextValue.length;
  editor.focus();
  editor.setSelectionRange(caret, caret);
  // Keep the freshly added section in view.
  if (typeof editor.scrollIntoView === "function") {
    editor.scrollIntoView({ block: "end", behavior: "auto" });
  }

  saveDraft();
  setStatus('New section added \u2014 type a heading name over "New section".');
};

const loadMarkdownFile = async (file) => {
  if (!file) {
    return;
  }

  if (
    hasEditorContent() &&
    !window.confirm("Replace the current profile with the selected profile document?")
  ) {
    fileInput.value = "";
    setStatus("Kept the current draft.");
    return;
  }

  try {
    const text = await file.text();
    const { strippedIntegrity } = setEditorValue(text);
    setStatus(
      strippedIntegrity
        ? `Loaded ${file.name}. ${INTEGRITY_STRIPPED_NOTE}`
        : `Loaded ${file.name} into the editor. Draft saved locally in this browser.`,
    );
  } catch {
    setStatus("Could not load the selected profile document.");
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
    const { strippedIntegrity } = setEditorValue(pendingDraft);
    setStatus(
      strippedIntegrity
        ? `Restored a local draft. ${INTEGRITY_STRIPPED_NOTE}`
        : "Restored a local draft from this browser.",
    );
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
    return { frontMatterEntries: [], body: source, frontMatterLineCount: 0 };
  }
  // Count the lines the front-matter block (and its closing fence) consumed so
  // the teleport gutter can map body block lines back to full-document lines.
  const frontMatterLineCount = (match[0].match(/\n/g) || []).length;
  return {
    frontMatterEntries: parseFrontMatter(match[1]),
    body: source.slice(match[0].length),
    frontMatterLineCount,
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

// Shared block map for the teleport gutter (#83). Each entry is one top-level
// Markdown block: its index (shared between Edit and Read), the source line it
// starts on (for the Edit-view textarea), and the count of source lines it
// spans. Recomputed whenever the document changes.
let blockMap = [];

const computeBlockMap = (body) => {
  blockMap = [];
  if (!markedInstance || typeof markedInstance.lexer !== "function") return;
  let tokens;
  try {
    tokens = markedInstance.lexer(body);
  } catch {
    return;
  }
  // Walk top-level tokens, tracking the char offset so we can map each block to
  // the source line it begins on. `space` tokens are blank-line gaps between
  // blocks and get no bar of their own.
  let charOffset = 0;
  let index = 0;
  for (const token of tokens) {
    if (token.type === "space") {
      charOffset += token.raw.length;
      continue;
    }
    const startLine = body.slice(0, charOffset).split("\n").length - 1;
    const lineSpan = Math.max(1, (token.raw.match(/\n/g) || []).length);
    blockMap.push({ index, startLine, lineSpan });
    charOffset += token.raw.length;
    index += 1;
  }
};

renderPreview = () => {
  const { body } = splitFrontMatter(editor.value);
  preview.innerHTML = renderMarkdown(body);
  // Tag each rendered top-level block with its shared block index so the Read
  // gutter can line a bar up with it (#83).
  computeBlockMap(body);
  const children = Array.from(preview.children);
  children.forEach((el, i) => {
    el.setAttribute("data-block-index", String(i));
  });
  updateMetadataCard();
};

// ---------------------------------------------------------------------------
// Teleport gutter (#83)
// A quiet left-margin affordance. Each top-level Markdown block gets an
// invisible, focusable bar in the margin; hovering lights it, and clicking (or
// Enter/Space) switches Edit<->Read and lands on the same block at roughly the
// same on-screen position. Clicking the text/preview body never toggles mode.
// ---------------------------------------------------------------------------

const gutterEdit = document.querySelector("#gutter-edit");
const gutterRead = document.querySelector("#gutter-read");

// Measure the pixel geometry of each block in the currently visible view so we
// can place a margin bar over it. Returns [{ index, top, height }] in the
// panel's coordinate space (matching the absolutely-positioned gutter).
const measureReadBlocks = () => {
  if (!panelRead || panelRead.hidden) return [];
  const panelBox = panelRead.getBoundingClientRect();
  const rects = [];
  for (const el of preview.querySelectorAll("[data-block-index]")) {
    const idx = Number(el.getAttribute("data-block-index"));
    const box = el.getBoundingClientRect();
    rects.push({ index: idx, top: box.top - panelBox.top, height: box.height });
  }
  return rects;
};

// A hidden "mirror" div that replicates the textarea's box, font, padding, and
// wrapping so we can measure exactly where each block starts and ends on screen
// — accurately, even when long lines wrap to several visual rows. Line-height
// math alone can't do this once text wraps. Created lazily.
let editMirror = null;
const syncMirrorStyle = () => {
  if (!editMirror) {
    editMirror = document.createElement("div");
    editMirror.setAttribute("aria-hidden", "true");
    // position:relative so child marker offsetTop is measured from the mirror's
    // own padding box — matching where the textarea's text content begins.
    editMirror.style.position = "absolute";
    editMirror.style.visibility = "hidden";
    editMirror.style.pointerEvents = "none";
    editMirror.style.top = "0";
    editMirror.style.left = "-99999px";
    editMirror.style.whiteSpace = "pre-wrap";
    editMirror.style.wordWrap = "break-word";
    editMirror.style.overflow = "hidden";
    document.body.appendChild(editMirror);
  }
  const cs = window.getComputedStyle(editor);
  for (const prop of [
    "boxSizing", "width", "paddingTop", "paddingRight", "paddingBottom",
    "paddingLeft", "borderTopWidth", "borderRightWidth", "borderBottomWidth",
    "borderLeftWidth", "fontFamily", "fontSize", "fontWeight", "lineHeight",
    "letterSpacing", "textTransform", "tabSize",
  ]) {
    editMirror.style[prop] = cs[prop];
  }
  editMirror.style.width = `${editor.clientWidth}px`;
};

// For the Edit view, measure each block's real pixel span via the mirror.
// The textarea is auto-height (autoGrowEditor) so it never scrolls internally
// and shows all content — every block gets a bar, no viewport clipping, no
// scrollTop math. Positions are panel-relative.
const measureEditBlocks = () => {
  if (!panelEdit || panelEdit.hidden) return [];
  // Edit mode never calls renderPreview, so refresh the shared block map first.
  computeBlockMap(splitFrontMatter(editor.value).body);
  if (!blockMap.length) return [];
  syncMirrorStyle();

  const { frontMatterLineCount } = splitFrontMatter(editor.value);
  const fmLines = frontMatterLineCount || 0;
  const docLines = editor.value.split("\n");

  // Rebuild the mirror as the FULL document text, verbatim, with zero-width
  // marker <span>s inserted at each block's start line (and one at the end).
  // Measuring markers by offsetTop avoids the inline-span wrap-boundary
  // inaccuracies that caused cumulative drift: the marker sits exactly on the
  // text row where the block begins, so its offsetTop is the block's true top.
  const markerLines = blockMap.map((b) => fmLines + b.startLine);
  const markerSet = new Map();
  markerLines.forEach((docLine, i) => markerSet.set(docLine, blockMap[i].index));

  let html = "";
  for (let ln = 0; ln < docLines.length; ln += 1) {
    if (markerSet.has(ln)) {
      html += `<span class="mk" data-block="${markerSet.get(ln)}"></span>`;
    }
    html += escapeHtml(docLines[ln]);
    if (ln < docLines.length - 1) html += "\n";
  }
  // Trailing marker so the last block gets a measurable bottom.
  html += `<span class="mk" data-block="__end__"></span>`;
  editMirror.innerHTML = html;

  const panelBox = panelEdit.getBoundingClientRect();
  const taBox = editor.getBoundingClientRect();
  // Marker offsetTop is measured from the mirror's border-box top, and the
  // mirror replicates the textarea's border+padding, so offsetTop already
  // includes them. Aligning the mirror's border-box top with the textarea's
  // border-box top in panel space is all that's needed (no scroll to subtract).
  const contentTop = taBox.top - panelBox.top;

  // Collect marker offsetTops (relative to the mirror's border box).
  const markers = Array.from(editMirror.querySelectorAll("span.mk"));
  const tops = new Map();
  let endTop = 0;
  for (const m of markers) {
    const key = m.getAttribute("data-block");
    if (key === "__end__") { endTop = m.offsetTop; continue; }
    tops.set(Number(key), m.offsetTop);
  }

  const rects = [];
  for (let i = 0; i < blockMap.length; i += 1) {
    const idx = blockMap[i].index;
    if (!tops.has(idx)) continue;
    const startWithin = tops.get(idx);
    const nextIdx = i + 1 < blockMap.length ? blockMap[i + 1].index : null;
    const endWithin = nextIdx !== null && tops.has(nextIdx)
      ? tops.get(nextIdx)
      : endTop;
    const top = contentTop + startWithin;
    const height = Math.max(0, endWithin - startWithin);
    if (height <= 1) continue;
    rects.push({ index: idx, top, height });
  }
  return rects;
};

// Build the bars for one gutter from a rect list. Each bar is a real <button>
// so it's keyboard-focusable and announces its purpose.
const buildGutter = (gutterEl, rects, targetModeId) => {
  if (!gutterEl) return;
  gutterEl.innerHTML = "";
  if (!rects.length) return;
  const destLabel = targetModeId === "mode-read" ? "Read" : "Edit";
  for (const r of rects) {
    if (r.height <= 0) continue;
    const bar = document.createElement("button");
    bar.type = "button";
    bar.className = "gutter-bar";
    bar.style.top = `${r.top}px`;
    bar.style.height = `${Math.max(2, r.height - 2)}px`;
    bar.setAttribute("data-block-index", String(r.index));
    bar.setAttribute("aria-label", `Jump to this section in ${destLabel} view`);
    bar.tabIndex = 0;
    const anchorFrom = (clientY) => {
      const box = bar.getBoundingClientRect();
      return typeof clientY === "number" ? clientY : box.top + box.height / 2;
    };
    bar.addEventListener("click", (event) => {
      event.preventDefault();
      activateMode(targetModeId, { blockIndex: r.index, anchorY: anchorFrom(event.clientY) });
    });
    gutterEl.appendChild(bar);
  }
};

// Rebuild whichever gutter belongs to the visible view. The Edit gutter
// teleports to Read; the Read gutter teleports to Edit.
const refreshGutters = () => {
  if (!editorSurface || editorSurface.hidden) return;
  if (panelEdit && !panelEdit.hidden) {
    buildGutter(gutterEdit, measureEditBlocks(), "mode-read");
    if (gutterRead) gutterRead.innerHTML = "";
  } else if (panelRead && !panelRead.hidden) {
    buildGutter(gutterRead, measureReadBlocks(), "mode-edit");
    if (gutterEdit) gutterEdit.innerHTML = "";
  }
};

// After switching modes, scroll the destination so the target block sits at
// roughly the same viewport Y the user clicked from.
const teleportToBlock = (modeId, blockIndex, anchorY) => {
  if (modeId === "mode-read") {
    const el = preview.querySelector(`[data-block-index="${blockIndex}"]`);
    if (!el) return;
    const box = el.getBoundingClientRect();
    const targetY = typeof anchorY === "number" ? anchorY : window.innerHeight * 0.3;
    window.scrollBy({ top: box.top - targetY, behavior: "auto" });
  } else {
    // Edit view: place the caret at the block's start line, then scroll the
    // PAGE so that block sits at roughly the same viewport Y the user clicked
    // from. The textarea is auto-height and never scrolls internally, so the
    // gutter bar's own position tells us exactly where the block is on screen.
    const b = blockMap[blockIndex];
    if (!b) return;
    const lines = editor.value.split("\n");
    // Account for stripped front matter: find the block's line within the full
    // document by matching the body offset back onto the textarea text.
    const { frontMatterLineCount } = splitFrontMatter(editor.value);
    const docLine = (frontMatterLineCount || 0) + b.startLine;
    const charIndex = lines.slice(0, docLine).join("\n").length + (docLine > 0 ? 1 : 0);
    editor.focus();
    try {
      editor.setSelectionRange(charIndex, charIndex);
    } catch {
      /* selection may fail if the element isn't focusable yet; non-fatal */
    }
    // Rebuild the gutter so the Edit bar for this block exists, then align it.
    refreshGutters();
    const bar = gutterEdit
      ? gutterEdit.querySelector(`.gutter-bar[data-block-index="${blockIndex}"]`)
      : null;
    const targetY = typeof anchorY === "number" ? anchorY : window.innerHeight * 0.3;
    if (bar) {
      const box = bar.getBoundingClientRect();
      window.scrollBy({ top: box.top - targetY, behavior: "auto" });
    }
  }
};

// Reposition bars on scroll/resize (positions are relative to the panel).
let gutterRaf = 0;
const scheduleGutterRefresh = () => {
  if (gutterRaf) return;
  gutterRaf = window.requestAnimationFrame(() => {
    gutterRaf = 0;
    refreshGutters();
  });
};
window.addEventListener("scroll", scheduleGutterRefresh, { passive: true });
window.addEventListener("resize", scheduleGutterRefresh);
if (editor) editor.addEventListener("scroll", scheduleGutterRefresh, { passive: true });

// ---------------------------------------------------------------------------
// Mode switching: Edit / Read
// ---------------------------------------------------------------------------

// activateMode switches the visible panel. `teleport`, when provided, carries a
// block index and the viewport Y the user clicked from, so the destination view
// can scroll the same block to roughly the same on-screen position (#83).
const activateMode = (modeId, teleport = null) => {
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
  // Rebuild both gutters for the newly visible layout, then teleport if asked.
  refreshGutters();
  if (teleport && typeof teleport.blockIndex === "number") {
    teleportToBlock(modeId, teleport.blockIndex, teleport.anchorY);
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
  autoGrowEditor();
  updateSurfaceVisibility();
  // Read-mode preview refreshes lazily when the user switches modes; no need
  // to re-render on every keystroke while they're in Edit mode.
});

copyButton.addEventListener("click", copyMarkdown);
downloadButton.addEventListener("click", downloadMarkdown);
if (addSectionButton) addSectionButton.addEventListener("click", addSection);
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
    !window.confirm(
      "Clear the current profile draft from the editor and this browser? " +
        "Useful on a shared computer. This can't be undone \u2014 download first if you want to keep it."
    )
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
