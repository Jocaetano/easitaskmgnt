# Task Manager Web App — Assignment Instructions

## Objective

Build a simple, responsive Task Manager web application with a Node.js backend and a Vue frontend styled with Tailwind CSS.

## Functional requirements

### Backend (Node.js)

Create an HTTP API with these endpoints:

#### `POST /tasks`

Adds a new task.

Request body:

```json
{
  "title": "Finish the assignment",
  "description": "Complete and submit the Task Manager project"
}
```

The server must create and return a task with the following shape:

```json
{
  "id": 1,
  "title": "Finish the assignment",
  "description": "Complete and submit the Task Manager project",
  "status": "pending"
}
```

Requirements:

- Generate a unique `id` for each task.
- Require a non-empty `title`.
- Accept an optional `description` string.
- Set the initial `status` to `pending`.
- Return an appropriate validation error when the title is missing or invalid.

#### `GET /tasks`

Returns all tasks as a JSON array.

Example response:

```json
[
  {
    "id": 1,
    "title": "Finish the assignment",
    "description": "Complete and submit the Task Manager project",
    "status": "pending"
  }
]
```

Task data may be stored in memory; a database is not required.

### Frontend (Vue + Tailwind CSS)

Build a user interface that includes:

- A form with a task-title input, description field, and submit button.
- A list of all tasks returned by the backend.
- The title, description, and current status of each task.
- A clear empty state when no tasks exist.
- Basic loading and error feedback.
- A responsive layout that works on mobile and desktop screens.

After a task is added, update the displayed list without requiring a page refresh.

## Optional bonus

Add a **Mark as Completed** feature.

Suggested API endpoint:

```text
PATCH /tasks/:id
```

Suggested request body:

```json
{
  "status": "completed"
}
```

The frontend should provide a button that marks a pending task as completed and immediately reflects the updated status.

## Technical expectations

- Use Node.js for the backend. Express is recommended but not required.
- Use Vue 3 for the frontend.
- Use Tailwind CSS for styling.
- Enable CORS if the frontend and backend run on different ports.
- Keep the code readable and organize the frontend and backend into separate directories.
- Do not commit generated dependency directories such as `node_modules`.

## Acceptance criteria

The assignment is complete when:

1. A user can enter a task title, add an optional description, and submit it.
2. The backend creates the task with an ID, title, description, and pending status.
3. The page lists every created task with its title, description, and status.
4. Invalid empty task titles are rejected or prevented.
5. The interface remains usable on mobile and desktop screen sizes.
6. The README contains working setup and run instructions for the completed implementation.

## Submission

Submit the source code and include a completed `README.md`. The README should document any decisions, assumptions, and optional features implemented.
