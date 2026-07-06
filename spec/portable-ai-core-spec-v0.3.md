---
standard: PortableAI Core
spec_version: 0.3-draft
document_type: spec
status: DRAFT
---

# PortableAI Core Spec v0.3 (DRAFT)

> **Status: DRAFT.** This is the First Public Draft target. Content is normative but subject to change until v0.3 is released. See the [v1.0 milestone](../../milestone/1) for open work.

## 1. Purpose

The **Core spec** defines the shared envelope for every PortableAI document, independent of document type. A Persona spec, a Preferences spec, or any future document type layers on top of this envelope.

The Core spec covers:

- Canonical file format
- Required and optional YAML front-matter fields
- The Well-Known Section Registry and rules for well-known and custom sections
- Optional integrity block for content addressing
- The Non-Storage Principle (see ADR-0005)

## 2. Requirement language

The key words MUST, MUST NOT, SHOULD, SHOULD NOT, RECOMMENDED, MAY, and OPTIONAL in this document are to be interpreted as described in RFC 2119 and RFC 8174 when, and only when, they appear in all capitals.

## 3. Canonical format

A conforming PortableAI Document:

- MUST be a single [GitHub-Flavored Markdown](https://github.github.com/gfm/) file using the `.md` extension.
- MUST be UTF-8 encoded.
- MUST use LF (`\n`) line endings for interchange. Implementations SHOULD normalize CRLF on save.
- MUST NOT require a compiler, build step, or preprocessor to render.

Any other representation (JSON, YAML, XML, provider-specific formats) is a **derived format** and is not normative.

## 4. Document identity (front-matter)

Every PortableAI Document MUST begin with a YAML front-matter block delimited by `---`. The following fields are defined at the Core level.

### 4.1 Required fields

| Field | Type | Description |
|---|---|---|
| `standard` | string | Human-readable standard name (e.g., `PortableAI Persona`). |
| `spec_version` | string | The PortableAI spec version this document targets (e.g., `0.3`). |
| `document_type` | string | Document type from the registry (see §4.3). |
| `document_id` | string | Stable [ULID](https://github.com/ulid/spec) identifying this document across edits and renames. |
| `language` | string | [BCP 47](https://www.rfc-editor.org/info/bcp47) language tag for the document's primary language (e.g., `en`, `en-US`, `ja`). |

### 4.2 Recommended fields

| Field | Type | Description |
|---|---|---|
| `document_name` | string | Human-readable name for this specific document. |
| `document_version` | string | [SemVer](https://semver.org/) version of the document's content. |
| `last_updated` | string | ISO 8601 date the document was last edited. |
| `sections` | list | Section metadata block; see §5.2. |

### 4.3 Document types

The following `document_type` values are reserved at v0.3:

- `persona` — a PortableAI Persona document (see the Persona spec).
- `software-project` — a PortableAI Software Project document (see the Software Project spec).
- `spec` — a PortableAI Spec document (used by this repo).
- `patch` — **reserved but not implemented in v0.3.** Documents MUST NOT declare `document_type: patch` at v0.3. Implementations MUST reject unknown document types with a warning (not an error) to preserve forward compatibility.

Additional document types MAY be defined in future spec versions.

### 4.4 Example

```yaml
---
standard: PortableAI Persona
spec_version: "0.3"
document_type: persona
document_id: 01J9Z8V6C1QW2XKQ3F0B7E9N4T
language: en-US
document_name: David's Persona
document_version: 1.2.0
last_updated: 2026-07-04
sections:
  - key: profile
    well_known: true
    title: Profile
    updated: 2026-07-04
  - key: org.refinery.david/negotiation_style
    well_known: false
    title: Negotiation style
    updated: 2026-06-30
    source: manual
---
```

## 5. Sections

### 5.1 Section anatomy

A "section" in a PortableAI Document is an H2 (`##`) heading in the Markdown body, together with the content up to the next H2 or the end of the document (excluding the integrity block, if present).

Every section has a **key**. The key is either:

- A **well-known key** from the [Well-Known Section Registry](registry/well-known-sections-v1.md), matched case-insensitively to the section heading with spaces converted to `_` (e.g., heading `Communication Style` → key `communication_style`).
- A **custom key** in **reverse-DNS form** (e.g., `org.refinery.david/negotiation_style`). Custom keys MUST contain at least one `.` and at least one `/`. The part before the first `/` is the namespace; the part after is the local name (`snake_case`).

### 5.2 The `sections` block (optional)

The `sections` field in front-matter lists section metadata for machine consumers. It MAY be omitted; when omitted, consumers derive section information from the Markdown headings.

Each entry MAY contain:

| Field | Type | Description |
|---|---|---|
| `key` | string | Section key (well-known or reverse-DNS). REQUIRED if the entry is present. |
| `well_known` | boolean | `true` if the key appears in the Well-Known Section Registry. |
| `title` | string | Display title used in the section heading. |
| `updated` | string | ISO 8601 date the section was last edited. |
| `source` | string | Free-form provenance note (e.g., `manual`, `imported:chatgpt`, `imported:claude`). |

When the `sections` block is present, entries SHOULD appear in document order.

### 5.3 Custom sections

Custom sections MUST use reverse-DNS keys. The namespace SHOULD be a domain the author controls or an org/user identifier the author is willing to be identified by. Custom sections MUST be preserved by conforming editors even if the editor does not recognize them.

## 6. Well-Known Section Registry

The registry is published at [`spec/registry/well-known-sections-v1.md`](registry/well-known-sections-v1.md).

Rules:

- The registry is **versioned and additive**. Registry `v1` will only add keys; keys will not be removed or renamed within a major version.
- A new registry major version (`v2`, etc.) is a breaking change and requires an ADR.
- Conforming editors SHOULD ship with the current registry embedded and SHOULD warn (not error) when they encounter a well-known key from a newer registry version they don't recognize.

## 7. Integrity block (optional)

A PortableAI Document MAY end with an **integrity block**: an HTML comment containing a YAML payload with a content hash. When present, it is the last non-empty content in the document.

### 7.1 Format

```markdown
<!-- portable-ai:integrity
hash_algo: sha-256
hash_scope: body
hash: 3b1c9f...e4a2
generated_at: 2026-07-04T12:34:56Z
generator: portable-ai-reference-editor/0.3.0
-->
```

### 7.2 Required fields

| Field | Type | Description |
|---|---|---|
| `hash_algo` | string | Hash algorithm. At v0.3, `sha-256` is the only supported value. |
| `hash_scope` | string | What the hash covers. At v0.3, `body` is the only supported value (see §7.3). |
| `hash` | string | Lowercase hex digest of the scoped content. |

### 7.3 Hash scope: `body`

When `hash_scope: body`, the hash is computed over:

1. The document text starting immediately after the closing `---` of the front-matter block, and
2. Ending immediately before the opening `<!--` of the integrity block itself,
3. With trailing whitespace stripped from the resulting byte sequence,
4. Encoded as UTF-8.

The front-matter and the integrity block itself are **excluded** from the hash. This lets the front-matter or generator metadata be edited without invalidating the hash of the semantic content.

### 7.4 Optional fields

| Field | Type | Description |
|---|---|---|
| `generated_at` | string | ISO 8601 timestamp when the hash was computed. |
| `generator` | string | Identifier of the tool that generated the block. |

### 7.5 Verification

Verifiers MUST:

- Recompute the hash over the declared scope and compare byte-for-byte with the `hash` field.
- Report a **mismatch** as a verification error, not a spec violation.
- Report an **absent** integrity block as informational, not an error. The integrity block is optional.

### 7.6 Non-goals

The integrity block is a content hash, **not** a signature. It provides tamper detection when someone re-shares the file, not authentication of authorship. A future document type may layer signatures on top; that is out of scope for v0.3.

## 8. Non-Storage Principle (normative)

PortableAI is a broker, not a database. The following are normative for any project or product that identifies itself as a "PortableAI reference implementation" or as a "conforming PortableAI editor":

1. It MUST NOT store user PortableAI documents on a server it controls.
2. It MUST NOT require a user account for basic create/edit/export flows.
3. It MUST NOT transmit document content to a third party without explicit, per-action user consent.
4. It MAY persist drafts in browser-local storage on the user's device, provided that persistence is user-clearable and clearly labeled as local-only.

Rationale, consequences, and background are documented in [ADR-0005: Non-Storage Principle](../adr/0005-non-storage-principle.md).

Products that store user documents on servers MAY be part of the PortableAI ecosystem but MUST NOT be described as "PortableAI reference implementations".

## 9. Versioning

- The Core spec version is expressed as `major.minor` (e.g., `0.3`).
- Additive changes that do not break existing conforming documents are minor version bumps.
- Any change that could invalidate a previously conforming document is a major version bump and requires an ADR.

Documents declare the spec version they target via `spec_version` in front-matter. Consumers SHOULD accept documents from any spec version they recognize and SHOULD warn (not reject) on unrecognized versions.

## 10. Compatibility

Conforming editors MUST:

- Preserve unrecognized front-matter fields on save.
- Preserve unrecognized sections (including custom sections) on save.
- Preserve the integrity block **only if it can be recomputed correctly**. If the editor cannot recompute the hash, it MUST remove the block on save rather than leave a stale hash.

## 11. Out of scope

The Core spec does not define:

- Cloud storage, sync, or authentication.
- Signature or PKI schemes.
- Section-specific semantics (those live in per-document-type specs).
- Validation tooling — see issue #29 (deferred to Future).

## 12. Related documents

- [PortableAI Persona Spec v0.3](portable-ai-persona-spec-v0.3.md)
- [Well-Known Section Registry v1](registry/well-known-sections-v1.md)
- [ADR-0005: Non-Storage Principle](../adr/0005-non-storage-principle.md)
- [ADR-0001: Canonical Markdown](../adr/0001-canonical-markdown.md)
- [ADR-0002: Single Document Standard](../adr/0002-single-document-standard.md)
- [ADR-0003: AI Exports Are Derived](../adr/0003-ai-exports-are-derived.md)
