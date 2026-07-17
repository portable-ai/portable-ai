# Naming convention

This document is the canonical spelling rule for the PortableAI project.
It does not change the standard, the wire format, or any existing document.
It makes the project's existing multi-surface naming explicit so that
documentation, prompts, filenames, and identifiers stay consistent.

## Summary

| Surface | Form | Example |
| --- | --- | --- |
| Brand / standard / proper name | `PortableAI` | The PortableAI standard, PortableAI.org |
| Descriptive prose (the concept) | `portable AI` | portable AI context, a portable AI profile |
| Repos, paths, filenames, URL path slugs | `portable-ai` | portable-ai/portable-ai, portable-ai-core-spec-v0.3.md |
| Domains / compact hostnames | `portableai` | portableai.org |
| Metadata directory | `.portableai` | .portableai/project.yaml |
| Code constants / globals | `PORTABLEAI_*` or language-local camelCase | PORTABLEAIPROMPTS, portableAi |
| Spec machine field (stable) | `PortableAI` | standard: PortableAI |

## Rules

1. Proper name. The standard and project are PortableAI (one word, capital P,
   capital AI). Use this in titles, first mentions, and when naming the standard
   itself. Do not use a space ("Portable AI") as the proper name.

2. Descriptive prose. Use portable AI (two words, lowercase except at the start
   of a sentence) only when describing the general idea of portable context,
   not as the proper name of this standard.
   - Good: "Users should own their portable AI context."
   - Good: "Open the document in the PortableAI editor."

3. Technical slugs. Use portable-ai (lowercase, hyphenated) for repositories,
   path segments, file basenames, URL path slugs, and package-style names.
   Hyphenation is the intended word separator here; "no spaces" does not mean
   "no separators." Never put spaces in a technical identifier.
   - Good: portable-ai-persona-spec-v0.3.md
   - Good: github.com/portable-ai/portable-ai

4. Compact machine forms are intentional, not drift. Some surfaces conventionally
   omit the hyphen. These are deliberate exceptions and must not be "corrected"
   to portable-ai:
   - Domains and compact hostnames use portableai (for example, portableai.org),
     because hyphens are unconventional in DNS names.
   - The metadata directory is .portableai (no hyphen). This dot-directory is an
     intentional, canonical machine form, consistent with common tool-directory
     conventions (for example, .github, .vscode). Do not rename it to
     .portable-ai.
   - Code identifiers use PORTABLEAI_* or language-local camelCase (for example,
     PORTABLEAIPROMPTS, portableAi), because hyphens are invalid in identifiers.

5. Machine tokens stay stable. Do not change existing machine-readable values for
   branding or styling reasons. In particular, keep the front-matter value
   standard: PortableAI unchanged. Any change to a machine-readable field is an
   explicit, versioned spec change, not a documentation-style edit.

6. Sibling projects. Do not conflate PortableAI with PortableChat or other
   siblings. They are separate projects, not one shared name.

## Rationale

Keeping a distinctive one-word brand (PortableAI) preserves an ownable,
searchable name for the standard, while portable AI keeps running prose readable.
Technical slugs use portable-ai because kebab-case is the readable, conventional,
machine-safe form for repos, paths, and filenames. Domains, dot-directories, and
code identifiers use the compact portableai form only where a hyphen is
unconventional or invalid; these are intentional per-surface exceptions, not
inconsistencies to be eliminated.

## Non-goals

- This file is not a rebrand.
- This file does not require rewriting existing prose, issues, or release notes.
- This file does not authorize changing the standard: value or breaking existing
  documents.
- New user-facing copy should follow this matrix; historical material may retain
  older variants.
