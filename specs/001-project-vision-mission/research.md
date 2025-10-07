# Research: 貓狗領養平台 — Phase 0

**Feature**: 貓狗領養平台 (MVP)  
**Created**: 2025-10-07

## Purpose

Resolve open technical decisions required to produce Phase 1 design artifacts (data model, API contracts, quickstart). Each item below maps to a `NEEDS CLARIFICATION` entry in `plan.md`.

## Unknowns / Research Tasks

1. Backend language and framework
   - Task: Research recommended backend stacks for a mid-sized web app with user accounts, file uploads (images), and admin workflows. Compare: Node.js (Express/Nest), Python (FastAPI/Django), Ruby on Rails, and serverless options.
   - Decision criteria: developer velocity, ecosystem for auth & file uploads, hosting costs, community support in the region.

2. Primary dependencies (auth, chatbot platform)
   - Task: Research authentication approaches (email/password + OAuth social logins) and recommend libraries/services.
   - Task: Research chatbot options suitable for FAQ and handoff (e.g., open-source Rasa, managed LLM-based chat via provider, rule-based chat) and compare costs/complexity/privacy.

3. Storage choice
   - Task: Compare relational DB (PostgreSQL) vs document DB (MongoDB) for listings, applications, and audit logs. Consider query patterns (search/filter), transactions (application approval), and scaling.

4. Testing frameworks and CI patterns
   - Task: Recommend testing frameworks for backend/frontend and propose a CI checklist (unit, integration, contract tests) aligned with constitution test principles.

5. Performance and scale targets
   - Task: Define sensible initial performance targets for MVP (requests/sec, image storage needs, response latencies) and recommendations to monitor them.

6. Image handling and storage
   - Task: Research image hosting strategies (object storage e.g., S3-compatible, CDN, image resizing on upload) and recommended limits (file size, formats).

7. Data privacy & retention for user and photo data
   - Task: Identify local legal requirements in Taiwan (or specify local law if known) for storing user personal data & images; recommend retention defaults.

## Deliverables

- `research.md` (this file): decisions and rationale
- Updated `plan.md` summary & technical context with chosen technologies
- Inputs for Phase 1: `data-model.md`, `contracts/`, `quickstart.md`

## Proposed timeline

- Research tasks estimated 1-3 days total depending on stakeholder availability for final tradeoffs.

## Decisions (completed)

1. Backend language and framework
   - Decision: Node.js 18+ with TypeScript 5.x and NestJS framework.
   - Rationale: Strong TypeScript ecosystem, maintainability via NestJS modules, easy sharing of types with frontend, good community support.
   - Alternatives considered: Python (FastAPI) for rapid prototyping; Ruby on Rails for convention-over-configuration; chosen Node.js for type-safety and full-stack JS team efficiency.

2. Primary dependencies (auth, chatbot platform)
   - Decision: Use open standards for auth (email/password + OAuth2 social logins). Implement JWT-based session tokens with HttpOnly cookies. For social login: Google (additional providers optional).
   - Chatbot Decision: Start with a rule-based FAQ store seeded from platform docs; add a managed LLM provider (OpenAI-compatible) as fallback for free-text queries, with clear logging and human-handoff when confidence is low.
   - Alternatives considered: Rasa (open-source conversational platform) — more control but higher maintenance; chosen managed LLM fallback for faster MVP.

3. Storage choice
   - Decision: PostgreSQL as primary relational DB. Use Prisma for schema migrations.
   - Rationale: Transactional integrity for applications & approvals; rich querying for filtering/search.

4. Testing frameworks and CI patterns
   - Decision: Jest + Supertest for backend; React Testing Library + Vitest for frontend. CI: run lint, unit tests, contract tests, and integration smoke tests on PRs.

5. Performance and scale targets
   - Decision: p95 latency target < 500ms for API endpoints under expected load; monitor with application metrics (apdex, response times) and autoscale policies to be defined in infra planning.

6. Image handling and storage
   - Decision: Store images in S3-compatible object storage; process uploads server-side to generate thumbnails; serve via CDN. Max upload 8MB; accepted formats: JPEG, PNG, WebP.

7. Data privacy & retention for user and photo data
   - Decision: Default retention: user data kept until account deletion; photos retained for up to 2 years unless user requests deletion. These defaults must be verified with legal/compliance and may be adjusted.

## Updated plan actions

- Update `plan.md` Technical Context fields (done).
- Update `data-model.md` types and constraints to reflect PostgreSQL (done in Phase 1 deliverable).
- Produce full OpenAPI contracts in `contracts/` (done: initial full OpenAPI in Phase 1).

*** End of decisions ***
