const STORAGE_KEY = "portable-ai-user-model-draft";

// Keep this browser-only prototype template aligned with the canonical PortableAI User Model template as it evolves.
const template = `# PortableAI User Model

## Basics
- Name:
- Pronouns:
- Location or time zone:
- Languages:

## Communication preferences
- Preferred tone:
- Preferred level of detail:
- Formatting preferences:

## Durable context
- Work, projects, or studies:
- Recurring goals:
- Important constraints:

## AI collaboration preferences
- What the AI should remember:
- What the AI should avoid assuming:
- How the AI should handle uncertainty:

## Privacy boundaries
- Sensitive topics to avoid storing:
- Information that should expire or be re-confirmed:
`;

const editor = document.querySelector("#profile-editor");
const preview = document.querySelector("#profile-preview");
const status = document.querySelector("#save-status");
const copyButton = document.querySelector("#copy-markdown");
const downloadButton = document.querySelector("#download-markdown");
const clearButton = document.querySelector("#clear-draft");
const resetButton = document.querySelector("#reset-template");

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

const downloadMarkdown = () => {
  const blob = new Blob([editor.value], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "portable-ai-user-model.md";
  link.click();
  URL.revokeObjectURL(url);
  setStatus("Markdown downloaded. Your draft remains local to this browser.");
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

editor.value = localStorage.getItem(STORAGE_KEY) || template;
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
resetButton.addEventListener("click", () => setEditorValue(template));
