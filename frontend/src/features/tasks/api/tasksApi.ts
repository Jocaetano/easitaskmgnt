import {
  isTaskStatus,
  type ApiError,
  type CreateTaskInput,
  type Task,
  type TaskStatus,
} from '../../../../../shared/task'

async function readResponse(response: Response, fallbackMessage: string): Promise<unknown> {
  const responseText = await response.text()
  let data: unknown = null

  if (responseText) {
    try {
      data = JSON.parse(responseText)
    } catch {
      throw new Error(`${fallbackMessage} The server returned an invalid response.`)
    }
  }

  if (!response.ok) {
    const apiUnavailable = [502, 503, 504].includes(response.status)
    const apiError = isApiError(data) ? data.message : null
    const message = apiUnavailable
      ? 'The task API is unavailable. Start the backend and try again.'
      : apiError || `${fallbackMessage} (HTTP ${response.status})`
    throw new Error(message)
  }

  if (data === null) {
    throw new Error(`${fallbackMessage} The server returned an empty response.`)
  }

  return data
}

function isApiError(value: unknown): value is ApiError {
  return typeof value === 'object' && value !== null
    && 'message' in value && typeof value.message === 'string'
}

function isTask(value: unknown): value is Task {
  return typeof value === 'object' && value !== null
    && 'id' in value && typeof value.id === 'number'
    && 'title' in value && typeof value.title === 'string'
    && 'description' in value && typeof value.description === 'string'
    && 'status' in value && isTaskStatus(value.status)
    && 'dueDate' in value && (typeof value.dueDate === 'string' || value.dueDate === null)
    && 'updatedAt' in value && typeof value.updatedAt === 'string'
}

function parseTask(value: unknown, fallbackMessage: string): Task {
  if (!isTask(value)) throw new Error(`${fallbackMessage} The server returned an invalid response.`)
  return value
}

function parseTaskList(value: unknown): Task[] {
  if (!Array.isArray(value) || !value.every(isTask)) {
    throw new Error('Unable to load tasks. The server returned an invalid response.')
  }
  return value
}

export async function fetchTasks(status?: TaskStatus): Promise<Task[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  const response = await fetch(`/tasks${query}`)
  return parseTaskList(await readResponse(response, 'Unable to load tasks.'))
}

export async function createTask(task: CreateTaskInput): Promise<Task> {
  const response = await fetch('/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  })
  return parseTask(await readResponse(response, 'Unable to add the task.'), 'Unable to add the task.')
}

export async function changeTaskStatus(taskId: number, status: TaskStatus): Promise<Task> {
  const response = await fetch(`/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  return parseTask(await readResponse(response, 'Unable to update the task.'), 'Unable to update the task.')
}

export async function deleteTask(taskId: number): Promise<void> {
  const response = await fetch(`/tasks/${taskId}`, { method: 'DELETE' })
  if (!response.ok) {
    await readResponse(response, 'Unable to delete the task.')
  }
}
