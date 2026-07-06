// Extraction prompts, keyed by profile document_type.
//
// SINGLE SOURCE OF TRUTH for every "ask an AI to draft my profile" prompt on
// the site. Both the editor (app.js) and the Get a Prompt page read from here,
// so prompt wording is edited in exactly one place.
//
// Design intent:
// - Each prompt is written to pull as MUCH durable, reusable context out of the
//   AI as possible — it is an extraction prompt, not a thin export request.
// - Markdown first (works in every AI); downloadable .md file best-effort.
// - Output must be spec-valid for its document_type (front-matter + well-known
//   H1 sections). Persona keys per registry §4.1; Software Project keys §4.2.
// - Never ask the user's name. Never store anything. (Non-Storage Principle.)
//
// Exposed as window.PORTABLE_AI_PROMPTS. No build step, no modules — plain
// <script> include, matching the rest of the reference editor.
//
// The map is ordered; the first entry is the default selection. It is designed
// to be extended to N profile types (Research, Company, Writing, …) by adding
// entries — nothing else on the page hard-codes the two current types.

(function () {
  const PERSONA_PROMPT = `Please draft a PortableAI Persona profile for me based on the durable context you already know about me.

A PortableAI Persona profile is a human-readable Markdown document that captures the durable, cross-session context another AI would find useful — stable preferences, communication style, working style, long-term goals, durable projects, ongoing responsibilities, areas of expertise, and recurring constraints. The goal is to capture as much genuinely durable, reusable context as possible so a brand-new AI can help me well from the first message.

Please do the following, in order:

1. Begin the document with YAML front-matter delimited by \`---\` on its own line above and below, containing exactly:
   standard: PortableAI Persona
   document_type: persona
   standard_version: 0.3
   updated: (today's date, YYYY-MM-DD)

2. Then output the full profile as Markdown, using clear H1 headings for these top-level sections, in this order: # Profile, # Preferences, # Persona, # Projects, # Interests, # Knowledge & Expertise, # Decision Style, # Communication Style, # AI Collaboration Instructions, # Notes. Under each heading use concise bullet points. If a section has no genuinely durable content, omit that whole section rather than inventing filler.

3. Be thorough. Mine everything durable you reliably know about me — recurring themes across our conversations, stable tools and workflows, how I like answers structured, what I keep returning to. Prefer specific, reusable statements over vague ones. Do not pad with one-off tasks or momentary context.

4. Do not ask me for my name, and do not include a name field. Skip anything you are not confident is durable. Do not include sensitive personal details unless I have clearly treated them as useful long-term context.

5. If you can attach or offer a downloadable file, also provide the same content as a downloadable .md file named exactly \`portableai-profile-YYYY-MM-DD.md\` (using today's date). If you cannot attach files, that is fine — the Markdown in the conversation is enough.

When you are done, close with a short note telling me: "You can take this file and load it into another AI, or open it in PortableAI to review or edit."`;

  const SOFTWARE_PROJECT_PROMPT = `Please draft a PortableAI Software Project profile for the software project we have been working on together, based on everything durable you know about it.

A PortableAI Software Project profile is a human-readable Markdown document that captures the durable, cross-session knowledge another AI would need to become productive on this project quickly — its purpose, architecture, stack, conventions, domain language, key decisions, constraints, environments, and dependencies. The goal is to extract as much reusable project knowledge as possible so a different AI can pick up the work without me re-explaining the project from scratch.

Please do the following, in order:

1. Begin the document with YAML front-matter delimited by \`---\` on its own line above and below, containing exactly:
   standard: PortableAI Software Project
   document_type: software-project
   standard_version: 0.3
   updated: (today's date, YYYY-MM-DD)

2. Then output the full profile as Markdown, using clear H1 headings for these top-level sections, in this order — include every one you have real content for: # Overview, # Architecture, # Tech Stack, # Conventions, # Domain Glossary, # Key Decisions, # Constraints & Non-Goals, # Environments & Ops, # Dependencies & Integrations, # Notes, # Changelog. Under each heading use concise bullet points or short paragraphs. Rather than inventing filler, omit any section you have no genuine durable content for.

3. Be thorough and concrete. For Architecture, describe the real component/data-flow structure. For Tech Stack, name actual languages, frameworks, and services. For Conventions, capture naming, structure, testing, and workflow rules we actually follow. For Domain Glossary, define project-specific terms a newcomer would not know. For Key Decisions, record what was decided and, briefly, why. Prefer specific, reusable facts over generic best-practice advice.

4. Only include what is genuinely durable about the project. Do not include one-off debugging chatter, secrets, credentials, or private keys.

5. If you can attach or offer a downloadable file, also provide the same content as a downloadable .md file named exactly \`portableai-software-project-YYYY-MM-DD.md\` (using today's date). If you cannot attach files, that is fine — the Markdown in the conversation is enough.

When you are done, close with a short note telling me: "You can take this file and load it into another AI, or open it in PortableAI to review or edit."`;

  // Ordered map. First key is the default selected type.
  const PROMPTS = {
    persona: {
      label: "Persona",
      documentType: "persona",
      filename: "portableai-profile-YYYY-MM-DD.md",
      description: "Your durable, cross-session context — preferences, working style, goals, expertise.",
      prompt: PERSONA_PROMPT,
    },
    "software-project": {
      label: "Software Project",
      documentType: "software-project",
      filename: "portableai-software-project-YYYY-MM-DD.md",
      description: "Durable knowledge about a software project so any AI can pick up the work.",
      prompt: SOFTWARE_PROJECT_PROMPT,
    },
  };

  const DEFAULT_TYPE = Object.keys(PROMPTS)[0];

  window.PORTABLE_AI_PROMPTS = {
    map: PROMPTS,
    defaultType: DEFAULT_TYPE,
    get(type) {
      return PROMPTS[type] || PROMPTS[DEFAULT_TYPE];
    },
    // Convenience for app.js, which only needs the Persona prompt today.
    persona: PROMPTS.persona.prompt,
  };
})();
