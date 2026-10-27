import { afterEach, describe, expect, it, vi } from 'vitest'
import { changeTaskStatus, createTask, deleteTask, fetchTasks } from './tasksApi'

afterEach(() => {
  vi.unstubAllGlobals()
})

if (false) {
  // @ts-expect-error Status values must match the shared TaskStatus union.
  fetchTasks('started')
  // @ts-expect-error Task identifiers are numbers.
  changeTaskStatus('4', 'pending')
  // @ts-expect-error A task title must be a string.
  createTask({ title: 12 })
  // @ts-expect-error Deletion requires a numeric task identifier.
  deleteTask('4')
}

describe('fetchTasks', () => {
  it('requests all tasks when no status is selected', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '[]',
    })
    vi.stubGlobal('fetch', fetch)

    await expect(fetchTasks()).resolves.toEqual([])
    expect(fetch).toHaveBeenCalledWith('/tasks')
  })

  it('sends the selected status as a query parameter', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '[]',
    })
    vi.stubGlobal('fetch', fetch)

    await fetchTasks('in-progress')

    expect(fetch).toHaveBeenCalledWith('/tasks?status=in-progress')
  })
})

describe('deleteTask', () => {
  it('sends a DELETE request and accepts a no-content response', async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, status: 204 })
    vi.stubGlobal('fetch', fetch)

    await expect(deleteTask(4)).resolves.toBeUndefined()
    expect(fetch).toHaveBeenCalledWith('/tasks/4', { method: 'DELETE' })
  })

  it('reports the API error when deletion fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => JSON.stringify({ message: 'Task not found.' }),
    }))

    await expect(deleteTask(4)).rejects.toThrow('Task not found.')
  })
})
