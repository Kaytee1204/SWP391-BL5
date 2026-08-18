# AI Coding Guidelines

This repository is a Japanese learning platform with a Spring Boot backend and multiple frontend entries.

## General

- Read existing code before editing and preserve unrelated user changes.
- Keep backend code under `backend/src/main/java/com/example/base`.
- Keep controllers thin, business rules in services, and database access in repositories.
- Use the existing `ApiResponse`, exception, JWT, role, and DTO conventions.
- Personal resources must derive their owner from the authenticated `UserPrincipal`; never trust a client-supplied account ID.
- Do not commit generated folders such as `target`, `node_modules`, or `dist`.

## Verification

- Backend: run `mvn test` or at least `mvn -DskipTests compile` from `backend`.
- Frontend learning app: run `npm run build` from `frontend`.
- Use the `local` Spring profile for an isolated H2 smoke test. The default profile must continue to use SQL Server without schema mutation.
