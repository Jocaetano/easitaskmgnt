import { onMounted, ref, watch } from 'vue'
import type { CreateTaskInput, Task, TaskStatus } from '../../../../../shared/task'
import { changeTaskStatus, createTask, deleteTask as requestDeleteTask, fetchTasks } from '../api/tasksApi'

export interface TaskForm {
  title: string
  description: string
  dueDate: string
}

export type DueToast = Task & { isOverdue: boolean }

export function useTasks() {
  const tasks = ref<Task[]>([])
  const statusFilter = ref<TaskStatus | ''>('')
  const loading = ref(true)
  const submitting = ref(false)
  const updatingTaskId = ref<number | null>(null)
  const error = ref('')
  const formError = ref('')
  const dueToasts = ref<DueToast[]>([])
  let latestLoadId = 0

  function showDueToasts(items: Task[]): void {
    const now = Date.now()
    const oneDayFromNow = now + 24 * 60 * 60 * 1000

    dueToasts.value = items
      .filter((task): task is Task & { dueDate: string } => task.status !== 'completed'
        && task.dueDate !== null && new Date(task.dueDate).getTime() <= oneDayFromNow)
      .map((task) => ({
        ...task,
        isOverdue: new Date(task.dueDate).getTime() < now,
      }))

    dueToasts.value.forEach((task) => {
      window.setTimeout(() => dismissToast(task.id), 8000)
    })
  }

  function dismissToast(taskId: number): void {
    dueToasts.value = dueToasts.value.filter((task) => task.id !== taskId)
  }

  async function loadTasks(showReminders = false): Promise<void> {
    const loadId = ++latestLoadId
    loading.value = true
    error.value = ''
    try {
      const loadedTasks = await fetchTasks(statusFilter.value || undefined)
      if (loadId !== latestLoadId) return
      tasks.value = loadedTasks
      if (showReminders) showDueToasts(loadedTasks)
    } catch (requestError) {
      if (loadId !== latestLoadId) return
      error.value = requestError instanceof Error ? requestError.message : 'Unable to load tasks.'
    } finally {
      if (loadId === latestLoadId) loading.value = false
    }
  }

  async function addTask(form: TaskForm): Promise<boolean> {
    submitting.value = true
    formError.value = ''
    try {
      const input: CreateTaskInput = {
        title: form.title,
        description: form.description,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      }
      const task = await createTask(input)
      if (!statusFilter.value || statusFilter.value === task.status) tasks.value.push(task)
      return true
    } catch (requestError) {
      formError.value = requestError instanceof Error ? requestError.message : 'Unable to add the task.'
      return false
    } finally {
      submitting.value = false
    }
  }

  async function updateStatus(task: Task, status: TaskStatus): Promise<void> {
    error.value = ''
    updatingTaskId.value = task.id
    try {
      const updatedTask = await changeTaskStatus(task.id, status)
      Object.assign(task, updatedTask)
      if (statusFilter.value && statusFilter.value !== updatedTask.status) {
        tasks.value = tasks.value.filter((item) => item.id !== task.id)
      }
    } catch (requestError) {
      error.value = requestError instanceof Error ? requestError.message : 'Unable to update the task.'
    } finally {
      updatingTaskId.value = null
    }
  }

  async function deleteTask(task: Task): Promise<void> {
    error.value = ''
    try {
      await requestDeleteTask(task.id)
      tasks.value = tasks.value.filter((item) => item.id !== task.id)
      dismissToast(task.id)
    } catch (requestError) {
      error.value = requestError instanceof Error ? requestError.message : 'Unable to delete the task.'
    }
  }

  onMounted(() => loadTasks(true))
  watch(statusFilter, () => loadTasks())

  return {
    tasks, statusFilter, loading, submitting, updatingTaskId, error, formError, dueToasts,
    addTask, updateStatus, deleteTask, dismissToast,
  }
}
