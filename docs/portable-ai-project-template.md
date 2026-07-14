# PortableAI Project Template Definition

## Status

Working definition for review and implementation inside the PortableAI
project.

This document defines the **PortableAI Project Template**: a long-term,
vendor-neutral standard for creating AI-ready software repositories. It
is intentionally separate from any specific commercial project and must
never contain proprietary project material, private examples, or
implementation details from downstream repositories.

------------------------------------------------------------------------

# Executive Summary

The PortableAI Project Template is a reusable GitHub repository template
together with a PortableAI project-creation service.

The template defines the standard structure of an AI-ready software
repository.

The service uses that template to initialize repositories from existing
Software Project Profiles, uploaded project documentation, guided
interviews, or a blank starting point.

The template is **not** a new PortableAI profile type. PortableAI
profiles preserve portable knowledge; the Project Template turns that
knowledge into a structured, versioned repository that both humans and
AI can understand.

------------------------------------------------------------------------

# Vision

Every PortableAI software project---regardless of language, framework,
cloud provider, development methodology, or AI model---should share a
common organizational structure.

A newly introduced AI coding agent should be able to open any PortableAI
project and quickly understand:

-   What the software is
-   Why it exists
-   Who it serves
-   What has been decided
-   What remains unresolved
-   How the system is organized
-   Which documents are authoritative
-   How code should be written and reviewed
-   How testing and deployment work
-   How AI is expected to behave

The repository itself becomes the onboarding process.

# Goals

-   Create a consistent repository structure.
-   Reduce AI onboarding from hours to minutes.
-   Preserve architectural knowledge.
-   Improve portability across AI vendors.
-   Separate product knowledge from implementation.
-   Maintain a single source of truth.
-   Support long-term maintainability.

# Design Philosophy

The PortableAI Project Template is intentionally opinionated about
**organization**, not **implementation**.

It standardizes where project knowledge lives rather than how software
is written. It does not prescribe programming languages, frameworks,
cloud providers, development methodologies, or AI vendors.

Its purpose is to ensure that any human or AI can rapidly understand a
project without constraining how that project is built.

# Core Principles

-   AI First
-   Model Neutral
-   Living Documentation
-   Single Source of Truth
-   Reproducibility
-   Replaceability
-   Separation of Concerns

# Definition

The **PortableAI Project Template** is a reusable GitHub repository
template and supporting PortableAI service for creating AI-ready
software repositories.

PortableAI profile types remain:

-   Persona Profile
-   Software Project Profile
-   Chat Profile

The template provides:

-   Consistent repository structure
-   Canonical documentation
-   AI agent instructions
-   PortableAI metadata
-   Repeatable project initialization
-   Standard foundations for testing, deployment, and maintenance

Profiles provide portable knowledge.

The template provides repository scaffolding.

The PortableAI service orchestrates the creation of repositories from
that scaffolding.

# Relationship to PortableAI Profiles

Profiles remain portable knowledge artifacts.

The template is **not** another profile type and does not replace the
Software Project Profile.

A Software Project Profile provides project context.

The Project Template provides repository structure.

Together they create an AI-ready software repository.

# Initialization Modes

PortableAI should support four initialization modes:

1.  Initialize from an existing Software Project Profile.
2.  Initialize from uploaded project documents.
3.  Initialize through a guided interview.
4.  Create a blank PortableAI Project.

Generated content must distinguish confirmed facts, inferred content,
suggestions, and open questions. Missing information should be
marked---not invented.

# Public Product Experience

PortableAI should expose this capability as a project-creation service.

Users should be able to:

1.  Choose how to initialize a project.
2.  Select a GitHub destination and repository visibility.
3.  Review generated documents, assumptions, and open questions.
4.  Create the repository.

The Project Template defines the repository standard.

The PortableAI service performs repository creation.

# Repository Structure

``` text
README.md
SOFTWARE-PROJECT-PROFILE.md
PRODUCT-SPEC.md
SYSTEM-DESIGN.md
DATA-MODEL.md
AGENTS.md
AI-POLICY.md
SECURITY.md
DEPLOYMENT.md
CONTRIBUTING.md
CHANGELOG.md

.portableai/
    project.yaml
    template-version.yaml

docs/
prompts/
src/
tests/
scripts/
.github/
```

# Canonical Documents

-   README.md --- Project overview and orientation.
-   SOFTWARE-PROJECT-PROFILE.md --- Portable project context.
-   PRODUCT-SPEC.md --- Product requirements.
-   SYSTEM-DESIGN.md --- Technical architecture.
-   DATA-MODEL.md --- Domain model.
-   AGENTS.md --- AI coding instructions.
-   AI-POLICY.md --- AI usage policy.
-   SECURITY.md --- Security expectations.
-   DEPLOYMENT.md --- Build and hosting.
-   CONTRIBUTING.md --- Development workflow.
-   CHANGELOG.md --- Project history.

# .portableai Directory

The `.portableai` directory stores machine-readable metadata describing
the individual project.

It indicates that the repository follows the PortableAI Project
Template.

It does **not** define the PortableAI standard itself.

# Template Versioning

The template uses semantic versioning.

PortableAI should record:

-   Template version
-   Source template revision
-   Migration status

Future versions should support upgrade guidance without overwriting
project-specific content.

# AI Portability

The repository should remain:

-   Vendor neutral
-   Model neutral
-   Tool neutral
-   Human readable
-   Machine readable where appropriate

One canonical project truth should support many AI runtimes.

# Security and Privacy

PortableAI must support both public and private repositories.

The public template must never contain private project information.

Initialization from private material must require explicit user review
before publication.

# Minimum Viable Product

Initial scope includes:

-   Public GitHub template repository
-   Standard repository skeleton
-   Core canonical documents
-   `.portableai` metadata
-   Project creation service
-   Initialization from Software Project Profiles
-   Blank initialization
-   Repository preview
-   Initial GitHub commit

# Acceptance Criteria

The template succeeds when:

-   It is clearly distinguished from PortableAI profiles.
-   A Software Project Profile can initialize a repository.
-   Blank repositories are supported.
-   Repository structure is consistent.
-   Canonical documents have clear responsibilities.
-   AI agents can rapidly understand project context.
-   No private project information exists in the template.
-   Public and private repositories are supported.
-   Missing information is clearly identified.
-   The template remains portable across AI vendors and tools.

# Non-Goals

The template does not:

-   Introduce a new profile type.
-   Replace GitHub or source control.
-   Replace issue trackers.
-   Mandate programming languages, cloud providers, or AI vendors.
-   Automatically generate production software.
-   Automatically publish sensitive information.

# Open Decisions

Remaining implementation decisions include:

-   Final template repository name
-   Required vs. optional files
-   Final `.portableai` schema
-   Template upgrade mechanism
-   Provenance tracking
-   Project-type variants
-   Non-GitHub export support

# Final Model

``` text
PortableAI
│
├── Profiles
│   ├── Persona Profile
│   ├── Software Project Profile
│   └── Chat Profile
│
└── Project Creation Service
    └── PortableAI Project Template
        ├── Initialize from Software Project Profile
        ├── Initialize from uploaded documents
        ├── Guided interview
        └── Blank project
```

**Summary**

PortableAI profiles preserve portable knowledge.

The PortableAI Project Template defines a reusable repository standard.

The PortableAI Project Creation Service transforms project knowledge
into structured, versioned, AI-ready software repositories.
