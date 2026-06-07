# [OPEN] Debug Session: login-500-error

## Summary
- Symptom: server-side login returns `Internal server error`.
- Expected: login API should return success or a clear auth error such as `401`.

## Hypotheses
1. Database query fails during login because server DB config or permissions are incorrect.
2. `bcrypt` password verification fails at runtime on Linux server.
3. JWT signing fails because `JWT_SECRET` is missing or invalid in server env.
4. Middleware/response handling throws after auth logic, surfacing as generic `500`.

## Evidence Log
- Debug server started on `http://127.0.0.1:7777`.
- Instrumentation added to `app/api/auth/login/route.ts` covering:
  - request parsing
  - DB lookup
  - bcrypt verification
  - JWT signing
  - final catch branch
- User verified on Ubuntu server:
  - Docker container `aiag-postgres` is `healthy`
  - database `project_db` is reachable with `project_user`
  - `users` table exists and contains `admin`, `staff`, `accountant`, `dairyfood`, `nongdu`
- Server `.env.local` now exists and includes:
  - `DATABASE_URL`
  - `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD`
  - `JWT_SECRET`
  - `UPLOAD_ROOT/ACCOUNTANT_ROOT`
- After `.env.local` was created and app restarted, browser login no longer returns `500`.
- Current server response is `401 Unauthorized` for `POST /api/auth/login`.

## Hypothesis Status
- H1 Database unavailable or missing users: largely rejected.
- H2 bcrypt runtime failure: unlikely, because route now returns expected auth status instead of `500`.
- H3 JWT/env configuration failure: supported as previous root cause for `500`; after adding `.env.local`, symptom changed from `500` to `401`.
- H4 Response/middleware phase failure: rejected for current symptom.

## Next Step
- Confirm whether the original `500` issue is considered fixed.
- If login credentials should work but still return `401`, inspect or reset the target user's password hash.
