# BookPie Production Launch Runbook

## Backup Strategy

- Run `scripts/backup-postgres.sh` on a daily schedule.
- Store backups outside the database host with at least 30 days of retention.
- Verify one restore every release cycle with `scripts/restore-postgres.sh`.
- Keep Redis disposable; durable state must live in PostgreSQL.

## Disaster Recovery

- Recovery point objective: 24 hours for MVP.
- Recovery time objective: 4 hours for MVP.
- Restore PostgreSQL from the latest verified backup.
- Re-run migrations before serving traffic.
- Rebuild Meilisearch indexes from PostgreSQL catalog data.

## Blue/Green Deployment

- Deploy the new API and web containers as the green stack.
- Run `/health/ready`, `/openapi.json`, and storefront smoke checks against green.
- Apply migrations before traffic switch when migrations are backward compatible.
- Switch load balancer traffic after green is healthy.
- Keep blue available for rollback until order creation and admin reads are verified.

## Monitoring Alerts

- Alert on `/health/ready` failures for 2 consecutive minutes.
- Alert when API 5xx rate exceeds 2% over 5 minutes.
- Alert when p95 API latency exceeds 800ms over 10 minutes.
- Alert when PostgreSQL connections exceed 80% of pool capacity.
- Alert on failed backup jobs or missing backup artifacts.

## SLA Dashboard

- Track uptime from `/health/live`.
- Track readiness from `/health/ready`.
- Track p95 API latency and request error rate.
- Track order creation success rate.
- Track payment verification success rate.

## Penetration Testing

- Verify JWT expiry and invalid-token rejection.
- Verify admin endpoints reject customer tokens.
- Verify CSRF header checks for cookie-based mutating requests.
- Verify rate limit returns `429`.
- Verify security headers include `x-content-type-options`, `x-frame-options`, `referrer-policy`, and `content-security-policy`.

## Launch Checklist

- Run `cargo clippy -p api --all-targets --all-features`.
- Run `pnpm --filter @bookpie/web lint`.
- Run `pnpm --filter @bookpie/web typecheck`.
- Apply all migrations to production.
- Run `pnpm load:test` against the green stack.
- Confirm admin login, product listing, cart, checkout, and order creation.
- Confirm backup job and monitoring alerts are enabled.
