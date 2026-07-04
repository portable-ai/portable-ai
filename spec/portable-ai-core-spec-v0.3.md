---
standard: PortableAI Core
spec_version: 0.3-draft
document_type: spec
status: DRAFT
---

# PortableAI Core Spec v0.3 (DRAFT)

> **Status: DRAFT skeleton.** This file exists to reserve the shape of the Core spec split from the v0.2 Persona spec. Content will land through the issues on the [v1.0 milestone](../../milestone/1). Do not treat this document as normative yet.

## Purpose

The **Core spec** defines the shared envelope for every PortableAI document, independent of document type. A Persona spec, a Preferences spec, or any future document type will layer on top of this envelope.

The Core spec covers:

- Canonical file format (GitHub-Flavored Markdown, `.md`)
- Required and optional YAML front-matter fields (see #46)
- Well-known section registry rules (see #47)
- Custom section naming (reverse-DNS)
- Optional integrity block (SHA-256 body hash) (see #48)
- The Non-Storage Principle (see ADR-0005 and #49)

## Non-goals

- Persona-specific section semantics (those live in `portable-ai-persona-spec-v0.3.md`)
- Provider-specific export formats
- Validation tooling specification (see #29, deferred to Future)

## Open sections (to be written)

- [ ] Document identity — `document_type`, `document_id` (ULID), `spec_version`, `language`
- [ ] Sections block in front-matter — key/well_known/title/updated/source
- [ ] Well-known section registry reference
- [ ] Custom section rules
- [ ] Integrity block format and hash scope
- [ ] Non-Storage Principle (normative statement)
- [ ] Versioning and compatibility rules
- [ ] Reserved `document_type: patch` (see #52, deferred)

## Related issues

- #45 Split spec into Core + Persona
- #46 Extended YAML front-matter
- #47 Well-Known Section Registry
- #48 Integrity block
- #49 ADR-0005 + Core spec section
- #52 Reserve `document_type: patch` (Future)
