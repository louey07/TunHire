# Tunhire Core Service - Technical Documentation

### 1. Project Overview
- **Project name**: tunhire (`core-service`)
- **Primary goal**: A modern hiring platform and applicant tracking system (ATS) that connects candidates with companies. It provides shared team workspaces for recruiters to manage job postings and applications, while allowing candidates to build profiles and apply for roles.
- **Tech stack**: 
  - **Language**: Java 21
  - **Framework**: Spring Boot 3.4.4 (Spring Web, Spring Security)
  - **Database**: PostgreSQL (Production/Dev runtime), H2 (Testing)
  - **ORM**: Spring Data JPA (Hibernate 6.6)
  - **Auth**: JWT (JSON Web Tokens) via `jjwt`
  - **Documentation**: springdoc-openapi (Swagger UI)
  - **Build Tool**: Maven
- **Entry points**: 
  - Main application class: `src/main/java/com.tunhire/tunhire/TunhireApplication.java`
  - Build/Start: `./mvnw spring-boot:run`

### 2. Folder Structure & Purpose
The project follows a **Feature-Based (Domain)** folder structure. Each top-level folder under `com.tunhire.tunhire` represents a distinct architectural module.

- `src/main/java/com.tunhire/tunhire/`
  - `auth/`: Identity management, user registration, login, JWT generation, and global roles.
  - `companies/`: Employer branding, company profiles, and aggregate dashboard views.
  - `jobs/`: Job listing lifecycle, job search, and requirements.
  - `applications/`: The workflow of a candidate applying to a job.
  - `recruiter/`: Company team workspaces, mapping users to companies with specific access levels (`OWNER`, `ADMIN`, `MEMBER`).
  - `candidate/`: Candidate bio, resume links, and skills matrix.
  - `common/`: Shared cross-cutting concerns, cross-module DTOs (e.g., `CandidateProfileProvider`), global exception handlers, and security configuration.
- `src/main/resources/`
  - `application.properties`: Primary configuration file.
- `src/test/java/`
  - `com.tunhire/tunhire/ArchitectureTest.java`: ArchUnit tests enforcing module boundaries.
- `compose.yaml`: Docker Compose file defining the PostgreSQL database service.

### 3. Architecture & Design Patterns
- **Overall style**: Modular Monolith exposing a REST API.
- **Layers**: Each module uses a standard layered architecture:
  - **Presentation**: `*Controller.java` (handles HTTP and routing).
  - **Business Logic**: `*Service.java` / `*ServiceImpl.java` (transactional business rules).
  - **Data Access**: `*Repository.java` (Spring Data JPA interfaces).
- **Key patterns**:
  - **Soft-References / Bounded Contexts**: Modules do not directly reference each other's database entities unless structurally necessary (e.g., `Job` belongs to `Company`). `Application`, `CandidateProfile`, and `CompanyMembership` store loose `Long userId` references rather than JPA `@ManyToOne` user references.
  - **Dependency Injection**: Provided by Spring IoC.
  - **Provider/Interface Pattern**: Cross-module communication relies on interfaces defined in shared or consuming packages (e.g., `CandidateProfileProvider`, `JobLookupService`) to avoid direct repository imports across domain boundaries.
  - **Lazy Creation**: Candidate profiles are generated on-the-fly upon first access rather than heavily linking to the Auth registration event.
- **Cross-cutting concerns**:
  - **Auth**: Spring Security + JWT Filter (`JwtAuthenticationFilter`).
  - **Error Handling**: `GlobalExceptionHandler` intercepting standard exceptions (e.g., `ResourceNotFoundException`) and formatting them into standard `ErrorResponse` DTOs.
  - **Boundary Enforcement**: ArchUnit (`ArchitectureTest.java`) strictly forbids controllers from importing repositories, and enforces strict isolation between modules (e.g., `applications` cannot import `candidate` internals).

### 4. Core Use Cases (Functional Requirements)
1. **User Registration & Authentication (High Priority)**
   - *Actor*: Guest.
   - *Flow*: Submits email/password/role. System creates `User` and returns JWT.
2. **Company & Team Management (High Priority)**
   - *Actor*: Recruiter.
   - *Flow*: Recruiter creates a Company. They are auto-assigned the `OWNER` role. They invite other recruiters as `MEMBER` or `ADMIN`.
3. **Job Posting (High Priority)**
   - *Actor*: Recruiter (`OWNER` or `ADMIN`).
   - *Flow*: Recruiter creates a job under their company. System validates their membership before allowing creation.
4. **Candidate Profile Management (Medium Priority)**
   - *Actor*: Candidate.
   - *Flow*: Candidate logs in, accesses `/candidates/me`. System lazily creates a profile. Candidate updates bio and skills.
5. **Job Application (High Priority)**
   - *Actor*: Candidate.
   - *Flow*: Candidate submits application to a `jobId`. System extracts `userId` from JWT and creates an `Application`.
6. **Recruiter Dashboard (High Priority)**
   - *Actor*: Recruiter.
   - *Flow*: Views company dashboard. System aggregates active jobs and candidate applications (enriched with candidate profile names/headlines).

### 5. User Types / Actors
- **Global Roles** (Stored in `User.role`, verified via `@PreAuthorize("hasRole('...')")`):
  - `CANDIDATE`: Can manage their own profile and apply to jobs.
  - `RECRUITER`: Can create companies, manage jobs, and view applicants.
  - `ADMIN`: System administrator.
- **Contextual Roles** (Stored in `CompanyMembership.role`, verified via `MembershipService`):
  - `OWNER`: Full company control, can change roles or delete the company workspace.
  - `ADMIN`: Can edit company details, jobs, and remove standard members.
  - `MEMBER`: Read/write access to jobs and applications, but no team management permissions.
- **Identification**: All actors are identified via **JWT Bearer Tokens** passed in the `Authorization` header. Identity is resolved via `AuthService.getUserIdByEmail(principal.getName())`.

### 6. Domain Entities & Data Model
- **Auth Module**
  - `User`: `id`, `email`, `password`, `firstName`, `lastName`, `role`.
- **Companies Module**
  - `Company`: `id`, `name`, `slug`, `description`, `logoUrl`, `location`.
- **Recruiter Module**
  - `CompanyMembership`: `id`, `userId` (soft ref), `company` (`@ManyToOne`), `role` (`OWNER`/`ADMIN`/`MEMBER`), `joinedAt`.
- **Jobs Module**
  - `Job`: `id`, `title`, `company` (`@ManyToOne`), `location`, `status`, `salaryMin/Max`.
- **Candidate Module**
  - `CandidateProfile`: `id`, `userId` (soft ref, unique), `bio`, `resumeUrl`.
  - `CandidateSkill`: `id`, `profileId` (soft ref), `skillName`.
- **Applications Module**
  - `Application`: `id`, `jobId` (soft ref), `userId` (soft ref), `status` (`SUBMITTED`, `IN_REVIEW`, etc.), `createdAt`.
- **Database Schema Notes**: Managed by Hibernate (`ddl-auto=update`). Business rules (e.g., verifying a recruiter belongs to the company they are posting a job for) are enforced at the **Service layer**, not database constraints, due to the modular architecture's loose coupling.

### 7. API / Public Interface
*All endpoints generally return a standardized `ApiResponse<T>` wrapper.*

- **Auth**
  - `POST /auth/register` (Public) - Returns JWT.
  - `POST /auth/login` (Public) - Returns JWT.
- **Companies**
  - `POST /companies` (Auth: RECRUITER)
  - `GET /companies/{id}` (Public)
  - `PUT /companies/{id}` (Auth: RECRUITER + OWNER/ADMIN)
  - `GET /companies/{id}/dashboard` (Auth: RECRUITER + MEMBER)
- **Recruiter (Team)**
  - `GET /companies/{id}/members` (Auth: RECRUITER + MEMBER)
  - `POST /companies/{id}/members` (Auth: RECRUITER + OWNER/ADMIN)
  - `PATCH /companies/{id}/members/{userId}/role` (Auth: RECRUITER + OWNER)
  - `DELETE /companies/{id}/members/{userId}` (Auth: RECRUITER + OWNER/ADMIN)
- **Jobs**
  - `POST /jobs` (Auth: RECRUITER)
  - `PUT /jobs/{id}` (Auth: RECRUITER + MEMBER of owning company)
  - `DELETE /jobs/{id}` (Auth: RECRUITER + MEMBER of owning company)
  - `GET /jobs` (Public)
- **Candidate**
  - `GET /candidates/me` (Auth: CANDIDATE)
  - `PUT /candidates/me` (Auth: CANDIDATE)
  - `POST /candidates/me/skills` (Auth: CANDIDATE)
  - `GET /candidates/{id}` (Auth: RECRUITER)
- **Applications**
  - `POST /applications` (Auth: CANDIDATE)
  - `GET /applications/job/{jobId}` (Auth: RECRUITER)

### 8. Dependencies & Integrations
- **External Services**:
  - PostgreSQL (Primary Data Store) - Configured via `compose.yaml`.
- **Environment Variables**: Currently hardcoded in `application.properties` (Identified as Tech Debt).
  - `spring.datasource.url`
  - `spring.datasource.username` / `password`
  - `jwt.secret`
  - `jwt.expiration-ms`

### 9. Current Technical Debt & Known Issues
Based on the `TASKS.md` and codebase analysis, the following technical debt remains:
1. **Security Vulnerabilities** (Priority 2):
   - `ApplicationService.create()` currently trusts `userId` from the DTO payload (TASK-008). It should extract it directly from the JWT.
   - Login enumeration vulnerability: Incorrect email vs incorrect password yield different errors (TASK-010).
   - Hardcoded Secrets: `application.properties` contains unencrypted DB credentials and JWT secrets (TASK-011).
   - Global RBAC (`@PreAuthorize`) is only partially applied; needs to be strictly enforced on `JobController` and `ApplicationsController` (TASK-009).
2. **Architecture Refinements** (Priority 4):
   - `Job.status` is a raw `String`. Needs refactoring to an Enum (`JobStatus`).
   - Need custom Exceptions (e.g., `UnauthorizedException`) instead of throwing `IllegalArgumentException` in service logic.
3. **Code Quality & DevOps** (Priority 5 & 6):
   - Missing JPA Auditing (`@CreatedDate`, `@LastModifiedDate`).
   - Pagination is missing on `GET /jobs`.
   - Swagger UI should be gated behind a specific Spring profile.

### 10. Setup & Development Guide (for AI)
1. **Dependencies**: Requires JDK 21+ and Docker.
2. **Database Setup**: 
   - Run `docker compose up -d` to start PostgreSQL on port `5433`.
3. **Run Application**:
   - `./mvnw spring-boot:run`
4. **Run Tests**:
   - `./mvnw clean test`
   - *Note*: Tests are configured to use an H2 in-memory database (`application-test.properties`), so Docker is not required for the test suite. ArchUnit tests run automatically as part of this suite.
5. **Code Style**: Standard Java conventions. Prefer Java 21 `record` types for all new DTOs.

### 11. Recommendations for Continuing Development
- **Safe to extend immediately**: Candidate profiles, Recruiter memberships, and Company aggregates are structurally sound and heavily tested.
- **Needs refactoring before new features**: Implement **Priority 2 Security Issues** (specifically extracting `userId` from JWTs in the `applications` module instead of DTOs) to prevent data spoofing.
- **Suggested next feature implementation plan**:
  1. Fix `TASK-008`: Update `ApplicationCreateRequest` to drop `userId`. Inject `Authentication` into `ApplicationsController` and pass the resolved ID to the service.
  2. Fix `TASK-009`: Add `@EnableMethodSecurity` to `SecurityConfig` and attach `@PreAuthorize("hasRole('RECRUITER')")` to Job/Company mutation endpoints.
  3. Fix `TASK-011`: Shift hardcoded variables to `.env` and update `application.properties` to use `${JWT_SECRET}`.

### 12. Questions for the Human
- What specific matching algorithms or resume parsing integrations (if any) are planned for the `applications` module?
- Should a candidate be allowed to apply to the same job multiple times, or is that a strict invariant that needs database-level enforcement?
- Where will the application be deployed (AWS, Heroku, local server)? This will inform how we structure the Dockerfile optimizations (TASK-021).
