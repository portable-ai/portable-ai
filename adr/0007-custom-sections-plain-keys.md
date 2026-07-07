# ADR-0007: Custom Sections Use Plain Derived Keys, Not Reverse-DNS

**Status:** Accepted
**Date:** 2026-07-06

## Context

The v0.3 Core Spec draft required custom sections — any `##` section whose
heading is not a well-known registry key — to carry a **reverse-DNS key**
(e.g., `org.refinery.david/negotiation_style`, with a mandatory `.` and `/`).
The intent was borrowed from ecosystems that need globally unique,
namespaced identifiers to avoid semantic collisions across many independent
producers and consumers.

That intent does not fit PortableAI:

1. **PortableAI is a single-user, single-document format.** There is no shared
   namespace to collide in. A person's Document is authored and read by that
   person (and the AIs they hand it to). Cross-ecosystem namespacing solves a
   problem this format does not have.
2. **Reverse-DNS never solved intra-document uniqueness anyway.** Nothing stops
   an author from typing two `## Negotiation Style` headings. The reverse-DNS
   rule added ceremony without actually guaranteeing the uniqueness it implied.
3. **It fights the project's core principle.** PortableAI is human-readable
   first and favors "quiet over loud" — one label per concept, remove before
   you add. Nobody wants to type or read
   `org.refinery.david/negotiation_style` when they mean "Negotiation Style."
   The reverse-DNS requirement is exactly the kind of cognitive noise the
   project exists to avoid.

Well-known sections already use a simple, readable derivation: the heading is
matched case-insensitively to the registry with spaces converted to `_`
(`Communication Style` → `communication_style`). Custom sections should use the
same mechanism — there is no reason for the two to diverge.

## Decision

**Custom sections use plain derived keys, not reverse-DNS. The reverse-DNS
requirement is removed entirely — it is not downgraded to a `SHOULD` or a
`MAY`, and it is not a recommendation.**

Specifically:

1. A **custom section** is any `##` section whose heading does not match a
   well-known key in the Well-Known Section Registry.
2. Its **key is derived from the heading** using the same rule as well-known
   keys: lowercased, trimmed, with runs of whitespace converted to a single
   `_` (`Negotiation Style` → `negotiation_style`). No `.` or `/` is required
   or expected.
3. Matching is **case-insensitive**. `Negotiation Style` and
   `negotiation style` resolve to the same key.
4. When listed in the `sections` block, a custom section is flagged
   `well_known: false`. Well-known sections are `well_known: true`. This is the
   only distinction the metadata draws between them.
5. If two headings in the same Document derive to the **same key**, that is the
   **author's choice**; both sections MUST still be preserved verbatim
   (per Core Spec §10). Editors MUST NOT merge, rename, or drop either one.
6. Editors MUST continue to preserve unrecognized sections on save
   (Core Spec §10, unchanged).

This supersedes the reverse-DNS rules introduced alongside the v0.3 Core Spec
draft (Core §5.1, §5.2, §5.3 and the corresponding lines in the Persona spec,
Software Project spec, and Well-Known Section Registry v1).

## Consequences

- Custom sections become as readable and low-friction as well-known ones:
  `## Negotiation Style` is the whole story. No namespace ceremony.
- One derivation rule now covers both well-known and custom keys, so the spec
  and any editor code have less to explain and less to enforce.
- The format no longer implies a uniqueness guarantee it never delivered.
  Duplicate-key headings are legal, explicitly the author's call, and always
  preserved.
- Spec files must be reconciled to remove every reverse-DNS reference (this is
  a spec-only change; no samples or templates used reverse-DNS keys in body
  content, so no sample migration is needed).
- The `document_id` remains the mechanism for cross-document identity;
  section keys are intentionally scoped to within a single Document.

## Related

- Issue #23: Custom sections (this ADR sets the model; editor "Add section"
  helper follows in a separate change)
- ADR-0001: Canonical Markdown
- ADR-0002: Single Document Standard
- Core Spec §5.1–§5.3 (Section anatomy, `sections` block, Custom sections)
- Core Spec §10: Compatibility (preservation of unrecognized sections — unchanged)
- Well-Known Section Registry v1
