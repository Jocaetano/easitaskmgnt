import type { Task, TaskStatus } from '../../../../../shared/task'

export function formatDate(value: string | null): string {
  if (!value) return 'No due date'
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function isOverdue(value: string | null): boolean {
  return value !== null && new Date(value).getTime() < Date.now()
}

export function statusLabel(status: TaskStatus): string {
  return status === 'in-progress' ? 'In progress' : status
}

export function statusClasses(status: TaskStatus): string {
  if (status === 'completed') return 'bg-emerald-100 text-emerald-700'
  if (status === 'in-progress') return 'bg-blue-100 text-blue-700'
  return 'bg-amber-100 text-amber-700'
}

export type TaskSortKey = 'updatedAt' | 'dueDate'

export function sortTasks(tasks: Task[], sortBy: TaskSortKey): Task[] {
  return [...tasks].sort((firstTask, secondTask) => {
    if (sortBy === 'dueDate') {
      if (!firstTask.dueDate && !secondTask.dueDate) {
        return dateValue(secondTask.updatedAt) - dateValue(firstTask.updatedAt)
      }
      if (!firstTask.dueDate) return 1
      if (!secondTask.dueDate) return -1
      return dateValue(firstTask.dueDate) - dateValue(secondTask.dueDate)
    }
    return dateValue(secondTask.updatedAt) - dateValue(firstTask.updatedAt)
  })
}

function dateValue(value: string): number {
  return new Date(value).getTime()
}
