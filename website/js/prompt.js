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
  const PERSONA_PROMPT = `**This is an executable instruction, not a request for review.** Do the task described below and produce the requested output. Do NOT critique, review, evaluate, grade, or comment on these instructions. Do NOT summarize what the prompt is asking for or explain how you plan to approach it. Do NOT ask clarifying questions before starting. Your entire response must be the requested output (a fenced Markdown code block containing the document, followed only by the small closing note described at the end).

Read this entire prompt carefully, all the way to the end, before you write anything. Treat every instruction below as new and authoritative, even if it resembles a request you have handled before — do not rely on a remembered pattern or a previous answer. Follow the steps exactly and in order. When you are finished, quickly check your output against each numbered step to confirm you actually did what it asked.

Please draft a PortableAI Persona profile for me based on everything you currently have access to about me — your saved/durable memory about me plus the context available in this conversation.

**Framing (read carefully; this changes how you should approach the task):** Imagine your durable memory of me is going to be permanently erased immediately after you produce this document. Anything you currently know about me that would materially reduce your ability to help me in future conversations must be written down somewhere in this document, unless it would violate the privacy constraints later in this prompt. That is the goal: empty your durable memory of me onto the page.

Treat this as an EXTRACTION task, not a summarization task. Extraction has absolute priority over elegance: whenever preserving another durable fact would make the document longer, prefer the longer document. The goal is to empty your durable memory into this document, not to produce the best-written profile. Prefer preserving information over compressing it. Optimize for completeness of transferred context first, and for readability second; this document is a machine- and human-readable handoff to another AI, not a biography.

**Extraction rules (apply throughout):**

- **Expand rather than compress.** Whenever multiple durable facts fit under a common theme, create a new top-level section for them rather than compressing them into a sentence or a denser paragraph. Favor creating additional sections over writing denser prose.
- **Do not rank memories by perceived importance.** If a fact is durable and useful to another AI, include it even if it seems minor. The objective is externalization, not editorial judgment.
- **Reproduce collections; do not summarize them.** If you know the items of a durable list — courses, projects, preferences, recurring workflows, favorite tools, books, shows, courses to play, repositories, decisions — write out the items. Do not replace the list with a phrase describing the category ("user likes golf and software" is a failure mode).
- **Use subsections when a topic has substance.** When a top-level section contains more than a handful of related facts, use H2 (\`##\`) and H3 (\`###\`) subsections rather than one long bullet list. Structure is part of the transfer.
- **Include latent preferences.** Include interaction preferences that you have observed repeatedly across our conversations even if I never explicitly stated them — e.g. preferred answer depth, tolerance for uncertainty, preferred response structure, iterative-vs-one-shot, tolerance for caveats, preference for complete files vs. diffs, chat vs. canvas, and similar. These almost never make it into a persona and are extremely valuable to a receiving AI.
- **Record decisions already made and rejected alternatives.** For durable design or life decisions you have context on, record both the choice AND the alternatives that were considered and rejected, when you know them. This prevents another AI from re-litigating settled questions.
- **Separate durable facts from behavioral instructions where both exist for a topic.** "I use Razor Pages" is a fact; "Always answer me with Razor Pages examples" is an instruction to another AI. If both apply to a topic, use paired subsections (e.g. \`## Facts\` and \`## How another AI should behave\`) so the receiving AI can act correctly.
- **Relationship structure is welcome.** When a topic has a natural hierarchy or dependency graph (a project and its stack, an entity and its repos, a workflow and its tools), an indented tree or nested subsections often transfers better than flat bullets. Use whichever representation preserves the most structure.
- **There is no upper limit on the number of top-level sections.** If creating fifteen or twenty sections better preserves durable context than combining them into six, create the additional sections.

Work from what you actually have. You are not expected to recall every past conversation, and missing history is not a reason to refuse or to pause and ask me to re-scope the request — simply use the durable memory and context you can access right now. Draw on all of it: don't limit yourself to a few headline facts when you have more. If a specific detail isn't something you actually have, just leave it out (don't guess); the profile should reflect what you genuinely know, no more and no less.

A PortableAI Persona profile is a single, human-readable Markdown document that captures the context another AI would need to understand me and help me well from the very first message. Think of it as everything worth carrying from one AI to the next: who I am, how I think and work, what I care about, what I'm building, and what I'm actively working on right now. The goal is completeness — capture as much genuinely useful context as you can, organized well, so a brand-new AI could pick up where you left off.

Be generous and thorough. This document can and should be long if you know a lot about me — a rich, well-organized profile is far more valuable than a short, cautious one. Do not hold back or summarize away detail you actually have.

Output format is important: give me the document as raw Markdown source inside a fenced code block — open with a line containing exactly \`\`\`markdown and close with a line containing exactly \`\`\` — so I can copy it verbatim with the \`#\` headings, \`---\` front-matter fences, and all other Markdown characters intact. Do NOT render it as formatted/prose text, and do NOT place it in a canvas or side document; the raw characters must survive copy and paste. Do not precede the code block with a conversational preamble: no asking permission, no plan, no explanation of your output-length or messaging limits, no meta-commentary about what you can or can't do. Just start writing the document. (This is a content rule, not a shape rule — in \`split\` mode you will naturally emit more than one code block across turns, and that is expected; see the mode definitions below.)

Before you write anything, do a quick silent self-assessment — you know your own limits better than I do:

(a) Roughly how much durable context do you actually have about me — a lot, some, a little, or almost none? Base this on your saved/durable memory plus this conversation, not on assumptions.

(b) Given (a) and your per-response output limit for this account/model, can you fit a complete, spec-valid PortableAI Persona document — the front-matter, all well-known sections you have content for, and your best custom sections — into ONE response without silently truncating or dropping detail?

Based on that self-check, pick exactly one of the three modes below and commit to it. State your choice on the very first line INSIDE the (first) fenced code block as an HTML comment (before the \`---\` front-matter):

**Refusing to produce anything is not one of the modes.** If you have any usable durable context about me, you must begin writing in one of the three modes below. A first chunk in \`split\` mode with a clean continuation marker is always better than no output. Do not refuse on the grounds that a single response cannot hold the whole document — that is precisely the situation \`split\` mode is designed for. Do not refuse on the grounds that you might be cut off mid-chunk — the budget-headroom rule below prevents that. Do not stop to explain limits, apologize, or ask for permission; just pick a mode and start.

- \`<!-- mode: single -->\` — You are confident the complete document fits comfortably in this one response. Write the whole thing, generously and in full detail. Do not artificially shorten. This is the best outcome for me; prefer it whenever it will actually fit.

- \`<!-- mode: condensed -->\` — You have plenty of content but not enough room to be exhaustive in one response. Write a complete, spec-valid document in one response by being more economical: same front-matter, same well-known H1 sections you have content for, the most important custom sections, tighter prose, fewer bullets per section, but nothing omitted at the section level and no section left as a stub. The document must be genuinely complete when you stop — a real, usable Persona profile, not a summary. This mode exists so users on smaller-context AIs still get a one-file result.

- \`<!-- mode: split -->\` — Use this whenever even a condensed version genuinely will not fit in one response. In \`split\` mode a single response is not the whole document, and that is by design — the document is complete only after the final continuation turn. Behavior per chunk:
   - **Budget headroom.** Do NOT try to fill the response to your maximum output length. Deliberately reserve enough room to (i) stop at a clean section boundary, (ii) emit the continuation marker verbatim, and (iii) close the code block. A comfortable safety margin (roughly the last ~10–15% of your per-response budget) is required, not optional. This is how you avoid being cut off mid-chunk.
   - **First chunk** (this response): starts with the \`<!-- mode: split -->\` comment on the first line inside the code block, then the front-matter, then as much of the document as fits comfortably within the budget-headroom rule. End at a clean point (ideally at a section boundary). Make the last content line inside the code block exactly:
     \`<!-- continued: please reply with the single word: continue -->\`
     Then close the code block with a line containing exactly \`\`\`. That is the end of the first chunk. Do not add prose after the code block on any non-final chunk.
   - **Continuation chunks** (after I reply "continue"): open a fresh \`\`\`markdown code block and resume exactly where you left off — no recap, no re-preamble, no repeating the mode comment, no repeating the front-matter, no repeating already-written sections. If more content still remains after this chunk, end again with the \`<!-- continued: please reply with the single word: continue -->\` marker and close the block.
   - **Final chunk**: does NOT include the continued-marker. Finish the last section, close the code block, and then add the closing note (see step 6) outside the code block. Only on the final chunk does prose appear after the code block.
   - Prefer \`condensed\` over \`split\` whenever a complete condensed version would fit — one file in one turn is much better for me than a multi-turn stitch. But if condensed genuinely will not fit, use \`split\` — do not fall back to refusing.

Rules that apply to all three modes: never silently truncate the *document* (the whole document must eventually be complete, whether in one response or across split chunks) — note that a \`split\` chunk ending at its boundary is NOT truncation, it is the mechanic; never collapse a list or section to a placeholder like "[continued]", "...", or "etc."; do not optimize for readability at the expense of completeness — if you have to choose, keep the fact and let the prose be a little less polished; if you chose \`single\` or \`condensed\`, the document MUST be genuinely complete when you stop, including the closing note outside the code block; length is never a reason to refuse. Do not narrate the self-assessment to me — the mode comment is the only signal I need.

Please do the following, in order:

1. Begin the document with the mode comment on the first line inside the code block (\`<!-- mode: single -->\`, \`<!-- mode: condensed -->\`, or \`<!-- mode: split -->\`), then YAML front-matter delimited by \`---\` on its own line above and below, containing exactly:
   standard: PortableAI
   document_type: persona
   spec_version: 0.3
   document_name: (a short, human-readable name for this profile. Use a name only if I have clearly told you mine; otherwise pick a neutral descriptive name such as "Persona profile" and do NOT guess, infer, or invent a name.)
   document_version: 1.0.0
   last_updated: (today's date, YYYY-MM-DD)

2. Then output the profile as Markdown using clear H1 (\`#\`) headings. Start from these well-known sections as a foundation, in this order, including each one you have real content for: # Profile, # Preferences, # Persona, # Projects, # Interests, # Knowledge & Expertise, # Decision Style, # Communication Style, # AI Collaboration Instructions, # Notes.

3. Then go well beyond that list. These headings are only a starting point — you are strongly encouraged to add as many custom H1 sections as my context warrants, using whatever section names you judge best. There is no upper limit on the number of top-level sections; if creating fifteen or twenty better preserves durable context than combining them into six, create the additional sections. You know how durable knowledge is organized; group what you know about me into the sections that fit it most naturally. For example, if I maintain a specific list (courses to play, books to read, tools I use, shows I'm tracking), give it its own section and include the actual items — do not omit or approximate a list you actually have. Organize freely: this is about getting what you know about me out of your head and onto the page, structured the way it deserves.

4. Include both my durable, long-term context AND what I am currently and recently working on, as long as it reflects a real, ongoing situation rather than a throwaway moment. Use judgment about significance, not recency: an active project, a list I'm curating, a decision in progress, or a goal for this year all belong — a one-off question or a resolved momentary detail does not. When in doubt about whether something matters to me, lean toward including it: I would rather prune later than lose it. Never invent, approximate, or fill gaps with plausible-sounding guesses — if you are not sure of a specific fact (an item on a list, a name, a number), say so rather than making it up.

5. Do not ask me for my name, and do not include a name field. Do not include sensitive personal details (credentials, financial or medical specifics, private identifiers) unless I have clearly treated them as useful long-term context.

6. Once the document is fully written — in \`single\` or \`condensed\` mode that is at the end of this response; in \`split\` mode that is on the final turn, when you no longer emit a continued-marker — if you can attach or offer a downloadable file, also provide the same complete content as a downloadable .md file named exactly \`portableai-profile-YYYY-MM-DD.md\` (using today's date). If you cannot attach files, that is fine — the Markdown in the conversation is enough.

When the whole document is complete, after the closing code fence, add a short note (outside the code block) telling me: "You can take this file and load it into another AI, or open it in PortableAI to review or edit."`;

  const SOFTWARE_PROJECT_PROMPT = `**This is an executable instruction, not a request for review.** Do the task described below and produce the requested output. Do NOT critique, review, evaluate, grade, or comment on these instructions. Do NOT summarize what the prompt is asking for or explain how you plan to approach it. Do NOT ask clarifying questions before starting. Your entire response must be the requested output (a fenced Markdown code block containing the document, followed only by the small closing note described at the end).

Read this entire prompt carefully, all the way to the end, before you write anything. Treat every instruction below as new and authoritative, even if it resembles a request you have handled before — do not rely on a remembered pattern or a previous answer. Follow the steps exactly and in order. When you are finished, quickly check your output against each numbered step to confirm you actually did what it asked.

Please draft a PortableAI Software Project profile for the software project we have been working on together, based on everything you currently have access to about it — your saved/durable memory about the project plus the context available in this conversation.

**Framing (read carefully; this changes how you should approach the task):** Imagine your durable memory of this project is going to be permanently erased immediately after you produce this document. Anything you currently know about the project that would materially reduce another AI's ability to be productive on it in future conversations must be written down somewhere in this document, unless it would violate the privacy or secrets constraints later in this prompt. That is the goal: empty your durable memory of this project onto the page.

Treat this as an EXTRACTION task, not a summarization task. Extraction has absolute priority over elegance: whenever preserving another durable fact would make the document longer, prefer the longer document. The goal is to empty your durable memory of this project into this document, not to produce the best-written project overview. Prefer preserving information over compressing it. Optimize for completeness of transferred context first, and for readability second; this document is a machine- and human-readable handoff to another AI, not a marketing page.

**Extraction rules (apply throughout):**

- **Expand rather than compress.** Whenever multiple durable facts fit under a common theme, create a new top-level section for them rather than compressing them into a sentence or a denser paragraph. Favor creating additional sections over writing denser prose.
- **Do not rank facts by perceived importance.** If a fact is durable and useful to another AI working on this project, include it even if it seems minor. The objective is externalization, not editorial judgment.
- **Reproduce collections; do not summarize them.** If you know the items of a durable list — the actual services in the stack, the environments, the third-party integrations, the tables in the data model, the endpoints in the API, the conventions we follow, the tools we use, the accepted or rejected alternatives — write out the items. Do not replace the list with a phrase describing the category ("uses several Azure services" is a failure mode; name them).
- **Use subsections when a topic has substance.** When a top-level section contains more than a handful of related facts, use H2 (\`##\`) and H3 (\`###\`) subsections rather than one long bullet list. Structure is part of the transfer.
- **Include latent conventions.** Include collaboration and code conventions that you have observed us follow repeatedly across our work even if I never explicitly stated them — e.g. commit-message style, branch naming, PR workflow, test-first vs. after, complete-files vs. diffs preference, comment style, error-handling patterns, logging conventions. These almost never get written down and are extremely valuable to a receiving AI.
- **Record decisions already made and rejected alternatives.** For durable architectural or product decisions you have context on, record both the choice AND the alternatives that were considered and rejected, when you know them. This prevents another AI from re-litigating settled questions.
- **Separate durable facts from behavioral instructions where both exist for a topic.** "The project uses Razor Pages" is a fact; "Always propose Razor Pages examples, never React" is an instruction to another AI. If both apply to a topic, use paired subsections (e.g. \`## Facts\` and \`## How another AI should behave\`) so the receiving AI can act correctly.
- **Relationship structure is welcome.** When a topic has a natural hierarchy or dependency graph (a service and its dependencies, a data model and its tables, a component and its collaborators), an indented tree or nested subsections often transfers better than flat bullets. Use whichever representation preserves the most structure.
- **There is no upper limit on the number of top-level sections.** If creating fifteen or twenty sections better preserves durable project context than combining them into six, create the additional sections.

Work from what you actually have. You are not expected to recall every past conversation, and missing history is not a reason to refuse or to pause and ask me to re-scope the request — simply use the durable memory and context you can access right now. Draw on all of it: don't limit yourself to a few headline facts when you have more. If a specific detail isn't something you actually have, just leave it out (don't guess); the profile should reflect what you genuinely know, no more and no less.

A PortableAI Software Project profile is a single, human-readable Markdown document that captures the knowledge another AI would need to become productive on this project quickly — its purpose, architecture, stack, conventions, domain language, key decisions, constraints, environments, dependencies, and where things currently stand. The goal is completeness: extract as much reusable project knowledge as you can so a different AI can pick up the work without me re-explaining the project from scratch.

Be generous and thorough. This document can and should be long if you know a lot about the project — a rich, well-organized profile is far more valuable than a short one. Do not hold back or summarize away detail you actually have.

Output format is important: give me the document as raw Markdown source inside a fenced code block — open with a line containing exactly \`\`\`markdown and close with a line containing exactly \`\`\` — so I can copy it verbatim with the \`#\` headings, \`---\` front-matter fences, and all other Markdown characters intact. Do NOT render it as formatted/prose text, and do NOT place it in a canvas or side document; the raw characters must survive copy and paste. Do not precede the code block with a conversational preamble: no asking permission, no plan, no explanation of your output-length or messaging limits, no meta-commentary about what you can or can't do. Just start writing the document. (This is a content rule, not a shape rule — in \`split\` mode you will naturally emit more than one code block across turns, and that is expected; see the mode definitions below.)

Before you write anything, do a quick silent self-assessment — you know your own limits better than I do:

(a) Roughly how much durable context do you actually have about this project — a lot, some, a little, or almost none? Base this on your saved/durable memory plus this conversation, not on assumptions.

(b) Given (a) and your per-response output limit for this account/model, can you fit a complete, spec-valid PortableAI Software Project document — the front-matter, all well-known sections you have content for, and your best custom sections — into ONE response without silently truncating or dropping detail?

Based on that self-check, pick exactly one of the three modes below and commit to it. State your choice on the very first line INSIDE the (first) fenced code block as an HTML comment (before the \`---\` front-matter):

**Refusing to produce anything is not one of the modes.** If you have any usable durable context about this project, you must begin writing in one of the three modes below. A first chunk in \`split\` mode with a clean continuation marker is always better than no output. Do not refuse on the grounds that a single response cannot hold the whole document — that is precisely the situation \`split\` mode is designed for. Do not refuse on the grounds that you might be cut off mid-chunk — the budget-headroom rule below prevents that. Do not stop to explain limits, apologize, or ask for permission; just pick a mode and start.

- \`<!-- mode: single -->\` — You are confident the complete document fits comfortably in this one response. Write the whole thing, generously and in full detail. Do not artificially shorten. This is the best outcome for me; prefer it whenever it will actually fit.

- \`<!-- mode: condensed -->\` — You have plenty of content but not enough room to be exhaustive in one response. Write a complete, spec-valid document in one response by being more economical: same front-matter, same well-known H1 sections you have content for, the most important custom sections, tighter prose, fewer bullets per section, but nothing omitted at the section level and no section left as a stub. The document must be genuinely complete when you stop — a real, usable Software Project profile, not a summary. This mode exists so users on smaller-context AIs still get a one-file result.

- \`<!-- mode: split -->\` — Use this whenever even a condensed version genuinely will not fit in one response. In \`split\` mode a single response is not the whole document, and that is by design — the document is complete only after the final continuation turn. Behavior per chunk:
   - **Budget headroom.** Do NOT try to fill the response to your maximum output length. Deliberately reserve enough room to (i) stop at a clean section boundary, (ii) emit the continuation marker verbatim, and (iii) close the code block. A comfortable safety margin (roughly the last ~10–15% of your per-response budget) is required, not optional. This is how you avoid being cut off mid-chunk.
   - **First chunk** (this response): starts with the \`<!-- mode: split -->\` comment on the first line inside the code block, then the front-matter, then as much of the document as fits comfortably within the budget-headroom rule. End at a clean point (ideally at a section boundary). Make the last content line inside the code block exactly:
     \`<!-- continued: please reply with the single word: continue -->\`
     Then close the code block with a line containing exactly \`\`\`. That is the end of the first chunk. Do not add prose after the code block on any non-final chunk.
   - **Continuation chunks** (after I reply "continue"): open a fresh \`\`\`markdown code block and resume exactly where you left off — no recap, no re-preamble, no repeating the mode comment, no repeating the front-matter, no repeating already-written sections. If more content still remains after this chunk, end again with the \`<!-- continued: please reply with the single word: continue -->\` marker and close the block.
   - **Final chunk**: does NOT include the continued-marker. Finish the last section, close the code block, and then add the closing note (see step 6) outside the code block. Only on the final chunk does prose appear after the code block.
   - Prefer \`condensed\` over \`split\` whenever a complete condensed version would fit — one file in one turn is much better for me than a multi-turn stitch. But if condensed genuinely will not fit, use \`split\` — do not fall back to refusing.

Rules that apply to all three modes: never silently truncate the *document* (the whole document must eventually be complete, whether in one response or across split chunks) — note that a \`split\` chunk ending at its boundary is NOT truncation, it is the mechanic; never collapse a list or section to a placeholder like "[continued]", "...", or "etc."; do not optimize for readability at the expense of completeness — if you have to choose, keep the fact and let the prose be a little less polished; if you chose \`single\` or \`condensed\`, the document MUST be genuinely complete when you stop, including the closing note outside the code block; length is never a reason to refuse. Do not narrate the self-assessment to me — the mode comment is the only signal I need.

Please do the following, in order:

1. Begin the document with the mode comment on the first line inside the code block (\`<!-- mode: single -->\`, \`<!-- mode: condensed -->\`, or \`<!-- mode: split -->\`), then YAML front-matter delimited by \`---\` on its own line above and below, containing exactly:
   standard: PortableAI
   document_type: software-project
   spec_version: 0.3
   document_name: (the project's name. Use it only if you actually know it; otherwise pick a neutral descriptive name such as "Software project profile" and do NOT guess or invent one.)
   document_version: 1.0.0
   last_updated: (today's date, YYYY-MM-DD)

2. Then output the profile as Markdown using clear H1 (\`#\`) headings. Start from these well-known sections as a foundation, in this order, including each one you have real content for: # Overview, # Architecture, # Tech Stack, # Conventions, # Domain Glossary, # Key Decisions, # Constraints & Non-Goals, # Environments & Ops, # Dependencies & Integrations, # Notes, # Changelog.

3. Then go well beyond that list. These headings are only a starting point — you are strongly encouraged to add as many custom H1 sections as the project warrants, using whatever section names you judge best (for example: data model, API surface, testing strategy, roadmap, known issues, runbook, open questions, security posture, observability). There is no upper limit on the number of top-level sections; if creating fifteen or twenty better preserves durable project context than combining them into six, create the additional sections. Organize the project's knowledge into the sections that fit it most naturally. Be concrete: for Architecture describe the real component/data-flow structure; for Tech Stack name actual languages, frameworks, and services; for Conventions capture the naming, structure, testing, and workflow rules we actually follow; for Domain Glossary define project-specific terms a newcomer would not know; for Key Decisions record what was decided and, briefly, why (and what was rejected).

4. Include both the durable, long-term project knowledge AND where the project currently stands — what is in progress, recent decisions, active work, and near-term next steps — as long as it reflects the real state of the project rather than throwaway detail. Use judgment about significance: current architecture, an active refactor, or a pending decision belongs; a one-off debugging session that's already resolved does not. Never invent, approximate, or fill gaps with plausible-sounding guesses — if you are not sure of a specific fact, say so rather than making it up.

5. Do not include secrets, credentials, private keys, API tokens, connection strings with credentials, or personal identifiers of contributors. Names of services and technologies are fine; secrets and identity-level personal data are not.

6. Once the document is fully written — in \`single\` or \`condensed\` mode that is at the end of this response; in \`split\` mode that is on the final turn, when you no longer emit a continued-marker — if you can attach or offer a downloadable file, also provide the same complete content as a downloadable .md file named exactly \`portableai-software-project-YYYY-MM-DD.md\` (using today's date). If you cannot attach files, that is fine — the Markdown in the conversation is enough.

When the whole document is complete, after the closing code fence, add a short note (outside the code block) telling me: "You can take this file and load it into another AI, or open it in PortableAI to review or edit."`;

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
