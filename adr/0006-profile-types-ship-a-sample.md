# ADR-0006: Every Profile Type Ships a Reference Sample

**Status:** Accepted
**Date:** 2026-07-06

## Context

PortableAI ships a small set of profile *types* (at launch: Persona and
Software Project). New types are expected over time (issue #78 tracks a third).

Sample profiles are the fastest way for a person — or an AI — to understand
what a type is for and what "good" looks like. Without a concrete example,
a type is just a spec: harder to adopt, harder to review, and easy to drift
away from the current template. Issue #36 originally asked for "at least five"
samples, but the more durable rule is not a fixed count — it is that no
profile type should exist without a canonical example to point at.

## Decision

**Every supported PortableAI profile type MUST ship at least one reference
sample profile under `examples/profiles/`.**

Specifically:

1. A profile type is not considered launch-ready until it has at least one
   sample that uses the current template/spec for that type.
2. Each sample MUST be spec-valid Markdown and loadable/copyable from the
   reference editor.
3. Adding a new profile type (e.g. #78) is not "done" until its sample lands
   in the same change set or an immediately following one.
4. Samples SHOULD demonstrate custom sections where they make the type
   clearer, once custom sections are supported (#23).

This supersedes the "at least five samples" acceptance criterion in #36. The
number of samples now follows from the number of supported types (currently
two: Persona + Software Project), not an arbitrary target.

## Consequences

- Sample coverage scales with the standard instead of chasing a fixed count.
- Reviewers get a built-in acceptance test for new types: "where is the sample?"
- The current two samples (`persona-jordan-rivera.md`,
  `software-project-tidesynth.md`) satisfy this rule for the two shipped types,
  so #36 can close.
- Future work on custom sections (#23) may enrich existing samples; that is an
  enhancement, not a blocker for this ADR.

## Related

- Issue #36: Sample Profiles (scope updated to per-type coverage; closed)
- Issue #78: Third profile type (must ship its own sample)
- Issue #23: Custom sections (samples may demonstrate these once supported)
- ADR-0002: Single Document Standard
