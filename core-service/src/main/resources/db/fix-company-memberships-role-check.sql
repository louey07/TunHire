-- Align legacy PostgreSQL constraints with current Java enums.

UPDATE company_memberships
SET role = 'RECRUITER_ADMIN'
WHERE role IN ('OWNER', 'ADMIN');

ALTER TABLE company_memberships
DROP CONSTRAINT IF EXISTS company_memberships_role_check;

ALTER TABLE company_memberships
ADD CONSTRAINT company_memberships_role_check
CHECK (role IN ('RECRUITER_ADMIN', 'MEMBER'));

UPDATE jobs
SET status = 'OPEN'
WHERE status IN ('ACTIVE', 'PUBLISHED', 'LIVE');

UPDATE jobs
SET status = 'CLOSED'
WHERE status IN ('INACTIVE', 'ARCHIVED');

UPDATE jobs
SET status = 'DRAFT'
WHERE status IS NULL OR status NOT IN ('DRAFT', 'OPEN', 'CLOSED');

ALTER TABLE jobs
DROP CONSTRAINT IF EXISTS jobs_status_check;

ALTER TABLE jobs
ADD CONSTRAINT jobs_status_check
CHECK (status IN ('DRAFT', 'OPEN', 'CLOSED'));
