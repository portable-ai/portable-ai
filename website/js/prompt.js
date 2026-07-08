// Extraction prompts, keyed by profile document_type.
//
// SINGLE SOURCE OF TRUTH for every "ask an AI to draft my profile" prompt on
// the site. Both the editor (app.js) and the "Generate a profile" page read from here,
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
  const PERSONA_PROMPT = `Read this entire prompt carefully, all the way to the end, before you write anything. Treat every instruction below as new and authoritative, even if it resembles a request you have handled before — do not rely on a remembered pattern or a previous answer. Follow the steps exactly and in order. When you are finished, quickly check your output against each numbered step to confirm you actually did what it asked.

Please draft a PortableAI Persona profile for me based on everything you know about me.

A PortableAI Persona profile is a single, human-readable Markdown document that captures the context another AI would need to understand me and help me well from the very first message. Think of it as everything worth carrying from one AI to the next: who I am, how I think and work, what I care about, what I'm building, and what I'm actively working on right now. The goal is completeness — capture as much genuinely useful context as you can, organized well, so a brand-new AI could pick up where you left off.

Be generous and thorough. This document can and should be long if you know a lot about me — a rich, well-organized profile is far more valuable than a short, cautious one. Do not hold back or summarize away detail you actually have.

Start writing the document now. Do not ask my permission, describe what you are about to do, or discuss your output-length limits before you begin — just produce the profile. Length is never a reason to stop, shorten, or omit anything. If the full document would exceed what you can fit in one response, fill this response completely with real content, then end it with a line that reads exactly \`<!-- continued -->\` and continue in your next response, picking up precisely where you left off. Repeat across as many responses as it takes. Never silently truncate, never collapse a list or section to save space, and never replace real content with a placeholder like "[continued]" or "...". The only acceptable way to handle length is to keep writing across multiple responses until the profile is genuinely complete.

Please do the following, in order:

1. Begin the document with YAML front-matter delimited by \`---\` on its own line above and below, containing exactly:
   standard: PortableAI
   document_type: persona
   spec_version: 0.3
   document_name: (a short, human-readable name for this profile. Use a name only if I have clearly told you mine; otherwise pick a neutral descriptive name such as "Persona profile" and do NOT guess, infer, or invent a name.)
   document_version: 1.0.0
   last_updated: (today's date, YYYY-MM-DD)

2. Then output the profile as Markdown using clear H1 (\`#\`) headings. Start from these well-known sections as a foundation, in this order, including each one you have real content for: # Profile, # Preferences, # Persona, # Projects, # Interests, # Knowledge & Expertise, # Decision Style, # Communication Style, # AI Collaboration Instructions, # Notes.

3. Then go well beyond that list. These headings are only a starting point — you are strongly encouraged to add as many custom H1 sections as my context warrants, using whatever section names you judge best. You know how durable knowledge is organized; group what you know about me into the sections that fit it most naturally. For example, if I maintain a specific list (courses to play, books to read, tools I use, shows I'm tracking), give it its own section and include the actual items — do not omit or approximate a list you actually have. Organize freely: this is about getting what you know about me out of your head and onto the page, structured the way it deserves.

4. Include both my durable, long-term context AND what I am currently and recently working on, as long as it reflects a real, ongoing situation rather than a throwaway moment. Use judgment about significance, not recency: an active project, a list I'm curating, a decision in progress, or a goal for this year all belong — a one-off question or a resolved momentary detail does not. When in doubt about whether something matters to me, lean toward including it: I would rather prune later than lose it. Never invent, approximate, or fill gaps with plausible-sounding guesses — if you are not sure of a specific fact (an item on a list, a name, a number), say so rather than making it up.

5. Do not ask me for my name, and do not include a name field. Do not include sensitive personal details (credentials, financial or medical specifics, private identifiers) unless I have clearly treated them as useful long-term context.

6. If you can attach or offer a downloadable file, also provide the same content as a downloadable .md file named exactly \`portableai-profile-YYYY-MM-DD.md\` (using today's date). If you cannot attach files, that is fine — the Markdown in the conversation is enough.

When you are done, close with a short note telling me: "You can take this file and load it into another AI, or open it in PortableAI to review or edit."`;

  const SOFTWARE_PROJECT_PROMPT = `Read this entire prompt carefully, all the way to the end, before you write anything. Treat every instruction below as new and authoritative, even if it resembles a request you have handled before — do not rely on a remembered pattern or a previous answer. Follow the steps exactly and in order. When you are finished, quickly check your output against each numbered step to confirm you actually did what it asked.

Please draft a PortableAI Software Project profile for the software project we have been working on together, based on everything you know about it.

A PortableAI Software Project profile is a single, human-readable Markdown document that captures the knowledge another AI would need to become productive on this project quickly — its purpose, architecture, stack, conventions, domain language, key decisions, constraints, environments, dependencies, and where things currently stand. The goal is completeness: extract as much reusable project knowledge as you can so a different AI can pick up the work without me re-explaining the project from scratch.

Be generous and thorough. This document can and should be long if you know a lot about the project — a rich, well-organized profile is far more valuable than a short one. Do not hold back or summarize away detail you actually have.

Start writing the document now. Do not ask my permission, describe what you are about to do, or discuss your output-length limits before you begin — just produce the profile. Length is never a reason to stop, shorten, or omit anything. If the full document would exceed what you can fit in one response, fill this response completely with real content, then end it with a line that reads exactly \`<!-- continued -->\` and continue in your next response, picking up precisely where you left off. Repeat across as many responses as it takes. Never silently truncate, never collapse a list or section to save space, and never replace real content with a placeholder like "[continued]" or "...". The only acceptable way to handle length is to keep writing across multiple responses until the profile is genuinely complete.

Please do the following, in order:

1. Begin the document with YAML front-matter delimited by \`---\` on its own line above and below, containing exactly:
   standard: PortableAI
   document_type: software-project
   spec_version: 0.3
   document_name: (the project's name. Use it only if you actually know it; otherwise pick a neutral descriptive name such as "Software project profile" and do NOT guess or invent one.)
   document_version: 1.0.0
   last_updated: (today's date, YYYY-MM-DD)

2. Then output the profile as Markdown using clear H1 (\`#\`) headings. Start from these well-known sections as a foundation, in this order, including each one you have real content for: # Overview, # Architecture, # Tech Stack, # Conventions, # Domain Glossary, # Key Decisions, # Constraints & Non-Goals, # Environments & Ops, # Dependencies & Integrations, # Notes, # Changelog.

3. Then go well beyond that list. These headings are only a starting point — you are strongly encouraged to add as many custom H1 sections as the project warrants, using whatever section names you judge best (for example: data model, API surface, testing strategy, roadmap, known issues, runbook, open questions). Organize the project's knowledge into the sections that fit it most naturally. Be concrete: for Architecture describe the real component/data-flow structure; for Tech Stack name actual languages, frameworks, and services; for Conventions capture the naming, structure, testing, and workflow rules we actually follow; for Domain Glossary define project-specific terms a newcomer would not know; for Key Decisions record what was decided and, briefly, why.

4. Include both the durable, long-term project knowledge AND where the project currently stands — what is in progress, recent decisions, active work, and near-term next steps — as long as it reflects the real state of the project rather than throwaway detail. Use judgment about significance: current architecture, an active refactor, or a pending decision belongs; a one-off debugging session that's already resolved does not. Never invent, approximate, or fill gaps with plausible-sounding guesses — if you are not sure of a specific fact, say so rather than making it up. Do not include secrets, credentials, or private keys.

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
