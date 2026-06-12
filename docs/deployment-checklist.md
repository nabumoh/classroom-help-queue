# Deployment Checklist (Teacher Submission)

This checklist captures the exact CI/CD setup state for the project.

## Teacher Rubric Alignment

1. AWS working system: Completed
2. Documented repository: Completed
3. Clear README: Completed
4. CI/CD via GitHub Actions: Completed
5. Domain or subdomain: Completed (subdomain delegated and publicly validated)
6. HTTPS: Verify ACM cert attached to CloudFront before submission
7. Monitoring: CloudWatch plan documented and should be demonstrated
8. Architecture diagram: Completed

## Subdomain Delegation Status

- Delegated subdomain: nadeem-queue-62957.proj.rotem.click
- Portal status: DNS_RECORD_CREATED
- Validation status: VALIDATED
- Public DNS check: resolved and matching expected NS records
- Name servers:
  - ns-603.awsdns-11.net.
  - ns-1676.awsdns-17.co.uk.
  - ns-405.awsdns-50.com.
  - ns-1223.awsdns-24.org.

## Completed in AWS

- Account ID: 173322643459
- Region used for backend workflow: us-east-1
- IAM OIDC provider created:
  - arn:aws:iam::173322643459:oidc-provider/token.actions.githubusercontent.com
- IAM deploy role created:
  - Role name: github-actions-classroom-help-queue-deploy
  - Role ARN: arn:aws:iam::173322643459:role/github-actions-classroom-help-queue-deploy
  - Trust scope: repo `nabumoh/classroom-help-queue`, branch `main`

## Frontend Infrastructure Values (discovered)

- FRONTEND_BUCKET: nadeem-website-s3
- CLOUDFRONT_DISTRIBUTION_ID: E1G6EKS3JOFRU9

## GitHub Repository Configuration Required

Set these in GitHub repository settings for `nabumoh/classroom-help-queue`.

### Secrets

- AWS_ROLE_TO_ASSUME = arn:aws:iam::173322643459:role/github-actions-classroom-help-queue-deploy
- ADMIN_PIN = <your admin pin value>

### Variables

- AWS_REGION = us-east-1
- FRONTEND_BUCKET = nadeem-website-s3
- CLOUDFRONT_DISTRIBUTION_ID = E1G6EKS3JOFRU9

## Workflows Already Hardened (No Silent Skip)

- `.github/workflows/backend-deploy.yml`
- `.github/workflows/frontend-deploy.yml`

Both workflows fail fast when required config is missing.

## Evidence to Capture for Submission

1. IAM Identity provider list showing `token.actions.githubusercontent.com`.
2. IAM Roles list showing `github-actions-classroom-help-queue-deploy`.
3. GitHub Actions run success for backend deploy workflow.
4. GitHub Actions run success for frontend deploy workflow.
5. Route 53 record (domain/subdomain) pointing to CloudFront.
6. HTTPS certificate in ACM attached to CloudFront distribution.
7. API and frontend live URL checks after deployment.