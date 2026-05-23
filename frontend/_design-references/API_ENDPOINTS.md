# TunHire Core Service API Endpoints

Base URL (local): http://localhost:8081

## Auth
- POST /auth/register
  - Auth: public
  - Body: { email, password, firstName, lastName, phone, role }
- POST /auth/login
  - Auth: public
  - Body: { email, password }
- POST /auth/logout
  - Auth: Bearer token
- GET /auth/me
  - Auth: Bearer token

## Candidates
- GET /candidates/me
  - Auth: role CANDIDATE
- PUT /candidates/me
  - Auth: role CANDIDATE
  - Body: UpdateProfileRequest
- POST /candidates/me/skills
  - Auth: role CANDIDATE
  - Body: SkillRequest
- DELETE /candidates/me/skills/{id}
  - Auth: role CANDIDATE
- POST /candidates/me/cv/parse
  - Auth: role CANDIDATE
  - Content-Type: multipart/form-data, field: file
- GET /candidates/{id}
  - Auth: role RECRUITER

## Applications
- POST /applications
  - Auth: role CANDIDATE
  - Body: ApplicationCreateRequest
- GET /applications/{id}
  - Auth: public
- PATCH /applications/{id}/status
  - Auth: role RECRUITER
  - Query: status (ApplicationStatus)
- GET /applications/job/{jobId}/ranked
  - Auth: role RECRUITER
- GET /applications
  - Auth: public
  - Query: jobId (optional), userId (optional)

## Companies
- POST /companies
  - Auth: role RECRUITER or ADMIN
  - Body: CompanyCreateRequest
- GET /companies/{id}
  - Auth: public
- GET /companies/slug/{slug}
  - Auth: public
- PUT /companies/{id}
  - Auth: role RECRUITER or ADMIN
  - Body: CompanyUpdateRequest
- GET /companies/{id}/jobs
  - Auth: Bearer token (authorization enforced in service)
- GET /companies/{id}/applications
  - Auth: Bearer token (authorization enforced in service)
- GET /companies/{id}/dashboard
  - Auth: Bearer token (authorization enforced in service)

## Company Members
- GET /companies/{companyId}/members
  - Auth: Bearer token
- POST /companies/{companyId}/members
  - Auth: Bearer token
  - Body: MembershipRequest
- POST /companies/{companyId}/members/invites
  - Auth: Bearer token
- DELETE /companies/{companyId}/members/{userId}
  - Auth: Bearer token
- PATCH /companies/{companyId}/members/{userId}/role
  - Auth: Bearer token
  - Query: role (MemberRole)

## Company Invitations
- POST /companies/invites/accept
  - Auth: Bearer token
  - Body: AcceptInviteRequest

## Jobs
- POST /jobs
  - Auth: role RECRUITER
  - Body: JobRequest
- GET /jobs
  - Auth: public
  - Query: page (default 0), size (default 10)
- GET /jobs/{id}
  - Auth: public
- PUT /jobs/{id}
  - Auth: role RECRUITER
  - Body: JobRequest
- PATCH /jobs/{id}/status
  - Auth: role RECRUITER
  - Query: status (JobStatus)
- DELETE /jobs/{id}
  - Auth: role RECRUITER
