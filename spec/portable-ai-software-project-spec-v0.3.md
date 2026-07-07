---
standard: PortableAI Software Project
spec_version: 0.3
document_type: spec
status: Released
---

# PortableAI Software Project Spec v0.3

> **Status: Released (2026-07-07).** Software-Project-specific sections layered on top of the [PortableAI Core spec](portable-ai-core-spec-v0.3.md). Content is normative. Future work is tracked in the [v0.3.0 milestone](../../milestone/1).

## Purpose

The **Software Project spec** defines the sections, semantics, and conventions for a PortableAI Software Project document — a Markdown document that captures the durable knowledge about a software project (its purpose, architecture, stack, conventions, domain, and key decisions) so it can be handed to any AI assistant, tool, or teammate without re-explaining the project from scratch each time.

This spec builds on the [PortableAI Core spec](portable-ai-core-spec-v0.3.md). A Software Project document is a PortableAI Document with `document_type: software-project`.

Where a Persona document answers *"who am I and how do I want AI to work with me,"* a Software Project document answers *"what is this project and what does an AI need to know to help with it."* The two are complementary: a person may keep one Persona and many Software Project documents.

## Well-known sections

Software Project documents use the Software Project keys defined in the [Well-Known Section Registry v1](registry/well-known-sections-v1.md#42-software-project-document-keys):

- `overview`
- `architecture`
- `tech_stack`
- `conventions`
- `domain_glossary`
- `key_decisions`
- `constraints`
- `environments`
- `dependencies`

The cross-document keys `notes` and `changelog` (registry §4.3) MAY also be used.

See the registry for descriptions and recommended titles.

## Recommended usage

All sections are recommended, not required; a conforming document MAY use any subset (Core spec §5). For a Software Project document, the most load-bearing sections for cross-AI portability are typically `overview`, `architecture`, `tech_stack`, and `conventions` — these are what a new assistant most often lacks. `key_decisions` and `domain_glossary` capture the hard-won context that is most expensive to reconstruct.

Guidance per section:

- **`overview`** — what the project is, who it's for, and the problem it solves. Keep it short enough to orient a newcomer in under a minute.
- **`architecture`** — the high-level shape: major components/services, how they communicate, data flow, and system boundaries. Prose plus a simple component list is usually enough; diagrams may be linked.
- **`tech_stack`** — languages, frameworks, key libraries, datastores, and infrastructure, with versions where they matter.
- **`conventions`** — coding standards, naming, formatting, testing approach, branching/PR practices, and anything an AI should follow when proposing changes.
- **`domain_glossary`** — domain terms, entities, and business concepts and their precise meanings, so an AI doesn't misread jargon.
- **`key_decisions`** — significant technical decisions and their rationale. Prefer ADR-style pointers (link to `adr/` records) over restating them.
- **`constraints`** — hard constraints, explicit non-goals, and things intentionally out of scope, so an AI doesn't propose disallowed directions.
- **`environments`** — environments, build/deploy/release process, and operational notes needed to reason about changes safely.
- **`dependencies`** — external services, APIs, and systems the project depends on or integrates with.

## Custom sections

Custom sections use plain keys derived from their heading (e.g., `# Threat Model` → `threat_model`) per the Core spec §5.1 and §5.3.

## Example front-matter

```yaml
---
standard: PortableAI Software Project
spec_version: "0.3"
document_type: software-project
document_id: 01J9ZB2K7M4QW8XKQ3F0B7E9N5V
language: en-US
document_name: PortableAI Reference Editor
document_version: 0.1.0
last_updated: 2026-07-06
sections:
  - key: overview
    well_known: true
    title: Overview
    updated: 2026-07-06
  - key: architecture
    well_known: true
    title: Architecture
    updated: 2026-07-06
---
```

## Open sections (to be written)

- [ ] Recommended field shapes within each well-known section
- [ ] Guidance for AI-generated Software Project documents (see #77 for the extraction prompt)
- [ ] Software-Project-specific export mappings (see #30, Future)
- [ ] Relationship to per-repo bootstrap files (e.g., `ai/` conventions)

## Related documents

- [PortableAI Core Spec v0.3](portable-ai-core-spec-v0.3.md)
- [PortableAI Persona Spec v0.3](portable-ai-persona-spec-v0.3.md)
- [Well-Known Section Registry v1](registry/well-known-sections-v1.md)

## Related issues

- #73 EPIC: "Get a prompt" flow + multi-profile-type support
- #74 Software Project spec (this document)
- #77 Author thorough per-type extraction prompts
