# Changelog

All notable changes to the PortableAI standard and reference implementation are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

Work toward **v0.3 (First Public Draft)** — tracked in the [v1.0 milestone](../../milestone/1).

### Added

- `SECURITY.md` — security policy and vulnerability reporting process
- `CHANGELOG.md` — this file
- ADR-0005: Non-Storage Principle
- `ai/codex-bootstrap.md` — moved from repo root (was `portable-ai.md`) for clarity
- **Core spec v0.3 (DRAFT)** — `spec/portable-ai-core-spec-v0.3.md` — shared envelope for all PortableAI documents: canonical format, front-matter identity, sections, integrity block, Non-Storage Principle, versioning (#45, #46, #48, #49)
- **Persona spec v0.3 (DRAFT)** — `spec/portable-ai-persona-spec-v0.3.md` — Persona-specific layer on top of Core (#45)
- **Well-Known Section Registry v1 (DRAFT)** — `spec/registry/well-known-sections-v1.md` — centrally assigned `snake_case` section keys, additive within v1 (#47)
- Skeleton drafts of `spec/portable-ai-core-spec-v0.3.md` and `spec/portable-ai-persona-spec-v0.3.md` (Core + Persona split)
- Project email identity at `portableai.org`: `inbox@` mailbox with aliases `security@`, `hello@`, `maintainers@`
- `README.md` Contact section and `GOVERNANCE.md` Contact section
- Website footer contact links to `hello@portableai.org` and `security@portableai.org`
- Reference editor now renders full GitHub-Flavored Markdown in the live preview via vendored `marked.js` v14.1.4 — headings, lists, tables, fenced code with language classes, task lists, and inline formatting all render correctly. Raw HTML in the source is escaped, so the preview is safe for Markdown from untrusted authors (#53).
- `THIRD_PARTY_NOTICES.md` — attribution for vendored third-party code (currently `marked.js`, MIT)
- **Tabbed reference editor**: the editor is now organized into three tabs — **Form**, **Markdown**, and **Preview** — that all edit the same underlying Markdown document. The Form tab renders structured inputs for each well-known section from the [Registry v1](spec/registry/well-known-sections-v1.md), including "+ Add" buttons for well-known sections not yet in the document. The Preview tab renders the parsed front-matter as a compact metadata card at the top of the preview instead of leaking raw YAML into the Markdown body.
- Persona template now ships with placeholder `e.g.` bullets under every well-known section so first-time users see what belongs in each section. Users replace or delete them (#22).
- **Empty-state landing** in the reference editor: fresh visitors now see "Nothing loaded yet · Load a profile or create a new one" with two equal-weight actions (**Load a sample**, **Open a file**) plus a secondary card that previews the AI-draft prompt with "Copy prompt" and "Show full instructions".
- **Restore-or-clear banner**: when a local draft exists in the browser, the editor no longer silently repopulates. It shows "You have a draft from a previous session." with **Restore** and **Clear** buttons so users can decide.
- **Edit / Read mode toggle** replaces the old Form / Markdown / Preview tab strip. The editor now has a single Markdown surface toggled between an Edit view (textarea) and a compact Read view.

### Changed

- **Reference editor redesign (PR A)**: dropped the Form tab entirely — the Markdown document is the only editing surface. Introduced Edit / Read modes, an empty state, and a restore-or-clear banner (see Added). Read mode uses a tighter type ramp (body 0.95rem, H1 1.15rem, H2 1.05rem, H3 0.95rem — all bold, 1.5 line-height) so profiles read like documents, not splash pages.
- **AI-draft prompt rewritten** to actively ask another AI to draft a PortableAI profile: Markdown first (works in every AI), best-effort downloadable `.md` file, standard filename `portableai-profile-YYYY-MM-DD.md`. The prompt never asks the user's name. Closes with instructions the user can act on: "You can take this file and load it into another AI, or open it in PortableAI to review or edit."
- **UI copy: Persona → Profile** as the umbrella noun users see. Hero tagline is now "PortableAI is an open standard that lets you take your **profile** anywhere." Editor heading is "Edit your profile." Sample-load button is "Load a sample" (was "New from Template"). File-open button is "Open a file" (was "Load Markdown"). Front-matter `standard: PortableAI Persona` is unchanged — Persona remains one *type* of profile.
- **Download filename** standardized to `portableai-profile-YYYY-MM-DD.md` (was `portable-ai-persona.md`) so profiles from any session line up predictably on disk.

- File naming standardized to lowercase kebab-case:
  - `spec/Portable_AI_Persona_Specification_v0.2.md` → `spec/portable-ai-persona-spec-v0.2.md`
  - `templates/Portable_AI_Persona_Template.md` → `templates/portable-ai-persona-template.md`
  - `examples/Example_Portable_AI_Persona.md` → `examples/example-portable-ai-persona.md`
- `README.md` repo tree updated to reflect the new structure
- Renamed "Specification" to "Spec" in prose across `README.md`, `ROADMAP.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`, `adr/0000-project-inception.md`, `ai/codex-bootstrap.md`, and `ai/project-bootstrap.md` (#44). The frozen v0.2 spec file is unchanged.
- Reference editor preview: replaced the hand-rolled Markdown-subset renderer (headings + lists + inline bold/italic/code only) with vendored `marked.js` for full GFM support (#53)
- Reference editor: canonical Markdown remains the single source of truth (ADR-0001); all three tabs read from and write to the same in-memory string. Front-matter is no longer visible in the Preview — it appears as a metadata card instead. Guarded `localStorage` access so the editor no longer crashes when opened from an opaque origin (e.g. bare `file://`) or when storage is disabled by policy.
- Form tab now renders document metadata as a read-only card (matching the Preview) instead of editable text inputs. Front-matter values are still editable on the Markdown tab, keeping the canonical Markdown as the single source of truth.
- Persona template bumped from `standard_version: 0.2` to `0.3` to match the shipped Core Spec draft; added the missing `# Notes` section; removed the placeholder `# Custom Sections` heading (custom sections belong under real reverse-DNS keyed headings).
- `SECURITY.md` now uses the real `security@portableai.org` address (removed the earlier placeholder note)

### Deprecated

- Spec version `v0.2` will be deprecated when `v0.3` is published.

## [0.2] — 2026-07-03

Initial private draft of the PortableAI Persona spec. Not publicly released.

- `spec/portable-ai-persona-spec-v0.2.md` (formerly `Portable_AI_Persona_Specification_v0.2.md`)
- Initial reference editor at PortableAI.org
- ADRs 0000 through 0004
