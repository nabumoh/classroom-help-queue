# Architecture

```mermaid
flowchart LR
  U[Student / TA] --> CF[CloudFront + ACM HTTPS]
  CF --> S3[S3 Static Frontend]
  U --> APIGW[API Gateway]
  APIGW --> L1[Lambda: Create Ticket]
  APIGW --> L2[Lambda: List Tickets]
  APIGW --> L3[Lambda: Update Ticket Status]
  L1 --> DDB[(DynamoDB Tickets Table)]
  L2 --> DDB
  L3 --> DDB
  L1 --> CW[CloudWatch Logs + Metrics]
  L2 --> CW
  L3 --> CW
```

## Core AWS Services

- S3: static web hosting origin for frontend files.
- CloudFront: HTTPS delivery, caching, and custom domain integration.
- API Gateway: REST endpoints for ticket operations.
- Lambda: backend business logic.
- DynamoDB: ticket storage.
- CloudWatch: logs, metrics, alarms.
- Route 53: DNS record for project subdomain.
- ACM: TLS certificates used by CloudFront.
