# UniRank — JavaScript MERN MVP

UniRank is a university resource hub for students, professors and administrators. It separates study materials into **Bare Minimum** and **Max Distinction** tiers and supports uploads, votes, professor verification, comments, notifications and moderation.

## Technology

- Frontend: React 19, Vite 8, React Router 6, Axios, Tailwind CSS 3, Lucide React, react-hot-toast.
- Backend: Node.js ESM, Express 5, MongoDB/Mongoose, JWT access and rotating refresh sessions, bcryptjs, Multer.
- Runtime: JavaScript only. React UI files use `.jsx`; there are no TypeScript files or compiler configuration.

## Requirements

- Node.js **20.19+** (required by the selected Vite 8 toolchain).
- npm 10+.
- MongoDB 6+ running locally or a MongoDB Atlas connection string.

## 1. Configure environment files

From the project root:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

On Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Edit `backend/.env` and set strong, unique `JWT_SECRET` and `JWT_REFRESH_SECRET` values. Set `MONGO_URI` to your MongoDB instance. The default expects a local MongoDB database named `unirank`.

The frontend defaults to the Vite proxy (`/api`), so `VITE_API_URL` can remain `/api` for local development.

## 2. Install and start everything

The root package coordinates installation of root, frontend and backend dependencies. It runs all three installs concurrently. Then the `prestart` lifecycle automatically installs dependencies before `npm start` launches both development servers.

```bash
npm start
```

Open:

- Frontend: http://localhost:5173
- API health: http://localhost:5000/api/health

After the first install, use `npm run dev` for faster subsequent starts without repeating the install checks.

Other root commands:

```bash
npm run install:all
npm run start:frontend
npm run start:backend
npm run build
npm run seed
```

You can also work in each application independently:

```bash
npm --prefix backend run dev
npm --prefix frontend run dev
```

## 3. Seed demo data

Ensure MongoDB is running and `backend/.env` is configured, then:

```bash
npm run seed
```

The seed script creates 3 universities, 9 faculties, 45 subjects, 1 admin, 2 professors, 5 students and 20 example study resources. It also writes tiny PDF demo files into `backend/uploads/`.

Demo credentials printed by the seed script:

- Admin: `admin@unirank.demo` / `AdminPass123!`
- Professor: `arta@unirank.demo` / `DemoPass123!`
- Student: `student1@unirank.demo` / `DemoPass123!`

Change these credentials and rotate secrets before using any shared or production environment. Seed accounts are for local demonstration only.

## 4. API overview

| Area | Routes |
|---|---|
| Authentication | `POST /api/auth/register`, `/login`, `/refresh`, `/logout`; `GET /api/auth/me`; `PATCH /api/auth/me`, `/me/password` |
| Directory | `GET /api/universities`, `/api/faculties` (aliases are also available under `/api/subjects`), `GET /api/subjects`, `GET /api/subjects/:id`; professor/admin subject create/update; admin soft delete |
| Materials | `GET /api/subjects/:id/materials`, `GET /api/materials/:id`, `POST /api/materials`; voting, verify, download, flag, status, delete actions under `/api/materials/:id` |
| Comments | `GET/POST /api/materials/:id/comments`, `DELETE /api/comments/:id` |
| Administration | `GET /api/admin/users`, `/reports`, `/materials/flagged`; user role/ban/professor-verification and report moderation PATCH routes |
| Notifications | `GET /api/notifications`, `PATCH /api/notifications/:id/read` |
| Profiles / meta | `GET /api/users/:username`, `GET /api/meta/stats` |
| Health | `GET /api/health` |

Successful responses use `{ success: true, data, message? }`. Errors use `{ success: false, message, errors? }`.

## 5. Security and operational notes

- Access JWTs are short-lived; refresh JWTs are rotated and stored as SHA-256 digests in the user record. The refresh cookie is HTTP-only and scoped to `/api/auth`.
- Passwords are hashed with bcryptjs. Password and refresh-token fields are excluded from normal Mongoose queries/JSON output.
- The API uses Helmet, credentialed CORS, JSON body limits, global and auth-specific rate limits, input validation and centralized error handling.
- File uploads are restricted to PDF, DOCX, PPTX, PNG and JPEG, with a 10 MB limit and generated filenames. Files are stored under `backend/uploads/` and static-served at `/uploads/...`.
- Local disk storage is abstracted in `backend/config/storage.js`; replace that module to integrate a cloud provider.
- Local refresh-cookie flow expects the frontend and backend to be accessed through the configured Vite proxy or matching `CLIENT_URL` origin.

## 6. Production build

```bash
npm run build
```

The frontend output is written to `frontend/dist`. The API is started with `npm --prefix backend start` after setting `NODE_ENV=production` and production environment variables. Serve the frontend through a production web server and configure the API's CORS origin and secure cookie settings accordingly.

## 7. Scope notes

This is a functional MVP scaffold with the requested main flows. It does not include a production Cloudinary adapter, email verification/password recovery, automated malware scanning, a formal copyright dispute workflow, or a production deployment configuration. These require provider credentials, policy decisions or deployment-specific infrastructure. The local-storage upload adapter is implemented and can be replaced independently.
