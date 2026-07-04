# ADR-0005: Non-Storage Principle

**Status:** Accepted
**Date:** 2026-07-04

## Context

PortableAI's core philosophy is that people should own their context. The reference editor and PortableAI.org are intentionally designed as a **broker** — a tool that helps users create, edit, and move Markdown documents — not as a **database** that stores those documents on behalf of users.

Similar projects have blurred this line by adding accounts, cloud sync, or "convenience" persistence, and ended up as de facto vendors of the very data users came to them to own. That failure mode is what PortableAI is trying to avoid.

## Decision

**PortableAI.org and its reference editor SHALL NOT store user PortableAI documents on any server.**

Specifically:

1. No server-side database of user documents.
2. No account system that persists user content.
3. No telemetry that captures document content.
4. Browser `localStorage` used for draft persistence is permitted (issue #32) and SHALL be:
   - Explicitly labeled as local-only in the UI
   - User-clearable with a visible control
   - Never transmitted off the user's device

Future ecosystem tools MAY offer optional storage, but any such tool MUST be a separate, clearly-labeled service and MUST NOT be presented as part of the PortableAI standard itself.

## Consequences

- The website can be hosted as a fully static site.
- PortableAI has nothing to leak, sell, subpoena, or be breached for.
- Users get true portability: their Markdown file is the source of truth, and PortableAI has no lock-in leverage.
- Convenience features like cross-device sync are explicitly out of scope for v1.
- This ADR SHALL be referenced from the Core spec (see #49).

## Related

- ADR-0004: Reference Editor Requires No Login
- Issue #49: ADR-0005 Non-Storage Principle + Core spec section
- Issue #32: Local Profile Persistence
