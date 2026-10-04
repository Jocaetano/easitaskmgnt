# Task Manager

A small full-stack Task Manager assignment built with a Node.js API, Vue 3, and Tailwind CSS. Users can add tasks and view each task's current status in a responsive interface.

See [TASK.md](./TASK.md) for the full assignment instructions and acceptance criteria.

## Required features

- Add a task with a title and optional description.
- List all created tasks.
- Display each task's title, description, and status.
- Support mobile and desktop layouts.
- Optionally mark tasks as completed.

## API contract

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/tasks` | Create a task with a generated ID and `pending` status |
| `GET` | `/tasks` | Return all tasks |
| `PATCH` | `/tasks/:id` | Mark or update a task (optional bonus) |

### Task model

```json
{
  "id": 1,
  "title": "Finish the assignment",
  "description": "Complete and submit the Task Manager project",
  "status": "pending"
}
```

## Suggested project structure

```text
easitaskmgnt/
├── backend/
│   ├── package.json
│   └── src/
│       └── server.js
├── frontend/
│   ├── package.json
│   └── src/
│       ├── App.vue
│       └── main.js
├── README.md
└── TASK.md
```

## Getting started

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

Other root commands:

```bash
npm run build   # Build the Vue frontend
npm start       # Start only the Express backend
```

## Expected behavior

1. The frontend requests `GET /tasks` when it loads.
2. Submitting the form sends the title and description to `POST /tasks`.
3. The backend validates the title, creates the task, and returns it.
4. The frontend displays the new task without reloading the page.
5. If the optional bonus is implemented, the user can change a task's status to `completed`.

## Validation checklist

- [ ] Tasks can be created through the form.
- [ ] Empty titles cannot be submitted.
- [ ] A task can include an optional description.
- [ ] Created tasks have unique IDs.
- [ ] New tasks default to `pending`.
- [ ] All tasks are displayed with their title, description, and status.
- [ ] Loading and API errors are communicated to the user.
- [ ] The layout works on mobile and desktop.
- [ ] The optional completion feature works, if included.

## Notes

In-memory storage is acceptable for this assignment, so tasks may reset whenever the backend restarts. A database is not required.
