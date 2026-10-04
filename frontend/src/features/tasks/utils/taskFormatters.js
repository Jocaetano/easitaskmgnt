export function formatDate(value) {
  if (!value) return 'No due date'
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function isOverdue(value) {
  return Boolean(value) && new Date(value).getTime() < Date.now()
}

export function statusLabel(status) {
  return status === 'in-progress' ? 'In progress' : status
}

export function statusClasses(status) {
  if (status === 'completed') return 'bg-emerald-100 text-emerald-700'
  if (status === 'in-progress') return 'bg-blue-100 text-blue-700'
  return 'bg-amber-100 text-amber-700'
}

export function sortTasks(tasks, sortBy) {
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

function dateValue(value) {
  return new Date(value).getTime()
}
