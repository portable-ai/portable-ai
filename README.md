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
├── adr/               Architecture Decision Records
├── ai/                Bootstrap prompts for AI coding assistants
├── examples/          Example PortableAI documents
├── spec/              PortableAI specs (Core + Persona)
├── templates/         Starter templates
└── website/           PortableAI.org site and reference editor
```

## Canonical format

The canonical PortableAI Persona format is a single **GitHub-Flavored Markdown** PortableAI Document using the `.md` file extension.

AI-specific exports, JSON representations, validation formats, and future integrations are derived from that canonical Markdown document.

## Website

The `website/` directory contains the PortableAI.org site and reference editor.

Version 1 intentionally uses plain HTML, CSS, and JavaScript with no framework, no backend, no login, and no database.

## Project status

This project is in early draft status. The current published spec is **v0.2**. Work toward **v0.3** (First Public Draft) is tracked in the [v1.0 milestone](../../milestone/1).

The v0.3 spec is being split into two documents:

- `spec/portable-ai-core-spec-v0.3.md` — the shared PortableAI Document envelope
- `spec/portable-ai-persona-spec-v0.3.md` — Persona-specific sections

## License

This project is licensed under the MIT License.