import { describe, expect, it } from 'vitest'
import type { Task } from '../../../../../shared/task'
import { sortTasks, statusClasses, statusLabel } from './taskFormatters'

const tasks: Task[] = [
  {
    id: 1, title: 'First', description: '', status: 'pending',
    dueDate: '2026-10-08T12:00:00.000Z', updatedAt: '2026-10-04T10:00:00.000Z',
  },
  {
    id: 2, title: 'Second', description: '', status: 'in-progress',
    dueDate: '2026-10-06T12:00:00.000Z', updatedAt: '2026-10-04T12:00:00.000Z',
  },
  {
    id: 3, title: 'Third', description: '', status: 'completed',
    dueDate: null, updatedAt: '2026-10-04T14:00:00.000Z',
  },
]

describe('task formatters', () => {
  it('sorts by latest update first', () => {
    expect(sortTasks(tasks, 'updatedAt').map((task) => task.id)).toEqual([3, 2, 1])
  })

  it('sorts by nearest due date and puts missing dates last', () => {
    expect(sortTasks(tasks, 'dueDate').map((task) => task.id)).toEqual([2, 1, 3])
  })

  it('provides labels and styles for task statuses', () => {
    expect(statusLabel('in-progress')).toBe('In progress')
    expect(statusClasses('completed')).toContain('emerald')
    expect(statusClasses('pending')).toContain('amber')
  })
})
