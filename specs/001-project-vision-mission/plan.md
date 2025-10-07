````markdown
# Implementation Plan: 貓狗領養平台 — MVP (採用與送養核心)

**Branch**: `001-project-vision-mission` | **Date**: 2025-10-07 | **Spec**: ./spec.md
**Input**: Feature specification from `/specs/001-project-vision-mission/spec.md`

## Summary

建立一個線上貓狗領養與送養平台的 MVP，重點是：使用者註冊/登入、動物刊登與瀏覽、領養申請與管理員審核流程，及基礎客服機器人問答以提升使用者體驗並降低人工客服負擔。

主要技術決策將在 Phase 0 研究中確定（例如後端語言、資料儲存與客服機器人的技術替代方案）。

## Technical Context

**Language/Version**: Node.js 18+ with TypeScript 5.x
**Primary Dependencies**: NestJS (backend framework), Prisma (ORM), React + Vite (frontend), PostgreSQL driver, AWS S3-compatible client (image storage), OpenAPI for contracts
**Storage**: PostgreSQL for primary data; images stored in S3-compatible object storage (with CDN)
**Testing**: Jest + Supertest for backend; React Testing Library + Vitest for frontend; contract tests using OpenAPI/Prism or Pact as needed
**Target Platform**: Web (responsive desktop + mobile web)
**Project Type**: Web application (separate `backend/` and `frontend/` projects)
**Performance Goals**: Serve initial MVP target (MAU ~1,000) with p95 API responses < 500ms under normal load; initial image throughput for uploads ~50/day.
**Constraints**: Max image size 8MB; privacy/retention policies to be enforced per legal guidance; transactional integrity for adoption approval flows.
**Scale/Scope**: MVP for initial region (target MAU 1k, monthly matches 30)

## Rationale for choices

- Node.js + TypeScript: high developer velocity, broad ecosystem, strong TypeScript typing for shared types between frontend and backend.
- NestJS + Prisma: NestJS provides structured modules and DI (good for maintainability); Prisma offers clear schema-first DB modeling and migrations that speed data-model-driven development.
- PostgreSQL: relational model fits transactional adoption workflows, queries for filtering/search, and ACID needs for approvals.
- Images in S3-compatible storage + CDN: separates large binary storage from transactional DB and supports efficient delivery and resizing pipelines.
- Chatbot: start with a small FAQ/rule-based knowledge base and an LLM provider as a fallback for unclear queries; handoff to human support when needed. This balances speed of setup and user privacy considerations.

## Constitution Check

Loaded constitution template from `.specify/memory/constitution.md`. The constitution contains core principles and governance placeholders that must be filled or acknowledged before major design decisions.

Gates to verify before Phase 0 research proceed without violations:

- Principle: [PRINCIPLE_3_NAME] (e.g., Test-First) is present in constitution template and must be satisfied during implementation. Current plan will include tests as part of Phase 1.

## Constitution Check (conclusion)

- The project constitution template was loaded from `.specify/memory/constitution.md` and reviewed.
- Key non-negotiable principle placeholders (e.g., Test-First / TDD) are present in the template and will be enforced during implementation: Phase 1 designs will include test definitions and CI integration as required by the constitution.
- No constitution violations were detected that block Phase 0 research. Any mandatory governance items discovered during stakeholder review will be incorporated into Phase 1 design.

## Phase 0 Outcome

- Research tasks created in `research.md` to resolve technical unknowns (language, framework, DB, chatbot choices, image/storage, privacy defaults).
- After completing research, update `plan.md` Technical Context fields and re-run `update-agent-context.ps1` if technologies are chosen.

## Project Structure

### Documentation (this feature)

```
specs/001-project-vision-mission/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (suggested structure)

```
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/
```

**Structure Decision**: Web application with separate `frontend/` and `backend/` projects. This matches the user-facing flows (browsing, listing, chat) and administrative backend.

## Complexity Tracking

No constitution violations identified that block Phase 0 research. If the constitution requires a specific development workflow or mandatory technology choices, Phase 0 will capture and adapt those into the design.
````# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]  
**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]  
**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]  
**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]
**Project Type**: [single/web/mobile - determines source structure]  
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

[Gates determined based on constitution file]

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
````
