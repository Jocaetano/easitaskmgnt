export const taskStatuses = ['pending', 'in-progress', 'completed'] as const

export type TaskStatus = (typeof taskStatuses)[number]

export interface Task {
  id: number
  title: string
  description: string
  status: TaskStatus
  dueDate: string | null
  updatedAt: string
}

export interface CreateTaskInput {
  title: string
  description?: string
  dueDate?: string | null
}

export interface UpdateTaskStatusInput {
  status: TaskStatus
}

export interface ApiError {
  message: string
}

export function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === 'string' && taskStatuses.some((status) => status === value)
}
