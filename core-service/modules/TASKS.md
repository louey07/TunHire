# Tunhire — Fix & Improvement Tasks

## 🔴 Priority 1 — Modular Monolith Architecture
### TASK-001 — Link `Job` to `Company` via a proper foreign key
### TASK-002 — Implement `DefaultJobLookupService` and `DefaultJobSummaryProvider`
### TASK-003 — Remove `UserRepository` from `JobController`
### TASK-004 — Remove cross-domain service injections from `CompaniesController`
### TASK-005 — Enforce module encapsulation (package-private internals)
### TASK-006 — Add ArchUnit tests to enforce module boundary rules
### TASK-007 — (Optional) Split into a Maven multi-module project
### Section B — Recruiter Module & Company Team
### TASK-008 — Create the `recruiter` module structure
### TASK-009 — Model `MemberRole` enum and `CompanyMembership` entity
### TASK-010 — Implement `MembershipService`
### TASK-011 — Add membership management endpoints
### TASK-012 — Update `Job` to belong to the company, not the individual recruiter
### TASK-013 — Update job authorization from user-level to company-level
### TASK-014 — Enforce company-scoped access on all company endpoints
### Section C — Candidate Module
### TASK-015 — Create the `candidate` module structure
### TASK-016 — Model `CandidateProfile` entity
### TASK-017 — Model candidate skills
### TASK-018 — Implement `CandidateService`
### TASK-019 — Add candidate profile endpoints
### TASK-020 — Create `CandidateProfileProvider` interface for cross-module access
### TASK-021 — Auto-create a `CandidateProfile` on candidate registration

## 🔴 Priority 2 — Security Issues

### TASK-008 — Stop trusting `userId` from the request body
- [x] Remove `userId` from `ApplicationCreateRequest`
- [x] Update `ApplicationsController.create()` to accept `Authentication` and extract the user ID from the JWT token
- [x] Pass the resolved `userId` into `ApplicationService.create()`
- [x] Update `ApplicationServiceTest` to reflect the new method signature

### TASK-009 — Add role-based access control (RBAC)
- [x] Enable `@EnableMethodSecurity` in `SecurityConfig`
- [x] Restrict `POST /jobs`, `PUT /jobs/{id}`, `DELETE /jobs/{id}` to `ROLE_RECRUITER` only
- [x] Restrict `POST /applications` to `ROLE_CANDIDATE` only
- [x] Restrict `POST /companies`, `PUT /companies/{id}` to `ROLE_RECRUITER` or `ROLE_ADMIN`

### TASK-010 — Fix user enumeration vulnerability in login
- [x] Fix user enumeration vulnerability in login
### TASK-011 — Externalize secrets from `application.properties`
- [x] Externalize secrets from `application.properties`

## 🟠 Priority 3 — Broken Functionality
### TASK-012 — Fix test database configuration

## 🟠 Priority 4 — Architecture Refinements
### TASK-013 — Replace `IllegalArgumentException` with custom exceptions
### TASK-014 — Replace raw `String status` in `Job` with an enum

## 🟡 Priority 5 — Code Quality
### TASK-015 — Use Lombok on all entities
- [x] Use Lombok on all entities
### TASK-016 — Replace manual timestamp management with JPA Auditing
- [x] Replace manual timestamp management with JPA Auditing
### TASK-017 — Add `@Transactional` to service methods
- [x] Add `@Transactional` to service methods
### TASK-018 — Add pagination to `GET /jobs`
- [x] Add pagination to `GET /jobs`
### TASK-019 — Rename base package from `com.tunhire` to `com.tunhire`
- [x] Rename base package from `com.example` to `com.tunhire`

## 🟡 Priority 6 — Infrastructure & DevOps
### TASK-020 — Pin PostgreSQL version in `compose.yaml`
### TASK-021 — Optimize Dockerfile with Maven dependency caching
### TASK-022 — Gate Swagger UI behind a Spring profile

## 🟡 Priority 7 — Test Coverage
### TASK-023 — Add unit tests for `AuthService`
### TASK-024 — Add unit tests for `JobService`
### TASK-025 — Add integration / controller tests

## 📋 Task Summary
