# Security Policy

## Scope

PortableAI is an open standard and reference implementation for a Markdown document format. It intentionally does not store user data (see [ADR-0005](adr/0005-non-storage-principle.md)). "Security" in this project therefore concerns:

- The spec itself (ambiguities or design flaws that could lead to unsafe interoperability)
- The reference editor at PortableAI.org (client-side code shipped as a static site)
- Any tooling published under the PortableAI project

It does **not** concern the contents of user documents, which live on the user's own systems.

## Supported versions

Only the current spec version and the latest deployed reference editor are actively supported. Older spec drafts are archived and will not receive fixes.

| Spec version | Status |
|---|---|
| v0.3 | Supported (First Public Draft, released 2026-07-07) |
| v0.2 | Deprecated |
| < v0.2 | Unsupported |

## Reporting a vulnerability

If you believe you have found a security issue in the reference editor, the website, or the spec:

1. **Do not open a public GitHub issue.**
2. Email the maintainers at **security@portableai.org** with:
   - A description of the issue
   - Steps to reproduce
   - The affected file, URL, or spec section
   - Your assessment of impact

You should receive an acknowledgement within **5 business days**. We will confirm the issue, agree a disclosure timeline with you, and credit you in the fix commit and `CHANGELOG.md` unless you request otherwise.

## Coordinated disclosure

We prefer coordinated disclosure. If a fix is required in the spec, expect the timeline to be longer than for a code fix because a spec change requires an ADR and version bump.

## What is not in scope

- Vulnerabilities in third-party AI providers or in their handling of PortableAI documents. Report those directly to the provider.
- Issues in a user's local storage, disk, or backup system.
- Requests that PortableAI add authentication, cloud storage, or a backend. Those are out of scope by design (see ADR-0004 and ADR-0005).
