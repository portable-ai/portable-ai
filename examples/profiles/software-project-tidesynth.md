---
standard: PortableAI Software Project
document_type: software-project
standard_version: 0.3
profile_name: TideSynth — Software Project
profile_version: 1.0.0
last_updated: 2026-07-06
---

# Overview

- **TideSynth** is a self-hostable service that turns raw coastal sensor readings into clean, forecast-ready tide and current data.
- It exists because marine researchers and small harbor operators had no affordable way to normalize noisy multi-vendor buoy feeds into one consistent stream.
- Primary users: a data-ingestion service, a normalization pipeline, and a small read API that downstream dashboards query.
- Fictional sample project, used to demonstrate and test the PortableAI Software Project format.

# Architecture

- Three main components: an **ingest worker** (pulls vendor feeds), a **normalizer** (cleans, dedupes, and unifies units), and a **read API** (serves normalized series).
- Data flows: vendor feeds → ingest worker → raw store (append-only) → normalizer → canonical store → read API → consumers.
- The raw store is deliberately append-only so any normalization bug can be replayed without re-fetching from vendors.
- Components communicate through a lightweight job queue; there is no shared in-memory state between them.

# Tech Stack

- **Language:** Python 3.12.
- **Web/API:** FastAPI, served by Uvicorn behind a reverse proxy.
- **Data:** PostgreSQL 16 (canonical store), with TimescaleDB extension for time-series; object storage for raw payload archives.
- **Queue:** Redis-backed job queue.
- **Testing:** pytest, with `respx` for mocking vendor HTTP calls.
- **Tooling:** Ruff for lint/format, `uv` for dependency management.

# Conventions

- Naming: `snake_case` for functions and modules; vendor adapters live under `adapters/<vendor>.py`.
- Every vendor adapter implements the same `fetch()` / `to_raw_records()` interface so the ingest worker treats them uniformly.
- All timestamps are stored and passed as UTC; timezone conversion happens only at the presentation edge.
- Tests are required for any new adapter and for any change to unit-normalization logic.
- Small, reversible PRs; one adapter or one pipeline stage per PR where possible.

# Domain Glossary

- **Raw record:** an unmodified reading as received from a vendor, kept verbatim in the append-only store.
- **Canonical series:** normalized, deduplicated, unit-consistent time series that consumers read.
- **Datum shift:** the vertical reference-level correction applied so heights from different stations are comparable.
- **Replay:** re-running the normalizer over stored raw records to regenerate canonical data after a logic fix.

# Key Decisions

- **Append-only raw store (chosen):** keep vendor payloads verbatim so normalization is always replayable; costs more storage but removes re-fetch risk.
- **TimescaleDB over a bespoke time-series store:** stays within Postgres tooling and backups rather than adding a second datastore to operate.
- **Adapter interface per vendor:** isolates vendor quirks at the edge so the pipeline core stays vendor-agnostic.
- **UTC everywhere internally:** avoids a long tail of timezone bugs; conversion is a presentation concern only.

# Constraints & Non-Goals

- Not a real-time streaming system — minute-scale latency is acceptable; sub-second is out of scope.
- Does not do forecasting itself; it produces forecast-ready inputs for downstream models.
- No multi-tenant billing or auth beyond a simple API key — intended for self-hosting by a single operator.
- Vendor SLAs are out of scope; the system degrades gracefully when a feed is unavailable.

# Environments & Ops

- Environments: local (docker-compose), staging, and production.
- Build/deploy: container images built in CI on tag; deployed via a simple rolling restart.
- Migrations run automatically on deploy; the append-only raw store is never destructively migrated.
- Ops notes: alert on ingest lag and on normalizer error rate; nightly job verifies raw-vs-canonical record counts.

# Dependencies & Integrations

- Pulls from three fictional vendor feeds (BuoyNet, HarborCast, OpenTideGrid) via their HTTP APIs.
- Publishes normalized series to an internal read API consumed by the operator's dashboard.
- Object storage (S3-compatible) for raw payload archives.
- No third-party analytics or telemetry SaaS — the project keeps operational data self-hosted by design.

# Notes

- Fictional sample created to demonstrate and test the PortableAI Software Project format. TideSynth and its vendors are not real.
- Deliberately varied content (bullets, bold, short paragraphs) so it exercises the editor's Edit/Read rendering and the gutter-teleport line mapping.

# Changelog

- 2026-07-06 — Initial sample profile authored.
