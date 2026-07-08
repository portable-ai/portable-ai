# ADR-0008: Every Profile Type Ships a Template

**Status:** Accepted
**Date:** 2026-07-07

## Context

PortableAI ships a small set of profile *types* (at launch: Persona and
Software Project), and more are expected over time (issue #78 tracks a third).

ADR-0006 already requires every type to ship a worked **sample** under
`examples/profiles/` so people and AIs can see what "good" looks like. Samples
are complete, filled-in documents meant to be *read*.

A **template** is the complementary artifact: a blank, spec-valid skeleton with
placeholder (`e.g. …`) guidance under each well-known section, meant to be
*filled in*. The reference editor's "Load a template" flow starts a new profile
from one. Templates and samples are not interchangeable — a template with no
placeholders is just an empty file, and a sample loaded as a starting point
forces the user to delete someone else's content.

Two problems motivated writing this down:

1. **Coverage gap.** At the time of writing, only Persona had a template.
   Software Project had a sample but no template, so a user could not start a
   new Software Project profile from a skeleton in the editor.
2. **Drift.** The editor originally embedded a hand-copied duplicate of the
   Persona template inside `website/js/app.js`. Editing the template `.md` did
   nothing until someone also edited the JS, so the two could silently diverge.

## Decision

**Every supported PortableAI profile type MUST ship a blank template under
`website/templates/`, and templates are the single source of truth for the
editor's "Load a template" flow.**

Specifically:

1. Each profile type MUST have a template at
   `website/templates/portable-ai-<document_type>-template.md`. The `<document_type>`
   segment matches the type key used in the specs and in `js/prompt.js` /
   `js/templates.js`, so **UI label ↔ `document_type` key ↔ template filename**
   are mechanically linked.
2. A template MUST be spec-valid for its type (correct front-matter and
   well-known H1 sections) and SHOULD include short `e.g.` placeholder guidance
   under each section so a first-time user knows what belongs there.
3. Templates MUST be kept current with the spec. When a type's spec or
   well-known sections change, its template is updated in the same change set.
4. The reference editor MUST load templates by fetching the `.md` file at load
   time (via the `js/templates.js` registry), not from any embedded copy.
   Clarifying a template or adding an example is therefore a pure content edit
   to the `.md` with **no JavaScript change and no site release**.
5. Adding a new profile type (e.g. #78) is not "done" until its template lands
   in the same change set — alongside its sample (ADR-0006) — and one entry is
   added to the `js/templates.js` registry.

## Consequences

- Template coverage scales with the standard, the same way sample coverage does
  under ADR-0006. Reviewers get a second built-in acceptance test for new types:
  "where is the template?"
- The editor's type picker is data-driven from the registry, so a new type
  appears automatically once its entry and `.md` are added.
- Template wording and examples can be improved by editing Markdown only; the
  shipped JS never needs to change for a content tweak, removing the drift risk.
- Loading a template requires the site to be served over http(s) (as it always
  is alongside cloud AIs); loading a template from a bare `file://` origin is
  intentionally not supported and fails with a clear message.
- The current templates (`portable-ai-persona-template.md`,
  `portable-ai-software-project-template.md`) satisfy this rule for the two
  shipped types.

## Related

- ADR-0006: Every Profile Type Ships a Reference Sample (the sample counterpart)
- ADR-0001: Canonical Markdown
- ADR-0007: Custom Sections Use Plain Derived Keys
- Issue #78: Third profile type (must ship its own template and sample)
