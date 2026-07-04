---
standard: PortableAI Persona
spec_version: 0.3-draft
document_type: spec
status: DRAFT
---

# PortableAI Persona Spec v0.3 (DRAFT)

> **Status: DRAFT skeleton.** This file exists to reserve the shape of the Persona spec once it is split from the v0.2 monolithic spec. Content will land through the issues on the [v1.0 milestone](../../milestone/1). Do not treat this document as normative yet.

## Purpose

The **Persona spec** defines the sections, semantics, and conventions for a PortableAI Persona document — a Markdown document that captures durable context about a person so it can be used across AI assistants, tools, and workflows.

This spec builds on the [PortableAI Core spec](portable-ai-core-spec-v0.3.md). A Persona document is a PortableAI Document with `document_type: persona`.

## Well-known sections (planned)

Section keys use `snake_case`. Full definitions land through issue #47.

- `profile` — identity, role, location, timezone, languages
- `preferences` — how the person likes to work and receive information
- `persona` — voice, style, personality context
- `projects` — active work worth persisting across sessions
- `interests` — topics the person cares about
- `knowledge_expertise` — domains of deep knowledge
- `decision_style` — how the person makes decisions
- `communication_style` — how the person prefers to communicate
- `ai_collaboration` — preferences for working with AI assistants

## Custom sections

Custom sections MUST use reverse-DNS keys (e.g., `org.example.team/onboarding_notes`) per the Core spec.

## Open sections (to be written)

- [ ] Required vs. optional sections
- [ ] Recommended field shapes within each well-known section
- [ ] Guidance for AI-generated Personas (see #30, Future)
- [ ] Persona-specific export mappings
- [ ] Relationship to the v0.2 monolithic spec (migration path)

## Migration from v0.2

The v0.2 spec (`portable-ai-persona-spec-v0.2.md`) will remain in-repo through the v0.3 release. A migration note will land as part of #45.

## Related issues

- #44 Rename Specification → Spec
- #45 Split spec into Core + Persona
- #46 Extended YAML front-matter
- #47 Well-Known Section Registry
- #48 Integrity block
