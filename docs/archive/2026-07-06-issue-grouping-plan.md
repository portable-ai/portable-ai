# PortableAI — issue grouping plan (frozen snapshot, 2026-07-06)

> **Frozen historical record.** Captures the issue-triage and working-set plan as of
> 2026-07-06. Not maintained — see the live issue tracker for current status. Numbers and
> statuses reflect that date only.

The open issues were grouped into logical, shippable **working sets**, each becoming one
feature branch off `dev` → PR into `dev` → delete branch. Ordered so dependencies land first.

## Group 0 — Audit & reconcile (#57) — DONE 2026-07-06

Cross-referencing issues against the repo showed the tracker had drifted from the code.
Outcome of the audit:

**Closed as verified-complete:** #45 (spec split), #54 (SECURITY + CHANGELOG), #50
(codex-bootstrap move), #48 (integrity block specified), #52 (`document_type: patch`
reserved), #60 (email aliases wired). #57 itself closed with a summary.

**Rescoped (kept open, reduced):** #32 (persistence largely shipped in PR A — remaining:
explicit "clear all" + shared-computer copy), #44 (rename mostly done — remaining: one
core-spec line; `learn.html` L100 intentionally kept as prose), #51 (filenames already
kebab-case — remaining: eventual retirement of the frozen v0.2 file).

**#24** (Export Prompt Guide) closed and absorbed into the new "Get a prompt" epic (#73/#75).

Result: 28 → 22 open, then +1 epic and 6 children added (see Group 5).

## Group 1 — Spec finalization (#44, #51, #52)

Lock the standard's naming + housekeeping in `spec/`.
- #44 — fix the one remaining "Specification" in the live core spec (L67 → "Spec"); the
  frozen v0.2 monolithic spec is intentionally left unchanged; `learn.html` L100 kept as prose.
- #51 — content filenames already kebab-case (requirement met). The v0.2 file is a
  **deliberately frozen migration reference**, retired later under #27 once v0.3 is published —
  NOT deleted now.
- #52 — verified already reserved in the core spec (no edit needed).
- Branch: `feature/spec-finalization`.

## Group 2 — Editor features (#23, #32)

Reference-editor surface (`website/`).
- #32 — remaining "clear all" + shared-computer copy (verify against PR A behavior first).
- #23 — Custom Sections (add/rename/preserve in Markdown + Read view).
- Branch: `feature/editor-onramp`. (Note: #24 moved to Group 5.)

## Group 3 — Website polish & footer (#43, #35)

Presentation layer, after editor features.
- #43 — footer origin (Ardmore, PA), version, timestamp.
- #35 — typography/spacing/mobile/accessibility pass.
- Branch: `feature/website-polish`.

## Group 4 — Documentation consistency & release readiness (#26, #36, #55, #56, #27)

Docs describe the settled spec/editor/site; land near the end.
- #56 README repo tree · #55 GOVERNANCE change process · #26 docs consistency sweep ·
  #36 sample profiles (≥5) · #27 First Public Draft release checklist (capstone; also the
  point at which the frozen v0.2 spec is retired).
- Branch: `feature/docs-and-release-readiness`.

## Group 5 — "Get a prompt" flow + multi-profile-type support (EPIC #73) — added 2026-07-06

Elevate the get-your-context-out flow to a first-class page and extend PortableAI from one
profile shape (Persona) to multiple profile types sharing the Core spec. Sequenced after
Group 1. Day 1 ships **Persona + Software Project**.
- #74 — Software Project spec (derived from Core) — Day 1
- #75 — "Get a prompt" dedicated page + third nav item (absorbs #24); full read-only readout,
  Copy top+bottom, no scroll box — Day 1
- #76 — Profile-type selector + finalize wording site-wide — Day 1
- #77 — Author thorough per-type extraction prompts — Day 1
- #78 — Brainstorm 3rd profile type — backlog
- #79 — Prompt library (save/share) — future/commercial, not tracked

## Deferred — Ecosystem (Future milestone, #28–#31)

JSON representation, validation tooling, AI-specific exports, GitHub integration. Out of scope
for First Public Draft; revisit post-v1. #29 (validator) is the natural first pickup.

## Epics (tracking only — never a branch)

#13 Standard, #14 Website, #15 Editor, #16 Ecosystem, #17 Documentation, #73 Get-a-prompt.

## Execution order (as of this snapshot)

1. Group 0 — audit (DONE). 2. Group 1 — spec finalization. 3. Group 5 — Get a prompt.
4. Group 2 — editor features. 5. Group 3 — website polish + footer. 6. Group 4 — docs +
release. 7. Deferred — ecosystem.

Each group = one feature branch off `dev`, PR into `dev`, delete on merge. `dev → main` only
on explicit request.
