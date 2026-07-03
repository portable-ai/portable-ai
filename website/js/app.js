const STORAGE_KEY = "portable-ai-user-model-draft";

// Static browser-only copy of templates/Portable_AI_User_Model_Template.md.
// Embedded here so the GitHub Pages editor can create a new document without
// depending on fetch paths that may vary by deployment location.
const portableAiUserModelTemplate = `---
standard: Portable AI User Model
standard_version: 0.2
profile_name: My Portable AI User Model
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

List active, planned, inactive, or completed projects that are durable enough to belong in the model.

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

Add any additional sections that are useful for your own model.
`;

const editor = document.querySelector("#profile-editor");
const preview = document.querySelector("#profile-preview");
const status = document.querySelector("#save-status");
const copyButton = document.querySelector("#copy-markdown");
const downloadButton = document.querySelector("#download-markdown");
const clearButton = document.querySelector("#clear-draft");
const newFromTemplateButton = document.querySelector("#new-from-template");

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
    !window.confirm("Replace the current Markdown draft with a new PortableAI User Model template?")
  ) {
    setStatus("Kept the current draft.");
    return;
  }

  setEditorValue(portableAiUserModelTemplate);
  setStatus("New PortableAI User Model template loaded. Edit the Markdown directly.");
};

const downloadMarkdown = () => {
  const blob = new Blob([editor.value], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "portable-ai-user-model.md";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setStatus("Markdown downloaded as the canonical PortableAI User Model document. Your draft remains local to this browser.");
};

const copyMarkdown = async () => {
  try {
    await navigator.clipboard.writeText(editor.value);
    setStatus("Markdown copied to clipboard.");
  } catch {
    editor.select();
    document.execCommand("copy");
    setStatus("Markdown copied to clipboard.");
  }
};

editor.value = localStorage.getItem(STORAGE_KEY) || "";
updatePreview();

editor.addEventListener("input", () => {
  saveDraft();
  updatePreview();
});

copyButton.addEventListener("click", copyMarkdown);
downloadButton.addEventListener("click", downloadMarkdown);
clearButton.addEventListener("click", () => {
  editor.value = "";
  localStorage.removeItem(STORAGE_KEY);
  updatePreview();
  setStatus("Local draft cleared from this browser.");
});
newFromTemplateButton.addEventListener("click", createNewFromTemplate);
