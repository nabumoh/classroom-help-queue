# Team Workflow for 3 Students

## Branch Strategy

- `main`: protected production branch.
- `feature/<name>`: individual feature branches.
- Short-lived pull requests into `main`.

## Required Team Process

1. Each student uses their own GitHub account and local clone.
2. Each student opens pull requests from their branch.
3. At least one teammate reviews each pull request before merge.
4. Squash merges disabled if you want to show multiple commits per student.

## Suggested Ownership

- Student A: backend Lambda + API contracts.
- Student B: frontend UI + UX.
- Student C: CI/CD, DNS/HTTPS, and monitoring.

## Why This Matters

Commit authorship is tied to the account that pushed commits. Do not fake co-author names. Real contribution history requires each student to commit with their own identity.
