# Missing Frontend Pages (TunHire)

This file lists missing pages and a short Stitch UI/UX prompt for each page so the design aligns with backend APIs.

## /companies/[slug]
Prompt (Stitch): Design a public company profile page for route /companies/[slug]. Data sources: GET /companies/slug/{slug} -> company {id, name, slug, description, logoUrl, location}; then GET /companies/{id}/jobs -> list of jobs. Layout should include company header (logo, name, location), about/description section, and an open roles list with job cards (title, location, status, salary range if present) and a clear CTA to view the job detail. Include empty, loading, and error states for the job list.

## /companies/[id] (optional fallback)
Prompt (Stitch): Design a public company profile fallback page for route /companies/[id]. Data source: GET /companies/{id} -> company {id, name, slug, description, logoUrl, location}. Layout should include company header and description. Include a placeholder or optional jobs section if jobs are available. Include loading, empty, and error states.

## /dashboard/candidate/applications
Prompt (Stitch): Design a candidate "My Applications" dashboard page at /dashboard/candidate/applications. Data source: GET /applications?userId={userId} -> list of applications {id, jobId, status, createdAt}. Show a list with status and submitted date, and a CTA to open application detail (/dashboard/candidate/applications/[id]). If job title is desired, indicate optional lookup via GET /jobs/{id}. Include loading, empty, and error states. Requires authenticated candidate.

## /dashboard/candidate/applications/[id]
Prompt (Stitch): Design a candidate application detail page at /dashboard/candidate/applications/[id]. Data source: GET /applications/{id} -> application details {id, jobId, status, createdAt, ...}. Show status timeline or badge, submitted date, and any available details. Include loading and error states. Requires authenticated candidate.

## /dashboard/recruiter/jobs
Prompt (Stitch): Design a recruiter job management page at /dashboard/recruiter/jobs. Data source: GET /companies/{id}/jobs -> list of jobs {id, title, location, status, salaryMin, salaryMax}. Provide a job list/table with actions: edit (PUT /jobs/{id}), change status (PATCH /jobs/{id}/status?status=...), and delete (DELETE /jobs/{id}). Include empty, loading, and error states.

## /dashboard/recruiter/jobs/new
Prompt (Stitch): Design a recruiter job creation page at /dashboard/recruiter/jobs/new. Form should match JobRequest from backend and submit via POST /jobs. Include standard job fields (title, location, description, salary range, status if required) and validation/error states. Include success state that routes back to /dashboard/recruiter/jobs.

## /dashboard/recruiter/candidates/[id]
Prompt (Stitch): Design a recruiter candidate profile view at /dashboard/recruiter/candidates/[id]. Data source: GET /candidates/{id} -> candidate profile {id, userId, bio, resumeUrl, skills}. Include summary header, bio, skills list, and link to resume if present. Include loading and error states. Requires authenticated recruiter.

## /dashboard/recruiter/applications/[id] (optional)
Prompt (Stitch): Design a recruiter application detail page at /dashboard/recruiter/applications/[id]. Data source: GET /applications/{id} -> application details. Provide status controls that map to PATCH /applications/{id}/status?status=... and show status history or current status prominently. Include loading and error states.

## /dashboard/recruiter/company
Prompt (Stitch): Design a recruiter company settings page at /dashboard/recruiter/company. Data source: GET /companies/{id} -> company details. Provide an editable form matching CompanyUpdateRequest and save via PUT /companies/{id}. Include loading, error, and save states.

## /dashboard/recruiter/team
Prompt (Stitch): Design a recruiter team management page at /dashboard/recruiter/team. Data source: GET /companies/{companyId}/members -> list of members {userId, role, joinedAt}. Provide actions to add member (POST /companies/{companyId}/members), remove member (DELETE /companies/{companyId}/members/{userId}), and change role (PATCH /companies/{companyId}/members/{userId}/role?role=...). Include loading and error states.

## /dashboard/recruiter/team/invites
Prompt (Stitch): Design a recruiter invite generation page at /dashboard/recruiter/team/invites. Provide a form to create invites via POST /companies/{companyId}/members/invites. Display the returned invite token or link in a copyable format and show any expiration metadata if present. Include loading and error states.

## /invites/accept
Prompt (Stitch): Design an invite acceptance page at /invites/accept. Provide an input for invite token/code matching AcceptInviteRequest and submit via POST /companies/invites/accept. Include success state that routes to /dashboard/recruiter/company. Include loading and error states. Requires authenticated user.

## /404
Prompt (Stitch): Design a friendly not found page for /404 with a clear message and a primary action that routes to /jobs.

## /500
Prompt (Stitch): Design a generic error page for /500 with a retry action and a secondary link back to /jobs.
