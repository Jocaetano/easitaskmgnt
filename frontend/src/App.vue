<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'

const tasks = ref([])
const title = ref('')
const description = ref('')
const dueDate = ref('')
const loading = ref(true)
const submitting = ref(false)
const error = ref('')
const formError = ref('')
const isAddModalOpen = ref(false)
const titleInput = ref(null)
const dueToasts = ref([])
const updatingTaskId = ref(null)
const sortBy = ref('updatedAt')
const sortMenuOpen = ref(false)

const sortedTasks = computed(() => {
  return [...tasks.value].sort((firstTask, secondTask) => {
    if (sortBy.value === 'dueDate') {
      if (!firstTask.dueDate && !secondTask.dueDate) {
        return new Date(secondTask.updatedAt).getTime() - new Date(firstTask.updatedAt).getTime()
      }
      if (!firstTask.dueDate) return 1
      if (!secondTask.dueDate) return -1
      return new Date(firstTask.dueDate).getTime() - new Date(secondTask.dueDate).getTime()
    }

    return new Date(secondTask.updatedAt).getTime() - new Date(firstTask.updatedAt).getTime()
  })
})

function selectSort(value) {
  sortBy.value = value
  sortMenuOpen.value = false
}

async function readApiResponse(response, fallbackMessage) {
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
    const apiUnavailable = response.status === 502 || response.status === 503 || response.status === 504
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

function formatDate(value) {
  if (!value) return 'No due date'
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function isOverdue(value) {
  return value && new Date(value).getTime() < Date.now()
}

function statusLabel(status) {
  return status === 'in-progress' ? 'In progress' : status
}

function statusClasses(status) {
  if (status === 'completed') return 'bg-emerald-100 text-emerald-700'
  if (status === 'in-progress') return 'bg-blue-100 text-blue-700'
  return 'bg-amber-100 text-amber-700'
}

function showDueToasts(items) {
  const now = Date.now()
  const oneDayFromNow = now + 24 * 60 * 60 * 1000

  dueToasts.value = items
    .filter((task) => {
      const dueTime = new Date(task.dueDate).getTime()
      return task.status !== 'completed' && task.dueDate && dueTime <= oneDayFromNow
    })
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

async function openAddModal() {
  formError.value = ''
  isAddModalOpen.value = true
  await nextTick()
  titleInput.value?.focus()
}

function closeAddModal() {
  if (submitting.value) return
  isAddModalOpen.value = false
  title.value = ''
  description.value = ''
  dueDate.value = ''
  formError.value = ''
}

async function loadTasks() {
  loading.value = true
  error.value = ''

  try {
    const response = await fetch('/tasks')
    tasks.value = await readApiResponse(response, 'Unable to load tasks.')
    showDueToasts(tasks.value)
  } catch (requestError) {
    error.value = requestError.message
  } finally {
    loading.value = false
  }
}

async function addTask() {
  if (!title.value.trim()) return

  submitting.value = true
  formError.value = ''

  try {
    const response = await fetch('/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.value,
        description: description.value,
        dueDate: dueDate.value ? new Date(dueDate.value).toISOString() : null,
      }),
    })
    const data = await readApiResponse(response, 'Unable to add the task.')

    tasks.value.push(data)
    submitting.value = false
    closeAddModal()
  } catch (requestError) {
    formError.value = requestError.message
  } finally {
    submitting.value = false
  }
}

async function updateTaskStatus(task, status) {
  error.value = ''
  updatingTaskId.value = task.id

  try {
    const response = await fetch(`/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const data = await readApiResponse(response, 'Unable to update the task.')
    Object.assign(task, data)
  } catch (requestError) {
    error.value = requestError.message
  } finally {
    updatingTaskId.value = null
  }
}

onMounted(loadTasks)
</script>

<template>
  <main class="h-dvh overflow-hidden bg-slate-100 px-4 py-4 text-slate-900 sm:px-6 sm:py-6">
    <div class="fixed right-4 top-4 z-40 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3" aria-live="polite">
      <div
        v-for="toast in dueToasts"
        :key="toast.id"
        class="rounded-xl border-l-4 bg-white p-4 shadow-xl ring-1 ring-slate-200"
        :class="toast.isOverdue ? 'border-red-500' : 'border-amber-500'"
        role="status"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="font-semibold" :class="toast.isOverdue ? 'text-red-700' : 'text-amber-700'">
              {{ toast.isOverdue ? 'Task overdue' : 'Task due within 24 hours' }}
            </p>
            <p class="mt-1 font-medium text-slate-900">{{ toast.title }}</p>
            <p class="mt-1 text-sm text-slate-500">Due {{ formatDate(toast.dueDate) }}</p>
          </div>
          <button
            type="button"
            class="rounded p-1 text-xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            :aria-label="`Dismiss reminder for ${toast.title}`"
            @click="dismissToast(toast.id)"
          >
            &times;
          </button>
        </div>
      </div>
    </div>

    <section class="mx-auto flex h-full max-w-4xl flex-col">
      <div class="mb-5 flex shrink-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wider text-indigo-600">Task manager</p>
          <h1 class="mt-1 text-3xl font-bold">Your tasks</h1>
          <p class="mt-2 text-sm text-slate-500">Capture what needs to be done and keep moving.</p>
        </div>
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          @click="openAddModal"
        >
          <span aria-hidden="true" class="text-xl leading-none">+</span>
          Add task
        </button>
      </div>

      <div class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div class="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <h2 class="text-lg font-semibold text-slate-700">Task list</h2>
          <div class="flex items-center gap-2">
            <span class="hidden rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600 sm:inline-flex">
              {{ tasks.length }} {{ tasks.length === 1 ? 'task' : 'tasks' }}
            </span>

            <div class="relative" @keydown.esc="sortMenuOpen = false">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                :aria-expanded="sortMenuOpen"
                aria-haspopup="menu"
                @click="sortMenuOpen = !sortMenuOpen"
              >
                <svg aria-hidden="true" viewBox="0 0 20 20" class="h-4 w-4 fill-current">
                  <path d="M6 3a1 1 0 0 1 1 1v9.6l1.3-1.3a1 1 0 1 1 1.4 1.4l-3 3a1 1 0 0 1-1.4 0l-3-3a1 1 0 0 1 1.4-1.4L5 13.6V4a1 1 0 0 1 1-1Zm7-1a1 1 0 0 1 .7.3l3 3a1 1 0 0 1-1.4 1.4L14 5.4V15a1 1 0 1 1-2 0V5.4l-1.3 1.3a1 1 0 1 1-1.4-1.4l3-3A1 1 0 0 1 13 2Z" />
                </svg>
                Sort
              </button>

              <div
                v-if="sortMenuOpen"
                class="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl bg-white p-1.5 shadow-xl ring-1 ring-slate-200"
                role="menu"
              >
                <button
                  type="button"
                  role="menuitemradio"
                  :aria-checked="sortBy === 'updatedAt'"
                  class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-slate-100"
                  :class="sortBy === 'updatedAt' ? 'font-semibold text-indigo-700' : 'text-slate-700'"
                  @click="selectSort('updatedAt')"
                >
                  Update date
                  <span v-if="sortBy === 'updatedAt'" aria-hidden="true">✓</span>
                </button>
                <button
                  type="button"
                  role="menuitemradio"
                  :aria-checked="sortBy === 'dueDate'"
                  class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-slate-100"
                  :class="sortBy === 'dueDate' ? 'font-semibold text-indigo-700' : 'text-slate-700'"
                  @click="selectSort('dueDate')"
                >
                  Due date
                  <span v-if="sortBy === 'dueDate'" aria-hidden="true">✓</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <p v-if="error" class="mx-4 mt-4 shrink-0 rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
          {{ error }}
        </p>

        <div class="task-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
          <div v-if="loading" class="flex h-full min-h-40 items-center justify-center text-slate-500">
            Loading tasks...
          </div>

          <div v-else-if="tasks.length === 0" class="flex h-full min-h-52 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-10 text-center">
            <p class="font-semibold text-slate-700">No tasks yet</p>
            <p class="mt-1 text-sm text-slate-500">Create your first task to get started.</p>
            <button type="button" class="mt-4 font-semibold text-indigo-600 hover:text-indigo-700" @click="openAddModal">
              Add your first task
            </button>
          </div>

          <ul v-else class="space-y-3">
        <li
          v-for="task in sortedTasks"
          :key="task.id"
          class="rounded-xl bg-slate-50 p-5 ring-1 ring-slate-200 transition hover:bg-white hover:shadow-sm"
        >
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="font-semibold" :class="{ 'text-slate-400 line-through': task.status === 'completed' }">
                  {{ task.title }}
                </h3>
                <span
                  class="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  :class="statusClasses(task.status)"
                >
                  {{ statusLabel(task.status) }}
                </span>
              </div>
              <p v-if="task.description" class="mt-2 whitespace-pre-wrap text-sm text-slate-500">
                {{ task.description }}
              </p>
              <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                <span v-if="task.dueDate" :class="{ 'font-semibold text-red-600': isOverdue(task.dueDate) && task.status !== 'completed' }">
                  Due {{ formatDate(task.dueDate) }}
                </span>
                <span>Updated {{ formatDate(task.updatedAt) }}</span>
              </div>
            </div>

            <div v-if="task.status !== 'completed'" class="flex shrink-0 flex-wrap gap-2">
              <button
                v-if="task.status === 'pending'"
                type="button"
                :disabled="updatingTaskId === task.id"
                class="inline-flex items-center gap-2 rounded-lg border border-blue-300 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-wait disabled:opacity-50"
                aria-label="Start task"
                title="Start task"
                @click="updateTaskStatus(task, 'in-progress')"
              >
                <svg aria-hidden="true" viewBox="0 0 20 20" class="h-4 w-4 fill-current">
                  <path d="M5.5 3.8a1 1 0 0 1 1.5-.86l10 6.2a1 1 0 0 1 0 1.72l-10 6.2a1 1 0 0 1-1.5-.86V3.8Z" />
                </svg>
                Start
              </button>

              <button
                v-if="task.status === 'in-progress'"
                type="button"
                :disabled="updatingTaskId === task.id"
                class="inline-flex items-center gap-2 rounded-lg border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 disabled:cursor-wait disabled:opacity-50"
                aria-label="Pause task"
                title="Pause task"
                @click="updateTaskStatus(task, 'pending')"
              >
                <svg aria-hidden="true" viewBox="0 0 20 20" class="h-4 w-4 fill-current">
                  <rect x="4" y="3" width="4" height="14" rx="1" />
                  <rect x="12" y="3" width="4" height="14" rx="1" />
                </svg>
                Pause
              </button>

              <button
                v-if="task.status === 'in-progress'"
                type="button"
                :disabled="updatingTaskId === task.id"
                class="inline-flex items-center gap-2 rounded-lg border border-emerald-300 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-wait disabled:opacity-50"
                @click="updateTaskStatus(task, 'completed')"
              >
                <svg aria-hidden="true" viewBox="0 0 20 20" class="h-4 w-4 fill-current">
                  <path fill-rule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z" clip-rule="evenodd" />
                </svg>
                Complete
              </button>
            </div>
          </div>
        </li>
          </ul>
        </div>
      </div>
    </section>

    <div
      v-if="isAddModalOpen"
      class="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="presentation"
      @click.self="closeAddModal"
      @keydown.esc="closeAddModal"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-task-title"
        class="max-h-dvh w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:max-w-lg sm:rounded-2xl"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-semibold uppercase tracking-wider text-indigo-600">New task</p>
            <h2 id="add-task-title" class="mt-1 text-2xl font-bold">Add a task</h2>
          </div>
          <button
            type="button"
            aria-label="Close add task dialog"
            class="rounded-lg p-2 text-2xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            @click="closeAddModal"
          >
            &times;
          </button>
        </div>

        <form class="mt-6 space-y-4" @submit.prevent="addTask">
          <p v-if="formError" class="rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
            {{ formError }}
          </p>

          <label class="block">
            <span class="text-sm font-medium">Title</span>
            <input
              ref="titleInput"
              v-model="title"
              required
              type="text"
              placeholder="What needs to be done?"
              class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </label>

          <label class="block">
            <span class="text-sm font-medium">Description <span class="text-slate-400">(optional)</span></span>
            <textarea
              v-model="description"
              rows="4"
              placeholder="Add more details..."
              class="mt-1 w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </label>

          <label class="block">
            <span class="text-sm font-medium">Due date <span class="text-slate-400">(optional)</span></span>
            <input
              v-model="dueDate"
              type="datetime-local"
              class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </label>

          <div class="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              :disabled="submitting"
              class="rounded-lg border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              @click="closeAddModal"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="submitting || !title.trim()"
              class="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ submitting ? 'Adding...' : 'Add task' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </main>
</template>
