# Security Guidelines

## Input Validation
- Validate ALL user input with `zod` schemas at the API boundary.
- Never trust client-side data — re-validate on the server.
- Sanitize HTML output to prevent XSS (use `DOMPurify` if rendering raw HTML).
- Limit string lengths: names ≤ 40 chars, descriptions ≤ 2000.

## SQL Injection
- Use Prisma's parameterized queries — never concatenate SQL strings.
- For raw queries, use `Prisma.sql` tagged template.

## XSS Prevention
- React escapes output by default — do NOT use `dangerouslySetInnerHTML`
  unless content is sanitized.
- Set `Content-Security-Policy` header:
  ```
  default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
  ```
  (Next.js inline scripts need a nonce — prefer nonces over `'unsafe-inline'`.)
- Enable `X-Content-Type-Options: nosniff`.

## Authentication & Authorization
- Use NextAuth.js or Lucia for auth.
- Store passwords with `argon2` (never bcrypt, never plaintext).
- Session tokens: httpOnly, secure, sameSite=strict cookies.
- Rate limit auth endpoints: 5 attempts / 15 min.

## API Security
- Rate limiting: 100 req/min per IP (anonymous), 1000 (authenticated).
- Use `helmet` middleware for security headers.
- CORS: whitelist only your frontend origin.
- Disable `X-Powered-By` header.

## Secrets Management
- NEVER commit `.env` files.
- Use `.env.example` with placeholder values.
- Rotate API keys every 90 days.
- Use a secrets manager (Vercel, Doppler, or 1Password) in production.

## Dependencies
- Run `npm audit` weekly.
- Pin major versions in `package.json`.
- Review new dependencies before adding — check bundle size and maintenance status.

## Data
- Persona data is public — no PII concerns.
- User accounts: hash emails if storing, never log passwords.
- Backups: daily, encrypted at rest, retained 30 days.

## Incident Response
1. Revoke compromised credentials immediately.
2. Audit logs for suspicious activity.
3. Notify users if their data was affected (within 72h).
4. Post-mortem within 5 business days.