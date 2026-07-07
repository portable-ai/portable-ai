# First Public Draft — Release Checklist

A living release gate for **v0.3 (First Public Draft)**. This is the single
place to see what must be true before PortableAI is announced publicly, and
what is explicitly *out of scope* for the first draft.

- **Current state:** `v0.3.0-rc.1` (first informal release candidate) is tagged.
- **How to use this:** check items off as they land. When every blocker in
  "Release blockers" is checked, we are ready to cut the First Public Draft.
  Known future work is listed separately and does **not** block the release.
- **Related:** issue #27 (this checklist), milestone [v1.0](../../milestone/1),
  `ROADMAP.md`, `CHANGELOG.md`.

Legend: `[ ]` open · `[x]` done · each item links the tracking issue where useful.

---

## Release blockers

These must be complete (or explicitly waived) before the public announcement.

### Website (Epic #14)

- [x] Home / landing page communicates the core message ("take your profile anywhere")
- [x] "Generate a profile" flow reachable from the nav and empty state (#75, #76 R1)
- [x] "Learn" page explains the standard
- [x] Responsive header with mobile navigation
- [ ] Website polish pass — typography, spacing, mobile layout, accessible controls (#35)
- [ ] Informative footer with project origin, version, and build timestamp (#43)
- [ ] Cross-page wording is consistent ("profile", "profile type", "Generate a profile")

### Reference editor (Epic #15)

- [x] Empty-state landing with clear first actions (Load a sample / Open a profile / Generate a profile)
- [x] Edit / Read mode toggle over a single canonical Markdown surface
- [x] Live GitHub-Flavored Markdown preview (vendored marked.js)
- [x] Front-matter rendered as a metadata card, not raw YAML in the body
- [x] Left-margin block-level teleport gutter between Edit and Read (#83)
- [x] Auto-height Edit view (page scrolls; no inner scroll) (#83)
- [x] Local draft persistence: auto-save, restore-or-clear banner, confirmed clear with shared-computer guidance (#32 — closed)
- [ ] **Custom sections**: add / rename / preserve on download / visible in Preview (#23, P0)
- [ ] Download produces canonical, spec-valid Markdown with the standard filename
- [ ] Editor works with both Day-1 profile types (Persona, Software Project)

### Specification (Epic #13)

- [x] Core spec v0.3 draft (`spec/portable-ai-core-spec-v0.3.md`)
- [x] Persona spec v0.3 draft (`spec/portable-ai-persona-spec-v0.3.md`)
- [x] Software Project spec v0.3 draft (`spec/portable-ai-software-project-spec-v0.3.md`)
- [x] Well-Known Section Registry v1 draft (`spec/registry/well-known-sections-v1.md`)
- [ ] Website and spec do not conflict (terminology, section names, front-matter keys)
- [ ] Custom-section behavior in the editor matches what the spec says about non-well-known sections
- [ ] Spec drafts reviewed once end-to-end for internal consistency and "DRAFT" framing

### Documentation (Epic #17)

- [x] `SECURITY.md`, `CHANGELOG.md`, `THIRD_PARTY_NOTICES.md` present
- [x] Sample profiles under `examples/profiles/` (Persona + Software Project); per-type coverage rule set by ADR-0006 (#36 — closed)
- [x] README repo tree reflects the real v1 structure, including `ai/`, `docs/`, `tests/` (#56)
- [ ] Documentation consistency pass across README, WHY, CONTRIBUTING, ROADMAP, website README, templates, examples (#26)
- [ ] `GOVERNANCE.md` documents the spec change process (non-breaking vs breaking, ADR expectations) (#55)
- [ ] Contributor-facing docs read as approachable; positive language preferred over long non-goal lists

### Release mechanics

- [x] `main` = stable/release (auto-deploys via Pages); `dev` = working branch
- [x] First informal release candidate tagged (`v0.3.0-rc.1`)
- [ ] Open questions in the parking lot (#89) resolved or explicitly deferred
- [ ] Final RC promoted to a `v0.3.0` release tag on `main`
- [ ] Announcement / "First Public Draft" note prepared

---

## Known future work (does NOT block this release)

Tracked, intentionally deferred to a later release.

- **R2 wording & selector refinement** (#76, `R2`)
- **3rd profile type** — brainstorm and define (#78)
- **Prompt library** — save/share user prompts, commercial (#79)
- **AI-specific exports** (#30, P2, ecosystem)
- **JSON representation** (#28, P2, ecosystem)
- **Validation tooling** (#29, P2, ecosystem)
- **GitHub integration** (#31, `future`)
- **Left-rail section outline** — parked, needs more thought (#84)

---

_This is a living document. Update it as items land or as scope changes._
