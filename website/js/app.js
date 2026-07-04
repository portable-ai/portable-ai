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
standard_version: 0.2
profile_name: My PortableAI Persona
profile_version: 1.0.0
last_updated: YYYY-MM-DD
---

# Profile

Briefly describe who you are and the durable context you want AI systems to know.

## Identity

-

## Roles

-

## Long-Term Goals

-

---

# Preferences

Describe stable preferences that should shape AI assistance.

## General Preferences

-

## Product Preferences

-

## Recommendation Preferences

-

---

# Persona

Describe your personality, working style, and how you tend to think.

-

---

# Projects

List active, planned, inactive, or completed projects that are durable enough to belong in the context.

## Active Projects

-

## Planned Projects

-

## Inactive Projects

-

## Completed Projects

-

---

# Interests

List durable interests, hobbies, and topics.

-

---

# Knowledge & Expertise

List areas where you have meaningful background knowledge or expertise.

-

---

# Decision Style

Describe how you make decisions.

-

---

# Communication Style

Describe how AI systems should communicate with you.

-

---

# AI Collaboration Instructions

Describe how AI systems should work with you.

-

---

# Custom Sections

Add any additional sections that are useful for your own context.
`;

// The editor state is intentionally just Markdown text. The Markdown document
// is the only canonical source; previews and any future AI-specific exports must
// be generated from this text rather than stored as separate primary artifacts.
const editor = document.querySelector("#persona-editor");
const preview = document.querySelector("#persona-preview");
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

const escapeHtml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const renderInlineMarkdown = (value) =>
  escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");

const renderMarkdown = (markdown) => {
  const lines = markdown.split("\n");
  const html = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      closeList();
      return;
    }

    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
      return;
    }

    const listItem = trimmed.match(/^[-*]\s+(.+)$/);
    if (listItem) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${renderInlineMarkdown(listItem[1])}</li>`);
      return;
    }

    closeList();
    html.push(`<p>${renderInlineMarkdown(trimmed)}</p>`);
  });

  closeList();
  return html.join("\n");
};

const setStatus = (message) => {
  status.textContent = message;
};

const setContextOverlayStatus = (message) => {
  contextOverlayStatus.textContent = message;
};

const saveDraft = () => {
  localStorage.setItem(STORAGE_KEY, editor.value);
  setStatus("Draft saved locally in this browser.");
};

const updatePreview = () => {
  preview.innerHTML = renderMarkdown(editor.value);
};

const setEditorValue = (value) => {
  editor.value = value;
  saveDraft();
  updatePreview();
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

const restoredDraft = localStorage.getItem(STORAGE_KEY);

if (restoredDraft !== null) {
  editor.value = restoredDraft;
  setStatus("Restored a local draft from this browser.");
}

updatePreview();

editor.addEventListener("input", () => {
  saveDraft();
  updatePreview();
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
  localStorage.removeItem(STORAGE_KEY);
  updatePreview();
  setStatus("Local draft cleared from this browser.");
});
