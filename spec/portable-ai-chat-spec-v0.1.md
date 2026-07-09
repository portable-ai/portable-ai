---
standard: PortableAI
document_type: spec
spec_version: 0.3
document_name: PortableAI Chat Spec
status: Draft
---

# PortableAI Chat Spec v0.1

> **Status: Draft.** Chat-specific sections layered on top of the [PortableAI Core spec](portable-ai-core-spec-v0.3.md). Content is provisional and subject to change until the spec ships in a tagged release. Tracked in parent EPIC #149.

## Purpose

The **Chat spec** defines the sections, semantics, and conventions for a PortableAI Chat document -- a Markdown artifact that captures the durable content of an AI conversation (or a scoped thread of work across a conversation) so it survives session limits, model deprecations, and platform lock-in.

This spec builds on the [PortableAI Core spec](portable-ai-core-spec-v0.3.md). A Chat document is a PortableAI Document with `document_type: chat`.

Where a Persona document answers *"who am I and how do I want AI to work with me"* and a Software Project document answers *"what is this project and what does an AI need to know to help with it,"* a Chat document answers *"what did we actually discuss, decide, try, and reject in this conversation."*

Persona and Software Project are **prospective** -- they describe how an AI should behave going forward. Chat is **retrospective** -- it describes what already happened. A person may keep one Persona, many Software Project documents, and many Chat documents.

## Design principles specific to Chat documents

In addition to the Core spec principles:

- **Retrospective, not prospective.** A Chat document records what occurred; it is not a prompt that shapes future behavior.
- **Lossless by default, lossy by opt-in.** The default extraction preserves the full transcript. Summarization, redaction, and omission are explicit user options recorded in front-matter.
- **Human-readable first.** The artifact must be reopenable by a human a year later without special tooling.
- **Cross-AI portable.** A Chat document extracted from ChatGPT MUST be consumable by Claude, Gemini, Grok, or any other AI assistant without loss of meaning.
- **Owned by the user.** The user copies the extraction prompt into their AI of choice; the resulting artifact is saved to their own storage. No PortableAI service holds the content.

## Well-known sections

Chat documents use the Chat keys added to the [Well-Known Section Registry v1](registry/well-known-sections-v1.md#44-chat-document-keys):

- `overview`
- `transcript`
- `reasoning_traces`
- `attachments`
- `decisions`
- `rejected_alternatives`
- `open_threads`

The cross-document keys `notes` and `changelog` (registry §4.3) MAY also be used.

See the registry for descriptions and recommended titles.

## Recommended usage

All sections are recommended, not required; a conforming document MAY use any subset (Core spec §5). For a Chat document, the most load-bearing sections for reopening a conversation are typically `overview`, `transcript`, `decisions`, and `open_threads` -- these are what a future reader (human or AI) most needs.

Guidance per section:

- **`overview`** -- one to three paragraphs summarizing what this conversation was about, the participants, the state at the end, and any hard constraints established during it. This is what a future AI reads first to reconstitute context.
- **`transcript`** -- the turn-by-turn record. Each turn SHOULD be labeled with the speaker (`You` / `Assistant`, or the specific AI name) and a timestamp when known. Fenced code blocks, tables, and other Markdown structures MUST be preserved verbatim unless a summarization option is applied (see §Options).
- **`reasoning_traces`** -- present only when the `export_thinking` option was true and the source platform surfaced reasoning content. Traces MUST be labeled with the turn they belong to. Hidden internal state that the platform does not expose is out of scope.
- **`attachments`** -- list of files, images, or other artifacts referenced during the conversation, per the `attachment_mode` option. See §Options.
- **`decisions`** -- material decisions reached during the conversation, each with rationale. This is the section a future reader most often needs first.
- **`rejected_alternatives`** -- options considered and explicitly ruled out, with the reason. Preserving these prevents re-litigating settled questions.
- **`open_threads`** -- unresolved questions, next steps, and things left for a future session. This is the natural entry point when resuming.

## Custom sections

Custom sections use plain keys derived from their heading (e.g., `# Test Results` -> `test_results`) per the Core spec §5.1 and §5.3.

## Options

Chat extraction is unusual among PortableAI document types in that the user chooses at capture time how lossy the artifact should be. The options applied MUST be recorded in front-matter under `options_applied` so a future reader can distinguish "this section was empty" from "this section was omitted by choice."

Defined options for v0.1:

| Option | Values | Default | Effect |
|---|---|---|---|
| `export_thinking` | `true` \| `false` | `false` | When true, include a `reasoning_traces` section populated with whatever the source platform exposes. |
| `summarize_long_points` | `true` \| `false` | `false` | When true, turns longer than approximately 500 words MAY be summarized in place. The transcript MUST mark summarized turns explicitly. |
| `attachment_mode` | `inline` \| `link` \| `omit` | `link` | How attachments referenced in the conversation are represented. |
| `redact_code_over_lines` | integer \| `null` | `null` | When set, fenced code blocks longer than the given line count are replaced with a placeholder noting the original length. |

Additional options MAY be defined in future minor spec versions. Consumers MUST tolerate unknown option keys in `options_applied`.

## Chat-specific front-matter fields

In addition to Core spec §4 fields, a Chat document SHOULD carry:

| Field | Type | Description |
|---|---|---|
| `source_platform` | string | The AI platform the conversation occurred on. RECOMMENDED values: `chatgpt`, `claude`, `gemini`, `grok`, `perplexity`, `other`. |
| `source_model` | string | The specific model name and version if known (e.g., `gpt-5.5`, `claude-opus-4.8`). |
| `participants` | list | Free-form list of participant labels (e.g., `[You, Assistant]` or `[You, Claude, ChatGPT]` for cross-AI threads). |
| `date_started` | date | ISO-8601 date the conversation began. |
| `date_ended` | date | ISO-8601 date of the last turn included. |
| `chat_url` | string | Canonical URL to the original conversation if the platform exposes one. |
| `options_applied` | mapping | The options table above, with the values that were in effect during extraction. |

## Example front-matter

```yaml
---
standard: PortableAI
document_type: chat
spec_version: 0.3
document_name: PortableAI v3 -> v4 development arc
document_version: 0.1.0
last_updated: 2026-07-08
source_platform: perplexity
source_model: claude-sonnet-4.6
participants:
  - You
  - Assistant
date_started: 2026-07-07
date_ended: 2026-07-08
options_applied:
  export_thinking: false
  summarize_long_points: false
  attachment_mode: link
  redact_code_over_lines: null
sections:
  - key: overview
    well_known: true
    title: Overview
    updated: 2026-07-08
  - key: transcript
    well_known: true
    title: Transcript
    updated: 2026-07-08
  - key: decisions
    well_known: true
    title: Decisions
    updated: 2026-07-08
  - key: open_threads
    well_known: true
    title: Open Threads
    updated: 2026-07-08
---
```

## Privacy and secrets

- Secrets, API keys, passwords, and credentials MUST NOT appear in a Chat document, even when present in the source transcript. The extraction prompt MUST redact them.
- Private conversations SHOULD follow the same naming convention as other PortableAI artifacts: a filename suffix of `-private` signals the document is not intended for publication.

## Non-goals for v0.1

- Streaming or live capture (this is a PortableChat.ai commercial concern).
- Browser extensions or MV3 capture services.
- Cross-conversation thread grouping.
- Automated schema linting (may follow in a later minor version).

## Open sections (to be written)

- [ ] Recommended field shapes for machine-consumable transcript blocks (e.g., structured turn objects vs. free-form Markdown headings).
- [ ] Guidance for AI-generated Chat documents when the extraction prompt is copy/pasted into a fresh session with no prior context.
- [ ] Reference implementation checklist for consumers that ingest Chat documents to re-prime a session.

## Related documents

- [PortableAI Core Spec v0.3](portable-ai-core-spec-v0.3.md)
- [PortableAI Persona Spec v0.3](portable-ai-persona-spec-v0.3.md)
- [PortableAI Software Project Spec v0.3](portable-ai-software-project-spec-v0.3.md)
- [Well-Known Section Registry v1](registry/well-known-sections-v1.md)

## Related issues

- #149 EPIC: Chat profile type (this spec)
- #150 chat/v0.1 schema (this document)
- #151 chat extraction prompt (free-tier deliverable)
- #152 chat reference implementation from chatlog.md
- #153 docs page: generate-a-chat-log.html
