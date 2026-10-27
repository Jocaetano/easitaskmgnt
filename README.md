# Task Manager

A small full-stack Task Manager built with a TypeScript Node.js API, Vue 3, and Tailwind CSS. Shared task contracts keep frontend API calls and backend models aligned, and type-checking catches invalid endpoint arguments at build time.

See [TASK.md](./TASK.md) for the full assignment instructions and acceptance criteria.

## Required features

- Add a task with a title, optional description, and optional due date.
- List all created tasks.
- Display each task's title, description, and status.
- Display when each task was last updated.
- Show startup toast reminders for tasks due within 24 hours or already overdue.
- Sort the task list by update date or due date.
- Support mobile and desktop layouts.
- Start, pause, and complete tasks using a three-status workflow.

## API contract

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/tasks` | Create a task with a generated ID and `pending` status |
| `GET` | `/tasks` | Return all tasks; optionally filter with `?status=pending`, `?status=in-progress`, or `?status=completed` |
| `PATCH` | `/tasks/:id` | Change a task to `pending`, `in-progress`, or `completed` |

The task list has three mutually exclusive status filters. Select one to request only
tasks in that state, or select it again to clear the filter and show every task.

### Task model

```json
{
  "id": 1,
  "title": "Finish the assignment",
  "description": "Complete and submit the Task Manager project",
  "status": "pending",
  "dueDate": "2026-10-05T18:00:00.000Z",
  "updatedAt": "2026-10-04T20:00:00.000Z"
}
```

## Suggested project structure

```text
easitaskmgnt/
├── backend/
│   ├── package.json
│   └── src/
│       └── server.ts
├── frontend/
│   ├── package.json
│   └── src/
│       ├── App.vue
│       └── main.ts
├── shared/
│   └── task.ts
├── README.md
└── TASK.md
```

### Frontend feature boundary

The task UI is organized as a self-contained feature under `frontend/src/features/tasks`:

```text
features/tasks/
├── api/             # HTTP requests and response handling
├── components/      # Focused task UI components
├── composables/     # Task state and business workflows
├── utils/           # Formatting and sorting helpers
├── index.ts         # Public feature entry point
└── TaskWorkspace.vue
```

`App.vue` consumes only the feature's public entry point. This keeps the task feature isolated and suitable for later extraction into a separately deployed micro frontend if needed.

## Setup

### Prerequisites

- Node.js and npm
- Two available local ports: `3000` for the API and `5173` for the frontend

Install all root, backend, and frontend dependencies:

```bash
npm install
npm run install:all
```

Start the backend and frontend together from the root directory:

```bash
npm run dev
```

Open `http://localhost:5173`. The frontend development server proxies task API requests to the Express server at `http://localhost:3000`.

Backend API documentation is available at:

- Swagger UI: `http://localhost:3000/api-docs`
- OpenAPI JSON: `http://localhost:3000/api-docs.json`

Other root commands:

```bash
npm run build      # Type-check and build backend and frontend
npm run typecheck  # Type-check backend, frontend, and tests
npm start          # Start the compiled Express backend (run npm run build first)
npm test           # Run all backend and frontend tests
npm run lint       # Lint backend, frontend, and tests
```

## Time spent

Approximately **2–2.5 hours** were spent implementing and refining the project. This includes the core API and interface, responsive mobile behavior, component refactoring, automated tests, linting, Swagger documentation, and README documentation.

## Design decisions

- **In-memory backend storage:** The assignment does not require a database, so tasks are intentionally reset whenever the backend restarts. The API layer can later be connected to persistent storage without changing the frontend contract.
- **Server-managed fields:** The backend generates task IDs, applies the initial `pending` status, and owns the `updatedAt` timestamp to keep task data consistent.
- **Explicit status workflow:** Tasks move through `pending`, `in-progress`, and `completed`. The interface exposes only valid actions for the current state.
- **ISO due dates:** Due dates are sent and stored as ISO 8601 values. The frontend formats them using the user's locale.
- **Feature-based frontend:** Task API calls, state, utilities, and UI components are isolated under `features/tasks`. `App.vue` only consumes the feature's public entry point, making the feature easier to maintain or extract.
- **Responsive task workspace:** The task list has its own scroll area. Mobile users receive a translucent bottom action bar, while desktop actions remain in the header.
- **API-first documentation:** The OpenAPI schema documents request bodies, responses, validation errors, and task statuses. Swagger UI makes the endpoints directly testable.
- **Automated quality checks:** Backend integration tests, frontend component tests, ESLint, and the production build can all be run from the repository root.

## AI use

An AI coding assistant was used to help scaffold the project, refine the responsive interface, modularize the frontend, generate initial test cases, and prepare the OpenAPI and project documentation. The generated changes were reviewed and verified using ESLint, automated backend and frontend tests, API checks, and production builds.

## Potential improvements

Given more time, the next improvements would be:

- Add persistent storage such as PostgreSQL or SQLite with migrations.
- Add task editing, deletion, search, filtering, and pagination.
- Add authentication and support separate task lists for multiple users.
- Enforce status transitions and due-date rules in a dedicated backend service layer.
- Add end-to-end browser tests for the complete user workflow.
- Improve modal focus trapping and keyboard navigation for accessibility.
- Add configurable reminders, background notifications, and timezone preferences.
- Add containerization, CI checks, deployment configuration, logging, and monitoring.

## Testing

The backend uses Node's test runner with Supertest for API integration tests. The frontend uses Vitest, Vue Test Utils, and jsdom for unit and component tests.
The backend and frontend import task models and allowed statuses from `shared/task.ts`.
The typed frontend API functions accept only valid task statuses, task IDs, and request
payloads; `npm run typecheck` verifies these contracts in the application and tests.

```bash
npm test                 # All tests
npm run test:backend     # API tests only
npm run test:frontend    # Vue tests only
npm run typecheck        # Type-check application code and tests
```

## Linting

ESLint checks the Vue frontend, Express backend, and automated tests from the repository root.

```bash
npm run lint       # Report lint violations
npm run lint:fix   # Automatically fix supported violations
```

## Expected behavior

1. The frontend requests `GET /tasks` when it loads.
2. Submitting the form sends the title and description to `POST /tasks`.
3. The backend validates the title, creates the task, and returns it.
4. The frontend displays the new task without reloading the page.
5. The Play action moves a pending task to `in-progress`.
6. The Pause action moves an in-progress task back to `pending`.
7. The Complete action moves an in-progress task to `completed`.

## Validation checklist

- [x] Tasks can be created through the form.
- [x] Empty titles cannot be submitted.
- [x] A task can include an optional description.
- [x] A task can include an optional due date.
- [x] Creating or updating a task refreshes its `updatedAt` value.
- [x] Created tasks have unique IDs.
- [x] New tasks default to `pending`.
- [x] All tasks are displayed with their title, description, and status.
- [x] Loading and API errors are communicated to the user.
- [x] Pending tasks due within 24 hours or overdue trigger a toast on initial load.
- [x] The layout works on mobile and desktop.
- [x] Play, Pause, and Complete actions correctly update task status.

## Notes

In-memory storage is acceptable for this assignment, so tasks may reset whenever the backend restarts. A database is not required.
