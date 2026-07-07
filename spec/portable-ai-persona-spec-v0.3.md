---
standard: PortableAI Persona
spec_version: 0.3-draft
document_type: spec
status: DRAFT
---

# PortableAI Persona Spec v0.3 (DRAFT)

> **Status: DRAFT.** Persona-specific sections layered on top of the [PortableAI Core spec](portable-ai-core-spec-v0.3.md). Content is subject to change until v0.3 is released. See the [v1.0 milestone](../../milestone/1).

## Purpose

The **Persona spec** defines the sections, semantics, and conventions for a PortableAI Persona document — a Markdown document that captures durable context about a person so it can be used across AI assistants, tools, and workflows.

This spec builds on the [PortableAI Core spec](portable-ai-core-spec-v0.3.md). A Persona document is a PortableAI Document with `document_type: persona`.

## Well-known sections

Persona documents use the Persona keys defined in the [Well-Known Section Registry v1](registry/well-known-sections-v1.md#41-persona-document-keys):

- `profile`
- `preferences`
- `persona`
- `projects`
- `interests`
- `knowledge_expertise`
- `decision_style`
- `communication_style`
- `ai_collaboration`

See the registry for descriptions and recommended titles.

## Custom sections

Custom sections use plain keys derived from their heading (e.g., `## Onboarding Notes` → `onboarding_notes`) per the Core spec §5.1 and §5.3.

## Open sections (to be written)

- [ ] Required vs. optional sections
- [ ] Recommended field shapes within each well-known section
- [ ] Guidance for AI-generated Personas (see #30, Future)
- [ ] Persona-specific export mappings
- [ ] Relationship to the v0.2 monolithic spec (migration path)

## Migration from v0.2

The v0.2 spec (`portable-ai-persona-spec-v0.2.md`) will remain in-repo through the v0.3 release. A migration note will land as part of #45.

## Related issues

- #44 Rename "Specification" → "Spec"
- #45 Split spec into Core + Persona
- #46 Extended YAML front-matter
- #47 Well-Known Section Registry
- #48 Integrity block
