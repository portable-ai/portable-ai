# PortableAI Project Bootstrap Guide

This guide defines how PortableAI is organized, planned, and developed with human and AI contributors.

It is not the live backlog. GitHub Issues and the GitHub Project are the source of truth for active work.

## Core Positioning

Every AI asks you to start over.

PortableAI is an open standard that lets you take your context anywhere.

Primary actions for the first public site:

- Download your context
- Create a new profile

## What PortableAI Is

PortableAI is an open standard for context.

A PortableAI profile is a human-readable Markdown document that captures durable information a person wants to take across AI systems, tools, and workflows.

The standard is the primary product. The reference editor demonstrates the standard.

## Development Principles

- State what PortableAI is.
- Keep the standard simple.
- Keep Markdown canonical.
- Make the reference editor useful without accounts, databases, or backend services.
- Prefer clear user value over clever implementation.
- Treat GitHub Issues and the GitHub Project as the live source of truth.

## Repository Structure

- `README.md` — project overview
- `WHY.md` — rationale and motivation
- `spec/` — PortableAI specifications
- `templates/` — canonical templates
- `examples/` — example profiles
- `website/` — static reference editor and public site
- `adr/` — architecture decision records
- `ai/` — AI contributor guidance and reusable prompts

## GitHub Project

Project name:

- PortableAI

Recommended project template:

- Kanban

Recommended board columns:

1. Ideas
2. Backlog
3. Ready
4. In Progress
5. Review
6. Done

## Labels

Priority labels:

- `P0`
- `P1`
- `P2`

Area labels:

- `standard`
- `website`
- `editor`
- `ecosystem`
- `documentation`

Type labels:

- `epic`
- `feature`
- `bug`

Community labels:

- `good first issue`
- `help wanted`

## Milestones

- First Public Draft
- v0.3
- v1.0

## Work Hierarchy

Use this hierarchy:

```text
Epic
→ Feature
→ Task
```

Epics are long-lived areas of the project.

Features are coherent product capabilities or documentation outcomes.

Tasks are concrete pieces of work that can be implemented, reviewed, and closed.

## Issue Format

Each issue should use this pattern:

```markdown
## Problem

Why this work matters.

## Proposal

What should be created, changed, or clarified.

## Acceptance Criteria

- [ ] Clear outcome 1
- [ ] Clear outcome 2
- [ ] Clear outcome 3

## Notes

Related Epic, Feature, design note, or implementation guidance.
```

## Initial Epics

Create these five Epic issues.

### EPIC: Standard

Define the PortableAI standard, specification, governance, canonical Markdown format, and core messaging.

Labels: `epic`, `standard`, `P0`

### EPIC: Website

Present PortableAI clearly and guide visitors toward creating or importing a profile.

Labels: `epic`, `website`, `P0`

### EPIC: Reference Editor

Provide a simple browser-based implementation of the PortableAI standard.

Labels: `epic`, `editor`, `P0`

### EPIC: Ecosystem

Track future interoperability work, including integrations, SDKs, APIs, and AI connectors.

Labels: `epic`, `ecosystem`, `P2`

### EPIC: Documentation

Maintain consistent documentation and contributor guidance.

Labels: `epic`, `documentation`, `P1`

## Initial First Public Draft Backlog

### Feature: Homepage Hero

Area: Website
Priority: P0
Milestone: First Public Draft

Problem:
The homepage must explain PortableAI quickly and direct people to the next action.

Proposal:
Create a focused hero section with the agreed working message and two clear calls to action.

Acceptance Criteria:

- [ ] Shows: `Every AI asks you to start over.`
- [ ] Shows: `PortableAI is an open standard that lets you take your context anywhere.`
- [ ] Primary CTA: `Download your context`
- [ ] Secondary CTA: `Create a new profile`
- [ ] First-time visitor understands the idea within 10 seconds

### Feature: Download Your Context Overlay

Area: Website / Reference Editor
Priority: P0
Milestone: First Public Draft

Problem:
Users need a practical way to extract useful context from an AI they already use.

Proposal:
Create an overlay opened from `Download your context` with short instructions and a reusable prompt.

Acceptance Criteria:

- [ ] Overlay explains the workflow simply
- [ ] Includes prompt for asking an AI to summarize/export durable user context
- [ ] Includes copy button for the prompt
- [ ] Leads user back to the editor

### Feature: Create New Profile Flow

Area: Website / Reference Editor
Priority: P0
Milestone: First Public Draft

Problem:
Users need a fast path to start from a blank or guided PortableAI profile.

Proposal:
Make `Create a new profile` load the template and focus the editor.

Acceptance Criteria:

- [ ] CTA loads the template
- [ ] User can immediately edit the profile
- [ ] Draft is saved locally in the browser

### Feature: Three-Tab Editor

Area: Reference Editor
Priority: P0
Milestone: First Public Draft

Problem:
Different users prefer structured inputs, raw Markdown, or preview.

Proposal:
Create three tabs: Inputs, Markdown, and Preview.

Acceptance Criteria:

- [ ] Inputs tab provides easy editing for standard sections
- [ ] Markdown tab exposes the canonical Markdown
- [ ] Preview tab renders the current profile
- [ ] Markdown remains the canonical source

### Feature: Template With Section Examples

Area: Reference Editor
Priority: P0
Milestone: First Public Draft

Problem:
A blank template is too abstract for first-time users.

Proposal:
Add helpful commented examples for every standard section.

Acceptance Criteria:

- [ ] Load Template button exists
- [ ] Every standard section includes example guidance
- [ ] Examples are easy to remove or replace
- [ ] Template still exports as valid Markdown

### Feature: Custom Sections

Area: Reference Editor
Priority: P0
Milestone: First Public Draft

Problem:
A portable context profile must support information that does not fit predefined sections.

Proposal:
Allow users to add and preserve custom sections.

Acceptance Criteria:

- [ ] User can add a custom section
- [ ] User can rename a custom section
- [ ] Custom sections appear in Markdown
- [ ] Custom sections are preserved on download

### Feature: Download My Profile Overlay

Area: Reference Editor
Priority: P0
Milestone: First Public Draft

Problem:
Users need instructions for using a PortableAI profile with another AI.

Proposal:
Create an overlay opened from `Download My Profile` with download action and import instructions.

Acceptance Criteria:

- [ ] Overlay explains what the file is
- [ ] User can download canonical Markdown
- [ ] Includes prompt for giving the profile to another AI
- [ ] Includes copy button for the prompt

### Feature: Specification v0.2 Completion

Area: Standard
Priority: P0
Milestone: First Public Draft

Problem:
The standard must match the reference editor and project messaging.

Proposal:
Review and tighten the v0.2 draft.

Acceptance Criteria:

- [ ] Uses PortableAI consistently as the canonical name
- [ ] Defines canonical Markdown clearly
- [ ] Aligns with the first public reference editor
- [ ] Separates current release from future extensions

### Feature: Documentation Consistency

Area: Documentation
Priority: P1
Milestone: First Public Draft

Problem:
Project docs should use consistent language and structure.

Proposal:
Review README, WHY, CONTRIBUTING, ROADMAP, website README, templates, and examples.

Acceptance Criteria:

- [ ] PortableAI branding is consistent
- [ ] First Public Draft language is consistent
- [ ] Website and spec do not conflict
- [ ] Contributor-facing docs are approachable

### Feature: First Public Draft Release Checklist

Area: Documentation
Priority: P1
Milestone: First Public Draft

Problem:
The project needs a clear checklist before public announcement.

Proposal:
Create a simple release checklist for the First Public Draft.

Acceptance Criteria:

- [ ] Includes website readiness checks
- [ ] Includes spec readiness checks
- [ ] Includes editor readiness checks
- [ ] Includes documentation readiness checks

## Future Backlog

Create future features, but do not schedule them for First Public Draft.

### Feature: JSON Representation

Area: Ecosystem
Priority: P2
Milestone: v0.3

Define a derived JSON representation from the canonical Markdown profile.

### Feature: Validation Tooling

Area: Ecosystem
Priority: P2
Milestone: v0.3

Validate profile structure and metadata while preserving Markdown as canonical.

### Feature: AI-Specific Exports

Area: Ecosystem
Priority: P2
Milestone: v0.3

Generate provider-specific prompts or profile formats from canonical Markdown.

### Feature: GitHub Integration

Area: Ecosystem
Priority: P2
Milestone: v1.0

Explore optional GitHub-based profile storage and versioning workflows.

### Feature: MCP Support

Area: Ecosystem
Priority: P2
Milestone: v1.0

Explore using MCP to let tools read a user's PortableAI profile.

## First Public Draft Scope

The First Public Draft includes:

- Clear homepage message
- Download your context workflow
- Create new profile workflow
- Browser-only reference editor
- Three editor tabs
- Load template with examples
- Custom sections
- Download profile workflow
- v0.2 specification cleanup
- Consistent documentation

Future releases may include:

- Direct AI integrations
- JSON representation
- Validation tooling
- SDKs
- APIs
- Permission models
- Synchronization workflows

## Instructions for AI Contributors

When working on PortableAI:

1. Read the relevant issue.
2. Identify the Epic and Feature it belongs to.
3. Read the relevant spec or template before changing behavior.
4. Keep Markdown canonical.
5. Prefer small, reviewable changes.
6. Preserve the project message and terminology.
7. Update documentation when behavior changes.
8. Do not expand scope beyond the issue without creating or updating an issue.

## Definition of Done

A task is done when:

- The acceptance criteria are met.
- The change is small enough to review.
- Terminology matches PortableAI conventions.
- Documentation is updated if user-facing behavior changed.
- The issue can be closed without relying on chat history.
