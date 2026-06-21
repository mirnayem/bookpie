# BookPie Local Credentials

This file tracks local development and demo credentials only. Do not add production secrets here.

## Admin Login

Use this account for the web admin dashboard at `http://localhost:3000/admin`.

| Field | Value |
| --- | --- |
| Email | `admin@bookpie.local` |
| Password | `password123` |
| Role | `super_admin` |
| API login endpoint | `POST http://127.0.0.1:4000/api/v1/auth/login` |

Login payload:

```json
{
  "email": "admin@bookpie.local",
  "password": "password123"
}
```

Source: `apps/api/migrations/0009_seed_demo_data.sql`.

## Seeded Demo Users

All seeded demo users use the same password: `password123`.

| Name | Email | Role | Phone |
| --- | --- | --- | --- |
| BookPie Super Admin | `admin@bookpie.local` | `super_admin` | `+8801700000001` |
| BookPie Customer | `customer@bookpie.local` | `customer` | `+8801700000002` |
| Warehouse Manager | `warehouse@bookpie.local` | `warehouse_manager` | `+8801700000003` |
| Delivery Agent | `delivery@bookpie.local` | `delivery_agent` | `+8801700000004` |

Source: `apps/api/migrations/0009_seed_demo_data.sql`.

## Local API Environment

| Key | Value |
| --- | --- |
| API base URL | `http://127.0.0.1:4000/api/v1` |
| Health check | `http://127.0.0.1:4000/health/live` |
| `APP_ENV` | `development` |
| `API_HOST` | `127.0.0.1` |
| `API_PORT` | `4000` |
| `DATABASE_URL` | `postgres://bookpie:bookpie@localhost:5433/bookpie` |
| `REDIS_URL` | `redis://127.0.0.1:6379` |
| `MEILI_URL` | `http://127.0.0.1:7700` |
| `MEILI_BOOKS_INDEX` | `books` |
| `JWT_SECRET` | `change-me-in-production` |
| `JWT_ISSUER` | `bookpie-api` |
| `CORS_ORIGINS` | `http://localhost:3000` |

Source: `apps/api/.env.example`.

## Local Infrastructure

These values come from `docker-compose.yml`.

| Service | URL / Port | Username / Key | Password |
| --- | --- | --- | --- |
| PostgreSQL | `localhost:5433` | `bookpie` | `bookpie` |
| Redis | `localhost:6379` | none | none |
| Meilisearch | `http://localhost:7700` | `MEILI_MASTER_KEY` | `bookpie-master-key` |
| MinIO API | `http://localhost:9000` | `bookpie` | `bookpie-secret` |
| MinIO console | `http://localhost:9001` | `bookpie` | `bookpie-secret` |
| Grafana | `http://localhost:3001` | `admin` | `admin` |
| NATS | `localhost:4222` | none | none |
| NATS monitoring | `http://localhost:8222` | none | none |
| Prometheus | `http://localhost:9090` | none | none |

## Notes

- Run migrations, including `apps/api/migrations/0009_seed_demo_data.sql`, before using the seeded login accounts.
- The web client defaults to `http://127.0.0.1:4000/api/v1` when `NEXT_PUBLIC_API_URL` is not set.
- The local API env file is expected at `apps/api/.env`; `apps/api/.env.example` is the tracked template.
