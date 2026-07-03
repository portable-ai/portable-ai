# ADR-0001: Canonical Format is Markdown

**Status:** Accepted  
**Date:** 2026-07-03

## Context

Portable AI needs a canonical format that people can read, edit, version, and share without specialized software.

The format also needs to be easy for AI systems, developer tools, and future integrations to process.

## Decision

The canonical Portable AI User Model SHALL be a single GitHub-Flavored Markdown document using the `.md` file extension.

## Consequences

Markdown remains the source of truth.

Users can edit profiles with ordinary text editors and version them with Git.

Machine-readable formats such as JSON or provider-specific exports are derived from the Markdown profile rather than maintained separately.
