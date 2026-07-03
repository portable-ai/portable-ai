# ADR-0003: AI Exports are Derived

**Status:** Accepted  
**Date:** 2026-07-03

## Context

Different AI systems may eventually prefer different profile formats, prompts, summaries, or structured inputs.

If users manually maintain separate files for each provider, the project recreates the fragmentation it is trying to solve.

## Decision

AI-specific exports SHOULD be generated from the canonical Markdown profile whenever possible.

Users SHOULD NOT be required to manually maintain multiple provider-specific profiles.

## Consequences

The Markdown profile remains the source of truth.

Provider-specific formats can evolve independently without changing the canonical user-owned profile.

Future tools may generate exports for different AI systems, but those exports are implementation artifacts rather than the standard itself.
