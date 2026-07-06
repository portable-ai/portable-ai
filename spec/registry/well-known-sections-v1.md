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

A **well-known key** is a `snake_case` identifier assigned centrally by this registry. Custom sections use reverse-DNS keys instead; see [Core spec §5.1](../portable-ai-core-spec-v0.3.md#51-section-anatomy).

## 2. Versioning

- Registry **v1** is **additive-only**. Keys defined here will not be removed, renamed, or repurposed within v1.
- New keys MAY be added to v1 via a minor registry update accompanied by an entry in `CHANGELOG.md`.
- A new registry major version (`v2`) is a breaking change and requires an ADR.

Editors SHOULD ship with the registry embedded at build time and SHOULD warn (not error) when they encounter a well-known key from a registry version newer than they recognize.

## 3. Rules for well-known keys

- Keys MUST be `snake_case` (lowercase ASCII letters, digits, and `_`).
- Keys MUST NOT contain `.` or `/` (those are reserved for reverse-DNS custom keys).
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

### 4.2 Cross-document keys

Keys usable in any document type.

| Key | Recommended title | Description |
|---|---|---|
| `notes` | Notes | Freeform notes that don't fit elsewhere. |
| `changelog` | Changelog | Human-readable summary of changes to this document. |

## 5. Custom sections

Any section that is not in this registry MUST use a reverse-DNS custom key. See [Core spec §5.1](../portable-ai-core-spec-v0.3.md#51-section-anatomy) and §5.3.

## 6. Requesting a new well-known key

New well-known keys are proposed through the governance process defined in [`GOVERNANCE.md`](../../GOVERNANCE.md). A proposal SHOULD include:

- The proposed key and recommended title
- The document type(s) it targets
- A rationale for why it belongs in the shared registry rather than as a custom reverse-DNS section
- At least one worked example

## 7. Changelog

- **v1 (2026-07-04, DRAFT)** — initial published registry alongside spec v0.3.

## 8. Related documents

- [PortableAI Core Spec v0.3](../portable-ai-core-spec-v0.3.md)
- [PortableAI Persona Spec v0.3](../portable-ai-persona-spec-v0.3.md)
