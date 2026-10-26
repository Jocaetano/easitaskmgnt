async function readResponse(response, fallbackMessage) {
  const responseText = await response.text()
  let data = null

  if (responseText) {
    try {
      data = JSON.parse(responseText)
    } catch {
      throw new Error(`${fallbackMessage} The server returned an invalid response.`)
    }
  }

  if (!response.ok) {
    const apiUnavailable = [502, 503, 504].includes(response.status)
    const message = apiUnavailable
      ? 'The task API is unavailable. Start the backend and try again.'
      : data?.message || `${fallbackMessage} (HTTP ${response.status})`
    throw new Error(message)
  }

  if (data === null) {
    throw new Error(`${fallbackMessage} The server returned an empty response.`)
  }

  return data
}

export async function fetchTasks(status) {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  const response = await fetch(`/tasks${query}`)
  return readResponse(response, 'Unable to load tasks.')
}

export async function createTask(task) {
  const response = await fetch('/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  })
  return readResponse(response, 'Unable to add the task.')
}

export async function changeTaskStatus(taskId, status) {
  const response = await fetch(`/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  return readResponse(response, 'Unable to update the task.')
}

export async function deleteTask(taskId) {
  const response = await fetch(`/tasks/${taskId}`, { method: 'DELETE' })
  if (!response.ok) {
    return readResponse(response, 'Unable to delete the task.')
  }
}
