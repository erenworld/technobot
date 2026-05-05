## Summary

This PR implements a granular permission-based security system (replacing the old RolesGuard) and fixes several business logic issues across the Team, User, and MatchSumo modules. It also introduces a comprehensive API documentation file and expands the test suite to 89 passing tests.

## Changes

### Security & Authorization
- **New Permission System**: Added `Permission` enum and `ROLE_PERMISSIONS` matrix.
- **Guard Migration**: Replaced `RolesGuard` with `PermissionsGuard` globally.
- **Decorator**: Added `@RequirePermissions()` for fine-grained access control.
- **Hybrid Logic**: Implemented "Own Profile" check in `UserController` to allow users to manage their own data while restricting access to others.

### Business Logic
- **Team Module**: Fixed valid statuses for technical control and added missing event types (`formule_robot`, `design`, etc.) to filters.
- **MatchSumo Module**: Implemented `GET /api/matchs-sumo` with support for edition, poule, zone, and status filters.
- **User Module**: Refactored `UserCreate` and `UserEdit` to return the modified `User` entity for better API responses.

### Documentation & Tests
- **API Docs**: Created `docs/API.md` with a full endpoint reference and permission matrix.
- **New Tests**: Added `MatchSumoController.spec.ts`, `UserController.spec.ts`, `PermissionsGuard.spec.ts`, and `RolePermissions.spec.ts`.
- **Test Fixes**: Updated `app.routes.spec.ts` and `TeamController.spec.ts` to align with the new security architecture.

## Verification

- [x] `npm run build` - Success
- [x] `npm test` - 89 passed, 0 failed
- [x] Manual verification of `GET /api/health` and route protection.

## Notes

- The `RolesGuard` has been deprecated in favor of `PermissionsGuard`.
- All Use Cases in the User module now return entities instead of `void`.
- Documentation follows the "No Emojis" and "No Em-dashes" constraint as requested.
