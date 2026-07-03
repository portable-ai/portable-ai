# Portable AI

Portable AI is an open standard that helps people own their AI context.

The first standard in this project is the **Portable AI User Model**: a single, human-readable Markdown document that captures durable information about a person so it can be used across AI assistants, tools, and workflows.

## Core idea

People should own their context.

A Portable AI User Model is intended to be:

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
├── adr/
├── examples/
├── spec/
├── templates/
└── website/
```

## Canonical format

The canonical Portable AI User Model format is a single **GitHub-Flavored Markdown** file using the `.md` file extension.

AI-specific exports, JSON representations, validation formats, and future integrations are derived from that canonical Markdown document.

## Website

The `website/` directory contains the PortableAI.org site and reference editor.

Version 1 intentionally uses plain HTML, CSS, and JavaScript with no framework, no backend, no login, and no database.

## Project status

This project is in early draft status. The current specification is **v0.2 Draft**.

## License

This project is licensed under the MIT License.
