# E-mail registration verification

This project verifies registration by e-mailing the user a 6-digit code,
which they type back into the registration page. No third-party service or
device bridge is required — the backend sends mail directly over SMTP.

## 1. Configure SMTP credentials

Set the following in `.env` (see `.env.example`):

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=you@example.com
SMTP_PASSWORD=your-app-password
MAIL_FROM_ADDRESS=no-reply@example.com
MAIL_FROM_NAME=Agence Travel
EMAIL_CODE_EXPIRATION_MINUTES=10
```

If you use Gmail, generate an **App Password** (Google Account → Security →
2-Step Verification → App passwords) rather than your normal password;
Gmail rejects plain-password SMTP logins.

## 2. Flow

1. `POST /api/auth/register` creates the account in an unverified state,
   generates a 6-digit code, hashes it, and e-mails it to the address the
   user registered with. The response contains a `verificationId`, a
   masked version of the e-mail address, and how many seconds the code is
   valid for.
2. The user checks their inbox, enters the code on the registration page,
   which calls `POST /api/auth/verify-email` with `{ verificationId, code }`.
3. On success the account is marked verified and the endpoint returns an
   `AuthResponse` (JWT + user profile) — the user is signed in immediately,
   with no separate login step.
4. If the code expired or wasn't received, `POST
   /api/auth/resend-verification/{verificationId}` issues and e-mails a new
   one.

Unverified accounts cannot log in: `POST /api/auth/login` returns a 400 with
a message asking the user to verify their e-mail first.

## 3. Limits

- A code expires after `EMAIL_CODE_EXPIRATION_MINUTES` minutes (default 10).
- After 5 incorrect attempts, the code must be resent before verification
  can continue.
