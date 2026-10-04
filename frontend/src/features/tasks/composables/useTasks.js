import { onMounted, ref } from 'vue'
import { changeTaskStatus, createTask, fetchTasks } from '../api/tasksApi'

export function useTasks() {
  const tasks = ref([])
  const loading = ref(true)
  const submitting = ref(false)
  const updatingTaskId = ref(null)
  const error = ref('')
  const formError = ref('')
  const dueToasts = ref([])

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

  async function loadTasks() {
    loading.value = true
    error.value = ''
    try {
      tasks.value = await fetchTasks()
      showDueToasts(tasks.value)
    } catch (requestError) {
      error.value = requestError.message
    } finally {
      loading.value = false
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
      tasks.value.push(task)
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
    } catch (requestError) {
      error.value = requestError.message
    } finally {
      updatingTaskId.value = null
    }
  }

  onMounted(loadTasks)

  return {
    tasks, loading, submitting, updatingTaskId, error, formError, dueToasts,
    addTask, updateStatus, dismissToast,
  }
}
