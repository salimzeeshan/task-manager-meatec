# Task Manager - MEATEC

A Vite + React task manager with mocked authentication and task APIs. The app includes a protected dashboard, task CRUD flows, status filtering, form validation, local auth persistence, and a full Vitest test setup.

## Running Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will print the local URL, usually `http://localhost:5173`.

Use the seeded mock account to sign in:

```text
Username: test
Password: test123
```

Useful scripts:

```bash
npm run build
npm run lint
npm run lint:fix
npm run test
npm run test:coverage
npm run test:ui
```

## Mocking

The project uses MSW to mock backend APIs.

In development, `src/main.tsx` enables the browser worker only when `import.meta.env.DEV` is true. The worker is created in `src/mocks/browser.ts` and uses the handlers exported from `src/mocks/handlers`.

In tests, `vitest.setup.ts` starts the Node MSW server from `src/mocks/server.ts`, resets handlers after each test, and closes the server after the test run.

The generated MSW worker file lives at `public/mockServiceWorker.js`. It is generated tooling output and is ignored by ESLint.

Mocked endpoints:

- `POST /api/login`
- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

Mock data lives in `src/mocks/data`. The seeded user and tasks are stored in memory, and `src/mocks/data/jwt.ts` creates fake JWTs for auth-protected task requests.

### Mock API

The frontend always calls API paths through Axios using the `/api` base URL. During local development and tests, MSW intercepts those requests before they leave the app and returns mocked JSON responses.

`POST /api/login` accepts:

```json
{
  "username": "test",
  "password": "test123"
}
```

On success, it returns a fake JWT and the public user object:

```json
{
  "token": "...",
  "user": {
    "id": "1",
    "username": "test",
    "email": "test@example.com"
  }
}
```

The auth store saves the token in `localStorage` as `auth_token`. The Axios request interceptor then sends it on task requests as an `Authorization: Bearer <token>` header.

Task endpoints require that bearer token. The task handlers decode the fake JWT, read the user id from the token payload, and only return tasks for that user.

Task endpoint behavior:

- `GET /api/tasks` returns `{ "tasks": [...] }`.
- `GET /api/tasks?status=todo` filters tasks by status.
- `POST /api/tasks` validates the payload and returns `{ "task": ... }`.
- `PUT /api/tasks/:id` updates an existing task owned by the current user.
- `DELETE /api/tasks/:id` removes an existing task owned by the current user.

The mock database is in memory, so changes last only for the current browser session or test process. Refreshing the dev server or restarting tests resets the seeded data.

## Project Structure

```text
src/
  features/
    auth/
      components/     Login, route guards, auth UI
      hooks/          Auth-related hooks
      store/          Zustand auth state
      validation/     Yup login validation
    tasks/
      api/            Task API wrappers
      components/     Dashboard, task cards, modals, filters
      hooks/          Task form logic
      store/          Zustand task state
      validation/     Yup task validation
  lib/                Shared library setup, including Axios
  mocks/
    data/             In-memory users, tasks, fake JWT helpers
    handlers/         MSW route handlers
    browser.ts        Browser worker setup
    server.ts         Test server setup
  shared/
    components/       Shared app and UI components
    hooks/            Shared hooks
    utils/            Shared utilities
  types/              Shared TypeScript types
```

## Libraries Used

- React 18 and React DOM
- Vite for local development and production builds
- TypeScript
- React Router for routing and protected routes
- Zustand for auth and task state
- Axios for API requests
- MSW for mocked browser and test APIs
- Formik and Yup for forms and validation
- Tailwind CSS, Radix UI primitives, and lucide-react for UI
- Sonner for toast notifications
- Vitest, Testing Library, and jsdom for tests
- ESLint and Prettier for code quality and formatting
