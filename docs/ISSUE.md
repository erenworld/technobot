# Issue: Enhance API Security with Granular Permissions and Refine Business Logic

## Problem Statement

The current implementation of the TechnoBot API uses a simple Role-Based Access Control (RBAC) system (`RolesGuard`) which is too rigid for certain complex scenarios. For example, a user should be able to edit their own profile regardless of their role, while only admins should be able to edit any profile. This "ownership" logic is difficult to represent with static roles alone.

Additionally, several business logic inconsistencies were identified:
- Technical control statuses in the `Team` module did not match the database schema.
- Event filtering for teams was incomplete.
- The Sumo match module lacked a comprehensive listing endpoint with proper filters.
- Use cases in the User module were returning `void`, making it difficult for the API to return the created/updated data to the client.

## Proposed Solution

1.  **Permission-Based Security (ABAC Lite)**:
    - Introduce a `Permission` enum for granular actions.
    - Implement a mapping between roles and sets of permissions.
    - Create a `PermissionsGuard` to validate these granular requirements.
    - Implement hybrid authorization logic in the `UserController` to handle profile ownership.

2.  **Business Logic Fixes**:
    - Constrain `UpdateControleTechniqueDto` to valid database statuses.
    - Expand event filters to include all tournament categories.
    - Implement a robust `GET /api/matchs-sumo` route with filtering capabilities (edition, poule, zone, status).

3.  **Architecture & DX Improvements**:
    - Update Use Cases to return Domain Entities.
    - Ensure controllers return clean Plain Objects via `toPlainObject()`.
    - Centralize API documentation in `docs/API.md`.

## Goals
- [x] Implement Granular Permission System
- [x] Update all protected routes to use `@RequirePermissions`
- [x] Implement hybrid "Own Profile" logic for users
- [x] Fix Technical Control and Event validation
- [x] Implement Sumo Match listing with filters
- [x] Update unit and integration tests (100% pass rate)
- [x] Finalize API Documentation
