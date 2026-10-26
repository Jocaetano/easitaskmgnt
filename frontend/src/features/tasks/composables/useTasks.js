import { onMounted, ref, watch } from 'vue'
import { changeTaskStatus, createTask, deleteTask as requestDeleteTask, fetchTasks } from '../api/tasksApi'

export function useTasks() {
  const tasks = ref([])
  const statusFilter = ref('')
  const loading = ref(true)
  const submitting = ref(false)
  const updatingTaskId = ref(null)
  const error = ref('')
  const formError = ref('')
  const dueToasts = ref([])
  let latestLoadId = 0

  function showDueToasts(items) {
    const now = Date.now()
    const oneDayFromNow = now + 24 * 60 * 60 * 1000

    dueToasts.value = items
      .filter((task) => task.status !== 'completed' && task.dueDate
        && new Date(task.dueDate).getTime() <= oneDayFromNow)
      .map((task) => ({
        ...task,
        isOverdue: new Date(task.dueDate).getTime() < now,
      }))

    dueToasts.value.forEach((task) => {
      window.setTimeout(() => dismissToast(task.id), 8000)
    })
  }

  function dismissToast(taskId) {
    dueToasts.value = dueToasts.value.filter((task) => task.id !== taskId)
  }

  async function loadTasks(showReminders = false) {
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
      error.value = requestError.message
    } finally {
      if (loadId === latestLoadId) loading.value = false
    }
  }

  async function addTask(form) {
    submitting.value = true
    formError.value = ''
    try {
      const task = await createTask({
        title: form.title,
        description: form.description,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      })
      if (!statusFilter.value || statusFilter.value === task.status) tasks.value.push(task)
      return true
    } catch (requestError) {
      formError.value = requestError.message
      return false
    } finally {
      submitting.value = false
    }
  }

  async function updateStatus(task, status) {
    error.value = ''
    updatingTaskId.value = task.id
    try {
      const updatedTask = await changeTaskStatus(task.id, status)
      Object.assign(task, updatedTask)
      if (statusFilter.value && statusFilter.value !== updatedTask.status) {
        tasks.value = tasks.value.filter((item) => item.id !== task.id)
      }
    } catch (requestError) {
      error.value = requestError.message
    } finally {
      updatingTaskId.value = null
    }
  }

  async function deleteTask(task) {
    error.value = ''
    try {
      await requestDeleteTask(task.id)
      tasks.value = tasks.value.filter((item) => item.id !== task.id)
      dismissToast(task.id)
    } catch (requestError) {
      error.value = requestError.message
    }
  }

  onMounted(() => loadTasks(true))
  watch(statusFilter, () => loadTasks())

  return {
    tasks, statusFilter, loading, submitting, updatingTaskId, error, formError, dueToasts,
    addTask, updateStatus, deleteTask, dismissToast,
  }
}
