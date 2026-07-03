# Design Decisions

This document records early design decisions for Portable AI.

## Canonical format is Markdown

The canonical Portable AI User Model is a single GitHub-Flavored Markdown document using the `.md` extension.

Reasoning:

- Markdown is human-readable.
- Markdown is widely supported.
- Markdown works well with Git.
- Markdown is easy for AI systems to ingest.

## YAML front matter is recommended but not required

Profiles may use YAML front matter for metadata, but a profile can still conform if equivalent metadata appears elsewhere in the document.

Reasoning:

- YAML front matter is widely supported.
- Requiring it would create unnecessary friction for simple profiles.

## AI-specific exports are derived

Provider-specific files, JSON exports, and other machine-readable formats should be generated from the canonical Markdown file.

Reasoning:

- Users should not maintain multiple versions manually.
- The Markdown profile remains the source of truth.

## The profile represents current state

The Portable AI User Model describes current durable information, not a full historical record.

Reasoning:

- Git and other version control systems are better suited for history.
- The profile should remain readable and organized.

## Custom sections are allowed

The specification recommends common sections but allows users and tools to add, remove, rename, and reorder sections.

Reasoning:

- People are different.
- The standard should guide without becoming rigid.
