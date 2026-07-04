# ADR-0001: Canonical Format is Markdown

**Status:** Accepted  
**Date:** 2026-07-03

## Context

PortableAI needs a canonical format that people can read, edit, version, and share without specialized software.

The format also needs to be easy for AI systems, developer tools, and future integrations to process.

## Decision

The canonical PortableAI Persona SHALL be a single GitHub-Flavored Markdown PortableAI Document using the `.md` file extension.

## Consequences

Markdown remains the source of truth.

Users can edit PortableAI Documents with ordinary text editors and version them with Git.

Machine-readable formats such as JSON or provider-specific exports are derived from the Markdown document rather than maintained separately.