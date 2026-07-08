---
standard: PortableAI
document_type: software-project
spec_version: 0.3
document_name: My Software Project
document_version: 1.0.0
last_updated: 2026-07-07
---

# Overview

Briefly describe what this project is, who it's for, and the problem it solves. Keep it short enough to orient a newcomer in under a minute. The bullets below are placeholder examples — replace them with your own or delete lines you don't need.

- e.g. A self-hostable service that turns raw sensor readings into clean, forecast-ready data
- e.g. Primary users are small operators who lacked an affordable way to normalize multi-vendor feeds
- e.g. Built as three parts: an ingest worker, a normalizer, and a read API

---

# Architecture

Describe the high-level shape: major components, how they communicate, data flow, and system boundaries.

- e.g. Three components — ingest worker, normalizer, read API — connected by a lightweight job queue
- e.g. Data flow: vendor feeds → ingest → append-only raw store → normalizer → canonical store → API
- e.g. No shared in-memory state between components; each is independently restartable

---

# Tech Stack

List languages, frameworks, key libraries, datastores, and infrastructure, with versions where they matter.

- e.g. Language: Python 3.12
- e.g. API: FastAPI served by Uvicorn behind a reverse proxy
- e.g. Data: PostgreSQL 16 (+ TimescaleDB); Redis for the job queue
- e.g. Tooling: Ruff for lint/format, uv for dependency management, pytest for tests

---

# Conventions

Capture coding standards, naming, formatting, testing approach, and branching/PR practices an AI should follow when proposing changes.

- e.g. snake_case for functions and modules; adapters live under `adapters/<vendor>.py`
- e.g. All timestamps stored and passed as UTC; convert only at the presentation edge
- e.g. Tests required for any new adapter or change to normalization logic
- e.g. Small, reversible PRs — one stage or feature per PR where possible

---

# Domain Glossary

Define project-specific terms, entities, and business concepts a newcomer would not know.

- e.g. Raw record — an unmodified reading as received from a vendor, kept verbatim
- e.g. Canonical series — normalized, deduplicated, unit-consistent time series consumers read
- e.g. Replay — re-running the normalizer over stored raw records after a logic fix

---

# Key Decisions

Record significant technical decisions and, briefly, why. Prefer linking to ADRs over restating them.

- e.g. Append-only raw store — keeps payloads verbatim so normalization is always replayable
- e.g. Chose TimescaleDB over a bespoke store to stay within Postgres tooling and backups
- e.g. Per-vendor adapter interface isolates vendor quirks so the core stays vendor-agnostic

---

# Constraints & Non-Goals

State hard constraints, explicit non-goals, and things intentionally out of scope so an AI doesn't propose disallowed directions.

- e.g. Not a real-time system — minute-scale latency is fine; sub-second is out of scope
- e.g. Does not do forecasting itself; it produces forecast-ready inputs
- e.g. Single-operator self-hosting — no multi-tenant billing or complex auth

---

# Environments & Ops

Describe environments, the build/deploy/release process, and operational notes needed to reason about changes safely.

- e.g. Environments: local (docker-compose), staging, production
- e.g. Container images built in CI on tag; deployed via a rolling restart
- e.g. Migrations run automatically on deploy; the raw store is never destructively migrated
- e.g. Alert on ingest lag and normalizer error rate

---

# Dependencies & Integrations

List external services, APIs, and systems the project depends on or integrates with.

- e.g. Pulls from three vendor feeds via their HTTP APIs
- e.g. Publishes normalized series to an internal read API consumed by a dashboard
- e.g. S3-compatible object storage for raw payload archives
- e.g. No third-party analytics or telemetry — operational data stays self-hosted

---

# Notes

Freeform notes that don't fit elsewhere.

- e.g. Link to the architecture diagram in the repo wiki
- e.g. Known rough edge: the staging feed occasionally lags production by a few minutes

---

# Changelog

A short, dated history of notable project changes. Newest first.

- e.g. 2026-07-07 — Initial project profile authored
