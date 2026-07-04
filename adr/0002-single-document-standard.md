# ADR-0002: Single Document Standard

**Status:** Accepted  
**Date:** 2026-07-03

## Context

A portable Persona could be represented as many files, a database, a structured schema, or a single document.

The project prioritizes portability, readability, and ease of adoption.

## Decision

Each PortableAI Persona SHALL have one canonical source document.

Supporting files, generated exports, and AI-specific representations MAY exist, but they are not the canonical PortableAI Document.

## Consequences

Users do not need to understand a folder structure or export pipeline to maintain their context.

The PortableAI Document can be downloaded, emailed, committed to Git, or shared with an AI system as one readable file.

Large or advanced implementations may organize internal data however they choose, but the canonical exchange format remains one Markdown document.