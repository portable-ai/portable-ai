# PortableAI

PortableAI is an open standard that helps people own their AI context.

The first PortableAI document type is the **PortableAI Persona**: a single, human-readable Markdown document that captures durable context about a person so it can be used across AI assistants, tools, and workflows.

## Core idea

People should own their context.

A PortableAI Persona is intended to be:

- Human-readable first
- Vendor neutral
- Git-friendly
- Easy to edit manually
- Easy for AI systems to understand
- Useful without login, cloud storage, or a proprietary platform

## Repository contents

```text
.
├── README.md
├── WHY.md
├── LICENSE
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── GOVERNANCE.md
├── ROADMAP.md
├── SECURITY.md
├── CHANGELOG.md
├── THIRD_PARTY_NOTICES.md
├── adr/               Architecture Decision Records
├── ai/                Bootstrap prompts for AI coding assistants
├── docs/              Project docs (release checklist, archived material)
├── examples/          Example PortableAI documents (see examples/profiles/)
├── spec/              PortableAI specs (Core, Persona, Software Project) + registry
├── tests/             Reference-editor smoke tests and screenshot harness
└── website/           PortableAI.org site and reference editor (incl. templates/)
```

## Canonical format

The canonical PortableAI Persona format is a single **GitHub-Flavored Markdown** PortableAI Document using the `.md` file extension.

AI-specific exports, JSON representations, validation formats, and future integrations are derived from that canonical Markdown document.

## Website

The `website/` directory contains the PortableAI.org site and reference editor.

Version 1 intentionally uses plain HTML, CSS, and JavaScript with no framework, no backend, no login, and no database.

## Project status

The current released spec is **v0.3** (First Public Draft), published 2026-07-07. Future work is tracked in the [v0.3.0 milestone](../../milestone/1).

The v0.3 spec is split into layered documents:

- `spec/portable-ai-core-spec-v0.3.md` — the shared PortableAI Document envelope
- `spec/portable-ai-persona-spec-v0.3.md` — Persona-specific sections
- `spec/portable-ai-software-project-spec-v0.3.md` — Software Project-specific sections

## Contact

- General: **hello@portableai.org**
- Security: **security@portableai.org** (see [SECURITY.md](SECURITY.md))
- Maintainers: **maintainers@portableai.org** (see [GOVERNANCE.md](GOVERNANCE.md))

## License

This project is licensed under the MIT License.