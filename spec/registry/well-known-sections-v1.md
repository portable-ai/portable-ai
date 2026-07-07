---
standard: PortableAI Well-Known Section Registry
spec_version: 0.3-draft
document_type: spec
registry_version: 1
status: DRAFT
---

# PortableAI Well-Known Section Registry v1 (DRAFT)

> **Status: DRAFT.** Normative for the First Public Draft. See the [v1.0 milestone](../../../milestone/1).

## 1. Purpose

This registry enumerates the well-known section keys recognized by PortableAI editors and consumers at registry version **1**.

A **well-known key** is a `snake_case` identifier assigned centrally by this registry. Sections whose headings are not well-known keys are **custom sections**; their keys are derived from the heading the same way (lowercase, whitespace → `_`) and are also plain `snake_case`. See [Core spec §5.1](../portable-ai-core-spec-v0.3.md#51-section-anatomy).

## 2. Versioning

- Registry **v1** is **additive-only**. Keys defined here will not be removed, renamed, or repurposed within v1.
- New keys MAY be added to v1 via a minor registry update accompanied by an entry in `CHANGELOG.md`.
- A new registry major version (`v2`) is a breaking change and requires an ADR.

Editors SHOULD ship with the registry embedded at build time and SHOULD warn (not error) when they encounter a well-known key from a registry version newer than they recognize.

## 3. Rules for well-known keys

- Keys MUST be `snake_case` (lowercase ASCII letters, digits, and `_`).
- Keys MUST NOT contain `.` or `/`.
- The section heading in Markdown is the human-readable **title**. The mapping from title → key is: lowercase the title, replace runs of whitespace with `_`, strip punctuation. Example: `Communication Style` → `communication_style`.
- Titles are **not** normative; editors MAY use different titles as long as the key resolves to the same registry entry.

## 4. Registered keys (v1)

Each entry specifies the key, its recommended title, its scope (which document types typically use it), and a short description. All entries below are recommended, not required. A conforming document MAY use any subset.

### 4.1 Persona document keys

| Key | Recommended title | Description |
|---|---|---|
| `profile` | Profile | Identity, role, location, timezone, primary languages. |
| `preferences` | Preferences | How the person likes to work, receive information, or interact. |
| `persona` | Persona | Voice, tone, style, personality context. |
| `projects` | Projects | Active work worth persisting across sessions. |
| `interests` | Interests | Topics the person cares about. |
| `knowledge_expertise` | Knowledge & Expertise | Domains where the person has deep knowledge. |
| `decision_style` | Decision Style | How the person makes decisions. |
| `communication_style` | Communication Style | Preferred communication modes and conventions. |
| `ai_collaboration` | AI Collaboration | Preferences and instructions for working with AI assistants. |

### 4.2 Software Project document keys

| Key | Recommended title | Description |
|---|---|---|
| `overview` | Overview | What the project is, its purpose, and the problem it solves. |
| `architecture` | Architecture | High-level structure: components, services, data flow, boundaries. |
| `tech_stack` | Tech Stack | Languages, frameworks, key libraries, datastores, and infrastructure. |
| `conventions` | Conventions | Coding standards, naming, formatting, testing, and review practices. |
| `domain_glossary` | Domain Glossary | Domain terms, entities, and business concepts and their meanings. |
| `key_decisions` | Key Decisions | Significant technical decisions and their rationale (ADR-style pointers). |
| `constraints` | Constraints & Non-Goals | Hard constraints, explicit non-goals, and things intentionally out of scope. |
| `environments` | Environments & Ops | Environments, build/deploy/release process, and operational notes. |
| `dependencies` | Dependencies & Integrations | External services, APIs, and systems the project depends on or integrates with. |

### 4.3 Cross-document keys

Keys usable in any document type.

| Key | Recommended title | Description |
|---|---|---|
| `notes` | Notes | Freeform notes that don't fit elsewhere. |
| `changelog` | Changelog | Human-readable summary of changes to this document. |

## 5. Custom sections

Any section that is not in this registry is a custom section, with a plain key derived from its heading. See [Core spec §5.1](../portable-ai-core-spec-v0.3.md#51-section-anatomy) and §5.3, and [ADR-0007](../../adr/0007-custom-sections-plain-keys.md).

## 6. Requesting a new well-known key

New well-known keys are proposed through the governance process defined in [`GOVERNANCE.md`](../../GOVERNANCE.md). A proposal SHOULD include:

- The proposed key and recommended title
- The document type(s) it targets
- A rationale for why it belongs in the shared registry rather than as a custom section
- At least one worked example

## 7. Changelog

- **v1 (2026-07-06, DRAFT)** — added Software Project document keys (§4.2): `overview`, `architecture`, `tech_stack`, `conventions`, `domain_glossary`, `key_decisions`, `constraints`, `environments`, `dependencies` (#74). Additive within v1.
- **v1 (2026-07-04, DRAFT)** — initial published registry alongside spec v0.3.

## 8. Related documents

- [PortableAI Core Spec v0.3](../portable-ai-core-spec-v0.3.md)
- [PortableAI Persona Spec v0.3](../portable-ai-persona-spec-v0.3.md)
- [PortableAI Software Project Spec v0.3](../portable-ai-software-project-spec-v0.3.md)
