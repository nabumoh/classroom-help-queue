# Monitoring Plan

## Logs

- Each Lambda writes request/response errors to CloudWatch Logs.
- Keep log retention to 14 days for student project cost control.

## Metrics and Alarms

Create at least these alarms:

1. Lambda Errors > 0 for 5 minutes (per function).
2. API Gateway 5XXError > 1 for 5 minutes.
3. DynamoDB ThrottledRequests > 0 for 5 minutes.

## Dashboard

Build one CloudWatch dashboard with:

- API request count and latency.
- Lambda invocations and errors.
- DynamoDB consumed read/write capacity and throttles.
