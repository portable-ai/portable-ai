# PortableAI Persona Specification

**Version:** 0.2 Draft  
**Date:** July 3, 2026

## 1. Purpose

The PortableAI Persona is an open, vendor-neutral standard for representing durable context about a person in a format that is both human-readable and AI-friendly.

The goal is to allow individuals, not AI providers, to own and manage a canonical PortableAI Document that can be used across AI systems.

This specification defines that canonical format.

---

## 2. Design Principles

The standard SHALL:

- Be human-readable first.
- Use existing, widely adopted formats.
- Be simple enough to edit manually.
- Be useful without specialized software.
- Be portable across AI platforms.
- Be version controlled.
- Be extensible without breaking compatibility.

---

## 3. Canonical Format

The canonical representation SHALL be a single GitHub-Flavored Markdown PortableAI Document using the `.md` file extension.

Conforming implementations MAY use any internal representation. However, the canonical exchange format defined by this specification SHALL be a single GitHub-Flavored Markdown document.

Future representations, including JSON, YAML, XML, AI-specific formats, or other machine-readable formats, are derived formats.

---

## 4. Ownership

The user owns the canonical context.

AI providers, editors, websites, and applications are consumers of the context rather than its owners.

---

## 5. Scope

The Persona contains durable context.

Examples include:

- Identity
- Preferences
- Persona
- Interests
- Projects
- Communication style
- Decision style
- Knowledge and expertise
- AI collaboration instructions

The following SHOULD NOT be stored in the canonical PortableAI Document:

- Temporary conversation context
- Working memory
- Calendar events
- Shopping lists
- Session-specific information

---

## 6. Metadata

A PortableAI Document MAY begin with a YAML front matter block containing metadata.

YAML front matter is RECOMMENDED because it is widely supported by GitHub and many Markdown tools, but it is NOT REQUIRED.

If YAML front matter is not used, equivalent metadata MUST appear elsewhere in the document.

Recommended fields:

- Profile Name
- Standard Version
- Profile Version
- Last Updated

Example:

```yaml
---
standard: PortableAI Persona
standard_version: 0.2
profile_name: Example PortableAI Persona
profile_version: 1.0.0
last_updated: 2026-07-03
---
```

Additional metadata MAY be added.

---

## 7. Recommended Sections

Preferred sections:

1. Profile
2. Preferences
3. Persona
4. Projects
5. Interests
6. Knowledge & Expertise
7. Decision Style
8. Communication Style
9. AI Collaboration Instructions
10. Custom Sections

Applications SHOULD suggest these sections but MUST allow users to add, remove, rename, and reorder sections.

---

## 8. Validity

A conforming PortableAI Persona MUST:

- Be valid GitHub-Flavored Markdown.
- Contain a single canonical PortableAI Document.
- Include a profile version.
- Contain durable user context.
- Remain readable without specialized software.

---

## 9. Current State

The PortableAI Document represents the user's current understanding of themselves.

Historical versions belong in version control or other external systems.

Detailed change history is outside the scope of this specification.

---

## 10. AI-Specific Exports

The Markdown document is the canonical source.

AI-specific formats SHOULD be generated automatically whenever possible.

Users SHOULD NOT be required to manually maintain multiple provider-specific documents.

AI-specific exports are a future extension for the reference editor and are not required for v0.2 draft conformance.

---

## 11. Reference Editor Requirements

A v0.2 reference editor SHOULD:

- Create new PortableAI Documents.
- Load existing Markdown documents.
- Edit all sections as Markdown.
- Allow custom sections.
- Export canonical Markdown.

The reference editor SHOULD require no account for basic use.

---

## 12. Future Extensions

Future versions MAY define:

- JSON representation
- Validation rules
- AI-specific exports
- Synchronization mechanisms
- Import/export APIs
- Digital signatures
- Optional confidence or interest-strength metadata

Future extensions MUST preserve compatibility with the canonical Markdown document.

---

## 13. Out of Scope

This specification does not define:

- Cloud storage
- Authentication
- User accounts
- AI memory systems
- Privacy policies
- Synchronization protocols

---

## 14. Philosophy

The PortableAI Persona is intended to become a durable personal artifact that remains useful regardless of which AI systems exist in the future.

People should own their context.