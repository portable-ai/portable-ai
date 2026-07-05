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
- Skeleton drafts of `spec/portable-ai-core-spec-v0.3.md` and `spec/portable-ai-persona-spec-v0.3.md` (Core + Persona split)
- Project email identity at `portableai.org`: `inbox@` mailbox with aliases `security@`, `hello@`, `maintainers@`
- `README.md` Contact section and `GOVERNANCE.md` Contact section
- Website footer contact links to `hello@portableai.org` and `security@portableai.org`

### Changed

- File naming standardized to lowercase kebab-case:
  - `spec/Portable_AI_Persona_Specification_v0.2.md` → `spec/portable-ai-persona-spec-v0.2.md`
  - `templates/Portable_AI_Persona_Template.md` → `templates/portable-ai-persona-template.md`
  - `examples/Example_Portable_AI_Persona.md` → `examples/example-portable-ai-persona.md`
- `README.md` repo tree updated to reflect the new structure
- `SECURITY.md` now uses the real `security@portableai.org` address (removed the earlier placeholder note)

### Deprecated

- Spec version `v0.2` will be deprecated when `v0.3` is published.

## [0.2] — 2026-07-03

Initial private draft of the PortableAI Persona spec. Not publicly released.

- `spec/portable-ai-persona-spec-v0.2.md` (formerly `Portable_AI_Persona_Specification_v0.2.md`)
- Initial reference editor at PortableAI.org
- ADRs 0000 through 0004
