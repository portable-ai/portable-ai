// Get a Prompt page controller.
//
// Reads window.PORTABLE_AI_PROMPTS (js/prompt.js) — the single source of truth
// for every extraction prompt — and drives:
//   - the profile-type selector (radiogroup, one option per prompt type),
//   - the full read-only prompt readout,
//   - the top and bottom Copy buttons.
//
// The selector is data-driven: adding a type in js/prompt.js adds an option
// here with no further changes. No build step, plain <script>.

(function () {
  const prompts = window.PORTABLE_AI_PROMPTS;
  if (!prompts) return;

  const optionsRoot = document.querySelector("#type-options");
  const hint = document.querySelector("#type-selector-hint");
  const readoutName = document.querySelector("#prompt-readout-name");
  const readoutBody = document.querySelector("#prompt-readout-body");
  const copyTop = document.querySelector("#copy-prompt-top");
  const copyBottom = document.querySelector("#copy-prompt-bottom");
  const status = document.querySelector("#prompt-status");

  if (!optionsRoot || !readoutBody) return;

  let activeType = prompts.defaultType;

  const setStatus = (message) => {
    if (status) status.textContent = message;
  };

  // Clipboard write with a textarea fallback for older browsers / insecure
  // contexts, mirroring the helper in app.js.
  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const scratch = document.createElement("textarea");
      scratch.value = text;
      scratch.setAttribute("readonly", "");
      scratch.style.position = "absolute";
      scratch.style.left = "-9999px";
      document.body.appendChild(scratch);
      scratch.select();
      try {
        document.execCommand("copy");
      } catch {
        /* no-op: clipboard simply unavailable */
      }
      document.body.removeChild(scratch);
    }
  };

  const render = () => {
    const entry = prompts.get(activeType);
    if (readoutName) readoutName.textContent = entry.label + " prompt";
    if (hint) hint.textContent = entry.description || "";
    readoutBody.textContent = entry.prompt;
    setStatus("");

    // Reflect selection state on the option buttons.
    for (const btn of optionsRoot.querySelectorAll("[data-type]")) {
      const selected = btn.getAttribute("data-type") === activeType;
      btn.setAttribute("aria-checked", String(selected));
      btn.classList.toggle("type-option--active", selected);
      btn.tabIndex = selected ? 0 : -1;
    }
  };

  const selectType = (type) => {
    if (!prompts.map[type]) return;
    activeType = type;
    render();
  };

  // Build the selector options from the prompt map (ordered).
  const types = Object.keys(prompts.map);
  types.forEach((type) => {
    const entry = prompts.map[type];
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "type-option";
    btn.setAttribute("role", "radio");
    btn.setAttribute("data-type", type);
    btn.setAttribute("aria-checked", "false");
    btn.textContent = entry.label;
    btn.addEventListener("click", () => selectType(type));
    // Arrow-key navigation across the radiogroup.
    btn.addEventListener("keydown", (event) => {
      const idx = types.indexOf(type);
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        const next = types[(idx + 1) % types.length];
        selectType(next);
        optionsRoot.querySelector(`[data-type="${next}"]`).focus();
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        const prev = types[(idx - 1 + types.length) % types.length];
        selectType(prev);
        optionsRoot.querySelector(`[data-type="${prev}"]`).focus();
      }
    });
    optionsRoot.appendChild(btn);
  });

  const copyActive = async () => {
    const entry = prompts.get(activeType);
    await copyText(entry.prompt);
    setStatus(entry.label + " prompt copied. Send it to an AI you already use.");
  };

  if (copyTop) copyTop.addEventListener("click", copyActive);
  if (copyBottom) copyBottom.addEventListener("click", copyActive);

  // Support deep-linking a type: get-a-prompt.html#software-project
  const hashType = (window.location.hash || "").replace(/^#/, "");
  if (hashType && prompts.map[hashType]) {
    activeType = hashType;
  }

  render();
})();
