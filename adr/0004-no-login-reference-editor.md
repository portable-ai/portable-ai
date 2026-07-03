# ADR-0004: Reference Editor Requires No Login

**Status:** Accepted  
**Date:** 2026-07-03

## Context

The first Portable AI website should demonstrate the standard and make it easy for someone to create, load, edit, and download a profile.

Adding accounts, storage, authentication, or a backend would increase complexity and shift attention away from the core standard.

## Decision

The initial reference editor SHALL require no login, no backend, no database, and no cloud storage for basic use.

Version 1 SHALL use plain HTML, CSS, and JavaScript with no JavaScript framework.

## Consequences

The reference editor can be hosted as a static site.

Users can create and export profiles without trusting PortableAI.org with persistent personal data.

More advanced features such as synchronization, publishing, or provider integrations may be added later, but they are outside the initial implementation scope.
