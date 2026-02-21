# Role-Based Authentication: Deployment & Maintenance

## Overview
- Admin and User roles are separated across UI, routes, and APIs.
- Admins authenticate via wallet or email; wallet must be listed in `ADMIN_WALLETS` (lowercase) or email in `ADMIN_EMAILS`.
- Users authenticate via email/password or wallet.

## Backend Configuration (.env)
- RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS
- MONGO_URI
- ADMIN_EMAILS: comma-separated lowercase emails
- ADMIN_WALLETS: comma-separated lowercase wallet addresses
- Hardcoded admin wallet also allowed: 0xca24ce91e18f5a4646e25db91c01b7d5f21cf775

## API Security
- Rate limiting for `/api/auth/*` and `/api/admin/*`
- RBAC middleware enforces admin-only access
- Inputs validated on auth routes; password hashed with bcrypt

## Frontend Routes
- `/auth-user` and `/auth-admin` (also `/auth` defaults to user)
- Admin-only: `/admin`, `/admin-schemes`, `/admin-applications`, `/admin-users`, `/contract-interaction`
- User: `/apply`, `/schemes`, `/profile`, etc.

## Maintenance
- Update admin lists in `.env`; restart backend
- Monitor rate limiting thresholds based on traffic
- Review MongoDB user records for abnormal activity

## Testing
- Add Jest + Supertest to validate:
  - Non-admin cannot access `/api/admin/*`
  - Admin wallet sets role=admin on login
  - Auth rate limiting returns 429 on abuse

