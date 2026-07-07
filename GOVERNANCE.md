# Governance

PortableAI is currently in early project formation.

## Stewardship

The project is initially stewarded by its founding maintainer. As the project matures, governance may expand to include additional maintainers, contributors, and advisory participants.

## Contact

- **maintainers@portableai.org** — project maintainers (currently the founding maintainer)
- **security@portableai.org** — security disclosures (see [SECURITY.md](SECURITY.md))
- **hello@portableai.org** — general questions and press

All three addresses are aliases delivered to the same project mailbox. Individual maintainer identities are intentionally not exposed at the project level; contribution attribution happens through Git commit history.

## Decision principles

Project decisions should prioritize:

1. User ownership of context
2. Human readability
3. Simplicity
4. Vendor neutrality
5. Long-term portability
6. Compatibility with existing standards

## Spec change process

PortableAI aspires to be a stable standard others can build on, so changes to the
spec follow a lightweight, predictable process. "The spec" here means the
documents under `spec/` and the [Well-Known Section Registry](spec/registry/well-known-sections-v1.md).

### Non-breaking changes

Additive, backward-compatible changes — new well-known sections, new optional
front-matter fields, clarifications, and editorial fixes — follow the normal
contribution path:

1. Open an issue describing the change and why it helps.
2. Discuss in the issue.
3. Open a PR.
4. A maintainer reviews and merges.

Reserved words and new document types can be added the same way (issue + PR),
without an ADR, as long as they are additive within the current major version.

### Breaking changes

Removals, semantic shifts, and incompatible restructuring require more care:

- A **version bump** of the affected spec.
- An **[ADR](adr/)** recording the context, decision, and consequences.
- A **minimum discussion window of 14 days** on the tracking issue before merge,
  so adopters have time to weigh in.

### Changes to core principles

Any change that touches a core principle — canonical Markdown as the source of
truth ([ADR-0001](adr/0001-canonical-markdown.md)), the Non-Storage Principle
([ADR-0005](adr/0005-non-storage-principle.md)), or user ownership of context —
**requires an ADR**, regardless of how small the diff looks.

### Proposing changes without prior contribution

You do not need to be an existing contributor to propose a change. Anyone can
open an issue or PR; well-reasoned proposals are welcome on their merits. See
[CONTRIBUTING.md](CONTRIBUTING.md) for how to get started.

## Merge authority and maintainership

Today, merge authority rests with the founding maintainer. This is stated plainly
rather than dressed up: the project is early, and one person currently reviews and
merges changes.

As the project matures, additional maintainers may be added. The intended path is
that sustained, high-quality contribution — code, spec work, or review — earns a
maintainer invitation. When more than one maintainer exists, this section will be
updated to describe how merge decisions and disputes are resolved among them.

## Scope control

PortableAI should avoid becoming a general personal database, social network, cloud storage provider, or proprietary identity platform.

The first goal is to define and implement the PortableAI Persona standard.