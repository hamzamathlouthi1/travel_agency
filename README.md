# Agence Travel Platform

A microservice travel-agency platform: an Angular (SSR) frontend backed by
independently deployable Spring Boot microservices. Today there's one
service, `user-service` (registration/login against a Neon Postgres
database), built so more services (hotels, bookings, payments…) can be added
the same way without touching the frontend's routing or Docker setup.

```
agence-travel-platform/
├── docker-compose.yml       # orchestrates every service + the frontend
├── .env.example             # copy to .env and fill in your Neon credentials
├── services/
│   └── user-service/        # Spring Boot 3.3 / Java 21 — auth microservice
│       ├── Dockerfile
│       ├── pom.xml
│       └── src/main/java/com/agence/userservice/
│           ├── controller/AuthController.java      (POST /api/auth/register, /login)
│           ├── service/UserService.java
│           ├── entity/User.java, Civilite.java
│           ├── security/JwtUtil.java, JwtAuthFilter.java
│           ├── config/SecurityConfig.java           (CORS + JWT filter chain)
│           └── repository/UserRepository.java
└── front/                   # Angular 22 (SSR) — the single web client
    ├── Dockerfile
    └── src/app/
        ├── features/public/auth/                    (login/register pages)
        └── core/auth/                                (AuthService, interceptors, guards)
```

Each `services/*` folder is a standalone, independently buildable/deployable
microservice — its own `pom.xml`, own `Dockerfile`, own port. Adding a new
one later (e.g. `services/hotel-service`) just means adding a folder here and
a new block in `docker-compose.yml`.

## How the pieces talk to each other

- **Browser → Angular SSR server**: the browser only ever calls same-origin,
  relative paths like `/api/auth/login` — see `environment.production.ts`
  (`apiBaseUrl: '/api'`).
- **Angular SSR server → user-service**: `front/src/server.ts` proxies every
  `/api/**` request to `USER_SERVICE_URL` (see the "Reverse proxy" block in
  that file). In Docker, `USER_SERVICE_URL=http://user-service:8081` — the
  container name resolves over the internal `agence-network`, so the backend
  is never exposed to the public browser directly and there's nothing to
  configure for CORS in production.
- In **local dev** (`ng serve`, not Docker), the frontend instead calls
  `http://localhost:8081/api` directly (see `environment.ts`) — that's why
  `SecurityConfig.java` keeps CORS wide open, to support that workflow.

## 1. Set up the Neon database

1. Go to https://console.neon.tech and create a project (e.g. `agence`).
2. Create a database (or use the default `neondb`).
3. From **Connection Details**, copy the JDBC URL:
   `jdbc:postgresql://<host>.neon.tech/<database>?sslmode=require`
4. Copy `.env.example` to `.env` at the **repo root** and fill in:
   ```
   DB_URL=...
   DB_USERNAME=...
   DB_PASSWORD=...
   JWT_SECRET=<a long random string>
   ```

No local Postgres install needed — Neon is a managed cloud Postgres and
`user-service` connects to it over JDBC + SSL. Hibernate creates the `users`
table automatically on first boot (`ddl-auto: update`).

## 2. Run everything with Docker (recommended)

From the repo root, with `.env` filled in:

```bash
docker compose up --build
```

- Frontend: **http://localhost:4200**
- Backend (for direct API testing, e.g. Postman): **http://localhost:8081**
- Backend health check: **http://localhost:8081/actuator/health**

`docker compose up` builds both images from scratch inside Linux containers,
which avoids the classic "works on my machine" problem of committing a
`node_modules/` built for a different OS — the frontend `Dockerfile` runs
`npm ci` inside the container itself.

## 3. Run locally without Docker (development)

**Backend** (needs JDK 21 + Maven, or use VS Code's Run button on
`UserServiceApplication.java` — `.vscode/launch.json` is already configured
to load `.env`):

```bash
cd services/user-service
export $(grep -v '^#' ../../.env | xargs)   # or use your IDE's envFile support
mvn spring-boot:run
```

Starts on **http://localhost:8081**.

**Frontend** (needs Node 22.22.3+, since Angular CLI 22 requires it — if
`npm install` warns about `EBADENGINE`, update Node first):

```bash
cd front
npm install
npm start
```

Starts on **http://localhost:4200** and talks straight to
`http://localhost:8081/api` (see `environment.ts`).

## 4. API reference

| Method | URL                   | Description                    |
|--------|-----------------------|---------------------------------|
| POST   | `/api/auth/register`  | Create an account, returns a JWT |
| POST   | `/api/auth/login`     | Sign in, returns a JWT           |

### `POST /api/auth/register`

```json
{
  "civilite": "MR",
  "prenom": "Ahmed",
  "nom": "Ben Salah",
  "email": "ahmed@example.com",
  "mobile": "+21620123456",
  "password": "monMotDePasse123"
}
```

### Response (both endpoints)

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "user": {
    "id": 1,
    "civilite": "MR",
    "prenom": "Ahmed",
    "nom": "Ben Salah",
    "email": "ahmed@example.com",
    "mobile": "+21620123456"
  }
}
```

The Angular app already has working `/login` and `/register` pages
(`front/src/app/features/public/auth/`) wired end-to-end through
`AuthApiService` → `AuthService`, storing the JWT and redirecting home on
success.

## 5. Security notes

- Passwords are hashed with **BCrypt** before storage.
- Protected routes require a **JWT** Bearer token (`Authorization` header).
- `/api/auth/**` and `/actuator/health` are public; everything else on
  `user-service` requires a valid token.
- Never commit your real `.env` — only `.env.example` is meant to be
  committed. Rotate `JWT_SECRET` before deploying anywhere public.

## What changed in this cleanup

- Reorganized into `services/<name>` (microservices) + `front/` so adding
  the next microservice is a copy-paste of the pattern, not a rethink.
- Fixed a **port mismatch**: `docker-compose.yml` published `user-service`
  on host port 8082 while every doc/env pointed at 8081 — both now agree on
  8081.
- Rebuilt the frontend's `node_modules` — the committed copy had
  Windows-only native binaries (`@esbuild/win32-x64`), which is why builds
  failed on Linux/Docker. `npm ci` inside the Docker build now always
  produces the right platform binaries.
- Disabled build-time Google Fonts inlining (`angular.json`) so
  `ng build` succeeds in network-restricted/offline Docker builds; fonts
  still load normally in the browser at runtime via the `<link>` tags in
  `index.html`.
- Replaced the frontend's dev-only Dockerfile (`ng serve` in a container)
  with a proper multi-stage production build that runs the compiled SSR
  server (`server.mjs`), which is fully self-contained (no `node_modules`
  needed at runtime).
- Added a same-origin `/api` reverse proxy inside the SSR server
  (`front/src/server.ts`) so the browser never needs to know the backend's
  address and there's nothing to configure for CORS in production.
- Added `spring-boot-starter-actuator` + `/actuator/health` so Docker
  Compose can healthcheck the backend before starting the frontend.

## Next steps

- Add more services under `services/` (e.g. `hotel-service`,
  `booking-service`, `payment-service`) following the `user-service`
  pattern, and swap the Angular app's `Mock*Provider`s
  (`front/src/app/app.config.ts`) for real HTTP-backed providers as each
  one comes online.
- Consider an API gateway once there's more than one backend service, so
  the frontend's `/api` proxy has a single, stable target instead of one
  entry per service.
- Add Testcontainers-based integration tests for `user-service`.
