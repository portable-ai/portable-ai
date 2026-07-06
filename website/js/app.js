const STORAGE_KEY = "portableAiPersonaDraft";

const contextExportPrompt = `Please summarize and export the durable context you know about me as a PortableAI Document in Markdown.

Focus only on information that is likely to remain useful across future AI conversations, such as:

- Stable preferences
- Communication style
- Working style
- Long-term goals
- Durable projects
- Ongoing responsibilities
- Areas of expertise
- Recurring constraints
- Important context I would want another AI assistant to know

Do not include sensitive personal details unless I have clearly treated them as useful long-term context. Do not include temporary details, one-off tasks, private speculation, or anything you are uncertain about.

Use clear Markdown headings and concise bullet points. Keep the result human-readable and easy for me to edit.

Structure the output so I can paste it into a PortableAI Persona document. If a section has no useful durable information, omit it rather than inventing content.`;

// Static browser-only copy of templates/portable-ai-persona-template.md.
// Embedded here so the GitHub Pages editor can create a new document without
// depending on fetch paths that may vary by deployment location.
const portableAiPersonaTemplate = `---
standard: PortableAI Persona
standard_version: 0.3
profile_name: My PortableAI Persona
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
// is the only canonical source; previews, the Form tab, and any future
// AI-specific exports must be generated from this text rather than stored as
// separate primary artifacts.
const editor = document.querySelector("#persona-editor");
const preview = document.querySelector("#persona-preview");
const formFields = document.querySelector("#form-fields");
const metadataCard = document.querySelector("#persona-metadata");
const tabButtons = Array.from(document.querySelectorAll(".tab[role='tab']"));
const tabPanels = Array.from(document.querySelectorAll(".tab-panel"));
const status = document.querySelector("#save-status");
const copyButton = document.querySelector("#copy-markdown");
const downloadButton = document.querySelector("#download-markdown");
const clearButton = document.querySelector("#clear-draft");
const newFromTemplateButton = document.querySelector("#new-from-template");
const editorToolbar = document.querySelector(".editor-toolbar");
const openContextOverlayButton = document.querySelector("#open-context-overlay");
const contextOverlay = document.querySelector("#context-overlay");
const closeContextOverlayButton = document.querySelector("#close-context-overlay");
const contextOverlayStatus = document.querySelector("#context-overlay-status");
const contextExportPromptField = document.querySelector("#context-export-prompt");
const copyContextPromptButton = document.querySelector("#copy-context-prompt");
const contextOverlayCloseTargets = document.querySelectorAll("[data-close-context-overlay]");
let lastFocusedElement = null;

const githubLink = document.querySelector("a[href='https://github.com/PortableAI/portable-ai']");
if (githubLink) {
  githubLink.href = "https://github.com/refineryllc/portable-ai-working";
}

const importButton = document.createElement("button");
importButton.className = "button secondary";
importButton.type = "button";
importButton.id = "import-markdown";
importButton.textContent = "Load Markdown";

const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.id = "markdown-file";
fileInput.accept = ".md,.markdown,text/markdown,text/plain";
fileInput.style.display = "none";

if (editorToolbar) {
  editorToolbar.appendChild(importButton);
  editorToolbar.appendChild(fileInput);
}

if (contextExportPromptField) {
  contextExportPromptField.value = contextExportPrompt;
}

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

const setContextOverlayStatus = (message) => {
  contextOverlayStatus.textContent = message;
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

const saveDraft = () => {
  const ok = safeLocalStorage.set(STORAGE_KEY, editor.value);
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
    // Fallback for the brief window before renderPreview is assigned; still
    // safe because renderMarkdown escapes raw HTML.
    preview.innerHTML = renderMarkdown(editor.value);
  }
};

const setEditorValue = (value) => {
  editor.value = value;
  saveDraft();
  updatePreview();
  // renderForm is defined later in the file; guard with typeof so calls
  // during module-init order don't throw.
  if (typeof renderForm === "function") {
    renderForm();
  }
};

const hasEditorContent = () => editor.value.trim().length > 0;

const createNewFromTemplate = () => {
  if (
    hasEditorContent() &&
    !window.confirm("Replace the current Markdown draft with a new PortableAI Persona template?")
  ) {
    setStatus("Kept the current draft.");
    return;
  }

  setEditorValue(portableAiPersonaTemplate);
  setStatus("New PortableAI Persona template loaded. Edit the Markdown directly.");
};

const downloadMarkdown = () => {
  // Download the canonical Markdown document itself. Any future downloads for
  // prompts, JSON, or vendor-specific assistant formats must be derived from
  // editor.value at export time so Markdown remains the single source of truth.
  const blob = new Blob([editor.value], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "portable-ai-persona.md";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setStatus("Markdown downloaded as the canonical PortableAI Document. Your draft remains local to this browser.");
};

const copyTextToClipboard = async (text, fallbackField) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    fallbackField.focus();
    fallbackField.select();
    document.execCommand("copy");
  }
};

const copyMarkdown = async () => {
  // Copy the same canonical Markdown text used by preview and download flows.
  // Do not maintain hand-authored provider-specific source alongside it.
  await copyTextToClipboard(editor.value, editor);
  setStatus("Markdown copied to clipboard.");
};

const openContextOverlay = () => {
  lastFocusedElement = document.activeElement;
  contextOverlay.hidden = false;
  document.body.classList.add("overlay-open");
  setContextOverlayStatus("");
  copyContextPromptButton.focus();
};

const closeContextOverlay = () => {
  contextOverlay.hidden = true;
  document.body.classList.remove("overlay-open");
  setContextOverlayStatus("");

  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
};

const copyContextPrompt = async () => {
  await copyTextToClipboard(contextExportPrompt, contextExportPromptField);
  setContextOverlayStatus("Prompt copied to clipboard.");
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

const restoredDraft = safeLocalStorage.get(STORAGE_KEY);

if (restoredDraft !== null) {
  editor.value = restoredDraft;
  setStatus("Restored a local draft from this browser.");
}

// ---------------------------------------------------------------------------
// Document model: parse + serialize Markdown ↔ structured form data.
//
// The Markdown source in `editor.value` is canonical (ADR-0001). The Form tab
// derives its inputs from the parsed model and writes changes back to Markdown
// on every keystroke. This keeps all three tabs consistent without a separate
// data store.
// ---------------------------------------------------------------------------

// Well-known section registry v1 (persona keys, cross-doc keys). Keep this in
// sync with spec/registry/well-known-sections-v1.md.
//
// Each entry may include `titleAliases`, an array of human-readable H1
// titles that should resolve to this registry key. This handles cases like
// "Knowledge & Expertise" (published key: knowledge_expertise) or
// "AI Collaboration Instructions" (published key: ai_collaboration) where the
// naive mapping rule would produce a slightly different slug.
const WELL_KNOWN_SECTIONS = [
  { key: "profile", title: "Profile", help: "Identity, roles, location, timezone, long-term goals." },
  { key: "preferences", title: "Preferences", help: "How you like to work, receive information, or interact." },
  { key: "persona", title: "Persona", help: "Voice, tone, style, personality context." },
  { key: "projects", title: "Projects", help: "Active or durable work worth persisting across sessions." },
  { key: "interests", title: "Interests", help: "Topics you care about." },
  {
    key: "knowledge_expertise",
    title: "Knowledge & Expertise",
    titleAliases: ["Knowledge and Expertise", "Knowledge Expertise"],
    help: "Domains where you have deep knowledge.",
  },
  { key: "decision_style", title: "Decision Style", help: "How you make decisions." },
  { key: "communication_style", title: "Communication Style", help: "Preferred communication modes and conventions." },
  {
    key: "ai_collaboration",
    title: "AI Collaboration",
    titleAliases: ["AI Collaboration Instructions"],
    help: "How AI assistants should work with you.",
  },
  { key: "notes", title: "Notes", help: "Freeform notes that don't fit elsewhere." },
  { key: "changelog", title: "Changelog", help: "Human-readable summary of changes to this document." },
];

// Naive Title → key transform used as the default. The Core spec §5.1 rule:
// lowercase, replace runs of whitespace with `_`, strip punctuation. `&` maps
// to "and" to match how most editors slugify.
const slugifyTitle = (title) =>
  title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s_]/g, " ")
    .trim()
    .replace(/\s+/g, "_");

// Build a lookup from any recognized title (canonical or alias, after
// slugification) to the registry's published key.
const TITLE_ALIAS_TO_KEY = (() => {
  const map = new Map();
  for (const entry of WELL_KNOWN_SECTIONS) {
    map.set(slugifyTitle(entry.title), entry.key);
    for (const alias of entry.titleAliases || []) {
      map.set(slugifyTitle(alias), entry.key);
    }
    // The registry key itself is also a valid slug (someone might use the
    // snake_case form directly as a heading).
    map.set(entry.key, entry.key);
  }
  return map;
})();

// Public title → registry key resolver. Falls back to the raw slug for
// unknown titles (which is how custom / not-yet-registered sections work).
const titleToKey = (title) => {
  const slug = slugifyTitle(title);
  return TITLE_ALIAS_TO_KEY.get(slug) || slug;
};

// The front-matter fields we expose as first-class inputs. Anything else in
// the YAML block is preserved verbatim as an "other keys" text area so we
// never silently drop a field.
const FRONT_MATTER_FIELDS = [
  { key: "standard", label: "Standard", placeholder: "PortableAI Persona" },
  { key: "standard_version", label: "Standard version", placeholder: "0.3" },
  { key: "profile_name", label: "Profile name", placeholder: "My PortableAI Persona" },
  { key: "profile_version", label: "Profile version", placeholder: "1.0.0" },
  { key: "last_updated", label: "Last updated", placeholder: "YYYY-MM-DD" },
];

// Minimal YAML parser. Front-matter in the Core spec is a flat map of scalar
// key/value pairs (§4.2), so a full YAML library would be overkill. We accept
// `key: value` per line, ignore blank lines and comment lines beginning `#`,
// and preserve insertion order so round-tripping is stable.
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
    // Strip surrounding matching quotes if present. We do not attempt to
    // interpret YAML flow scalars, block scalars, anchors, or nested maps —
    // if a document uses those, the Form tab will just show the raw text on
    // the "other keys" line and users can edit in the Markdown tab.
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

const serializeFrontMatter = (entries) => {
  if (!entries.length) {
    return "";
  }
  const body = entries
    .filter(([key]) => key && key.trim())
    .map(([key, value]) => `${key}: ${value ?? ""}`)
    .join("\n");
  return `---\n${body}\n---`;
};

// Split a document into { frontMatter, body } where body preserves the
// original text after the closing `---`. Documents without front-matter are
// treated as body-only.
const FRONT_MATTER_RE = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/;

const splitFrontMatter = (source) => {
  const match = source.match(FRONT_MATTER_RE);
  if (!match) {
    return { frontMatterRaw: "", frontMatterEntries: [], body: source };
  }
  return {
    frontMatterRaw: match[1],
    frontMatterEntries: parseFrontMatter(match[1]),
    body: source.slice(match[0].length),
  };
};

// Walk the Markdown body and return an ordered list of top-level (H1) sections.
// Everything before the first H1 is captured as a synthetic "preamble" section
// with key `__preamble__` so it round-trips exactly. Horizontal-rule
// separators (`---`) between sections are preserved as part of the following
// section's leading whitespace when we serialize.
const H1_RE = /^# +(.+?)\s*$/;

const parseSections = (body) => {
  const lines = body.split(/\r?\n/);
  const sections = [];
  let current = { title: "", key: "__preamble__", contentLines: [] };

  for (const line of lines) {
    const match = line.match(H1_RE);
    if (match) {
      // Push the previous section (including preamble) before starting a new one.
      sections.push(current);
      const title = match[1].trim();
      current = { title, key: titleToKey(title), contentLines: [] };
    } else {
      current.contentLines.push(line);
    }
  }
  sections.push(current);

  return sections.map((s) => ({
    title: s.title,
    key: s.key,
    content: s.contentLines.join("\n").replace(/^\n+/, "").replace(/\s+$/, ""),
  }));
};

const serializeSections = (sections) => {
  const parts = [];
  for (const s of sections) {
    if (s.key === "__preamble__") {
      if (s.content.trim()) {
        parts.push(s.content);
      }
      continue;
    }
    const heading = `# ${s.title}`;
    const body = s.content ? `\n\n${s.content}` : "";
    parts.push(`${heading}${body}`);
  }
  // Join sections with a blank-line separator. We intentionally do not
  // re-emit `---` horizontal-rule dividers between sections; the persona
  // template's original dividers were decorative and Markdown renderers do
  // not require them. If a user wants them back they can add them in the
  // Markdown tab.
  return parts.filter((p) => p.length > 0).join("\n\n") + "\n";
};

const parseDocument = (source) => {
  const { frontMatterEntries, body } = splitFrontMatter(source);
  return { frontMatter: frontMatterEntries, sections: parseSections(body) };
};

const serializeDocument = (model) => {
  const fm = serializeFrontMatter(model.frontMatter);
  const body = serializeSections(model.sections);
  if (!fm) {
    return body;
  }
  return `${fm}\n\n${body}`;
};

// ---------------------------------------------------------------------------
// Form rendering. The Form tab is generated from the parsed model each time
// the Markdown changes. To preserve user focus and typing, we do a *diff* of
// existing field DOM against the desired field list — reusing input/textarea
// elements when their id matches.
// ---------------------------------------------------------------------------

let suppressEditorInput = false;

// Declared with `var` for the same TDZ-avoidance reason as `renderPreview`
// above — setEditorValue references renderForm before its `const` declaration
// would otherwise be initialized.
// eslint-disable-next-line no-var
var renderForm;

const sectionFieldId = (key) => `section-${key}`;

const getModelFromEditor = () => parseDocument(editor.value);

const writeEditor = (model) => {
  const nextValue = serializeDocument(model);
  if (nextValue === editor.value) {
    return;
  }
  suppressEditorInput = true;
  editor.value = nextValue;
  suppressEditorInput = false;
  saveDraft();
};

// The Form tab shows front-matter as a read-only card (matching Preview) so
// users don't mistake informational metadata for something they should edit
// in a form field. Front-matter can still be edited on the Markdown tab; the
// canonical Markdown text is the single source of truth (ADR-0001).
const renderFormFrontMatter = (model, container) => {
  if (!model.frontMatter.length) {
    return;
  }

  const card = document.createElement("div");
  card.className = "metadata-card metadata-card--form";
  card.setAttribute("aria-label", "Document metadata");

  const rows = model.frontMatter
    .map(
      ([k, v]) =>
        `<dt>${escapeHtml(prettyFrontMatterLabel(k))}</dt><dd>${escapeHtml(v)}</dd>`,
    )
    .join("");
  card.innerHTML =
    `<h3>Document metadata</h3>` +
    `<dl>${rows}</dl>` +
    `<p class="metadata-card-hint">Edit these fields on the Markdown tab. The canonical Markdown is the source of truth.</p>`;

  container.appendChild(card);
};

const renderFormSection = (section, container, { registryEntry }) => {
  const wrapper = document.createElement("section");
  wrapper.className = "form-section";
  const inputId = sectionFieldId(section.key);
  wrapper.innerHTML = `
    <div class="form-section-header">
      <h3 class="form-section-title">${escapeHtml(section.title || registryEntry?.title || section.key)}</h3>
      <span class="form-section-key">${escapeHtml(section.key)}</span>
    </div>
    ${registryEntry ? `<p class="help-text">${escapeHtml(registryEntry.help)}</p>` : `<p class="help-text">Custom section. Edit its Markdown body below.</p>`}
  `;
  const textarea = document.createElement("textarea");
  textarea.id = inputId;
  textarea.spellcheck = true;
  textarea.value = section.content;
  textarea.addEventListener("input", () => {
    const current = getModelFromEditor();
    const nextSections = current.sections.map((s) =>
      s.key === section.key ? { ...s, content: textarea.value } : s,
    );
    writeEditor({ ...current, sections: nextSections });
    updatePreview();
  });
  wrapper.appendChild(textarea);
  container.appendChild(wrapper);
};

renderForm = () => {
  if (!formFields) return;
  const model = getModelFromEditor();

  // Snapshot the focused element and its selection so a re-render doesn't
  // eject the user from the field they're typing in.
  const active = document.activeElement;
  const focusInfo =
    active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA") && formFields.contains(active)
      ? {
          id: active.id,
          start: active.selectionStart,
          end: active.selectionEnd,
        }
      : null;

  formFields.innerHTML = "";
  renderFormFrontMatter(model, formFields);

  const registryByKey = new Map(WELL_KNOWN_SECTIONS.map((s) => [s.key, s]));
  const seenKeys = new Set();

  // Render sections in the order they appear in the document, skipping the
  // synthetic preamble (it's usually empty; if not, users see it as a
  // "Preamble" section for round-trip safety).
  for (const section of model.sections) {
    if (section.key === "__preamble__") {
      if (!section.content.trim()) continue;
      renderFormSection({ ...section, title: "Preamble" }, formFields, { registryEntry: null });
      continue;
    }
    seenKeys.add(section.key);
    renderFormSection(section, formFields, { registryEntry: registryByKey.get(section.key) });
  }

  // Offer to add any well-known section that isn't yet present.
  const missing = WELL_KNOWN_SECTIONS.filter((s) => !seenKeys.has(s.key));
  if (missing.length) {
    const addWrapper = document.createElement("section");
    addWrapper.className = "form-section";
    addWrapper.innerHTML = `
      <div class="form-section-header">
        <h3 class="form-section-title">Add a well-known section</h3>
        <span class="form-section-key">registry v1</span>
      </div>
      <p class="help-text">Pick a well-known section to add to this document. Custom sections can be added by editing the Markdown tab and using a reverse-DNS heading key.</p>
    `;
    const buttons = document.createElement("div");
    buttons.style.display = "flex";
    buttons.style.flexWrap = "wrap";
    buttons.style.gap = "0.5rem";
    for (const entry of missing) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "button secondary";
      btn.textContent = `+ ${entry.title}`;
      btn.addEventListener("click", () => {
        const current = getModelFromEditor();
        writeEditor({
          ...current,
          sections: [...current.sections, { title: entry.title, key: entry.key, content: "-" }],
        });
        renderForm();
        updatePreview();
      });
      buttons.appendChild(btn);
    }
    addWrapper.appendChild(buttons);
    formFields.appendChild(addWrapper);
  }

  if (focusInfo) {
    const el = document.getElementById(focusInfo.id);
    if (el) {
      el.focus();
      try {
        el.setSelectionRange(focusInfo.start, focusInfo.end);
      } catch {
        /* input types like `date` don't support setSelectionRange */
      }
    }
  }
};

// ---------------------------------------------------------------------------
// Preview metadata card. Renders parsed front-matter as a compact key/value
// card above the rendered Markdown body. Raw YAML never leaks into preview.
// ---------------------------------------------------------------------------

const prettyFrontMatterLabel = (key) => {
  const known = FRONT_MATTER_FIELDS.find((f) => f.key === key);
  if (known) return known.label;
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const updateMetadataCard = () => {
  if (!metadataCard) return;
  const { frontMatter } = parseDocument(editor.value);
  if (!frontMatter.length) {
    metadataCard.hidden = true;
    metadataCard.innerHTML = "";
    return;
  }
  const rows = frontMatter
    .map(([k, v]) => `<dt>${escapeHtml(prettyFrontMatterLabel(k))}</dt><dd>${escapeHtml(v)}</dd>`)
    .join("");
  metadataCard.innerHTML = `<h3>Document metadata</h3><dl>${rows}</dl>`;
  metadataCard.hidden = false;
};

// Assign the real renderPreview (declared with `var` earlier so `updatePreview`
// can safely reference it). Strips front-matter and updates the metadata card.
renderPreview = () => {
  const { body } = splitFrontMatter(editor.value);
  preview.innerHTML = renderMarkdown(body);
  updateMetadataCard();
};

// ---------------------------------------------------------------------------
// Tab switching. Uses aria-selected + hidden panels; keyboard-navigable per
// the ARIA authoring practices tabs pattern.
// ---------------------------------------------------------------------------

const activateTab = (tabId) => {
  for (const btn of tabButtons) {
    const selected = btn.id === tabId;
    btn.setAttribute("aria-selected", String(selected));
    btn.tabIndex = selected ? 0 : -1;
  }
  for (const panel of tabPanels) {
    const owner = panel.getAttribute("aria-labelledby");
    panel.hidden = owner !== tabId;
  }
  // Re-render the tab we just switched to so it reflects the latest Markdown.
  if (tabId === "tab-form") renderForm();
  if (tabId === "tab-preview") renderPreview();
};

for (const btn of tabButtons) {
  btn.addEventListener("click", () => activateTab(btn.id));
  btn.addEventListener("keydown", (event) => {
    const idx = tabButtons.indexOf(btn);
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      const next = tabButtons[(idx + 1) % tabButtons.length];
      next.focus();
      activateTab(next.id);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      const prev = tabButtons[(idx - 1 + tabButtons.length) % tabButtons.length];
      prev.focus();
      activateTab(prev.id);
    } else if (event.key === "Home") {
      event.preventDefault();
      tabButtons[0].focus();
      activateTab(tabButtons[0].id);
    } else if (event.key === "End") {
      event.preventDefault();
      const last = tabButtons[tabButtons.length - 1];
      last.focus();
      activateTab(last.id);
    }
  });
}

renderPreview();
renderForm();

editor.addEventListener("input", () => {
  if (suppressEditorInput) return;
  saveDraft();
  renderPreview();
  renderForm();
});

copyButton.addEventListener("click", copyMarkdown);
downloadButton.addEventListener("click", downloadMarkdown);
newFromTemplateButton.addEventListener("click", createNewFromTemplate);
importButton.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => loadMarkdownFile(fileInput.files[0]));
openContextOverlayButton.addEventListener("click", openContextOverlay);
closeContextOverlayButton.addEventListener("click", closeContextOverlay);
copyContextPromptButton.addEventListener("click", copyContextPrompt);
contextOverlayCloseTargets.forEach((target) => {
  target.addEventListener("click", closeContextOverlay);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !contextOverlay.hidden) {
    closeContextOverlay();
  }
});

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
  setStatus("Local draft cleared from this browser.");
});
