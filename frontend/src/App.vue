<script setup>
import { onMounted, ref } from 'vue'

const tasks = ref([])
const title = ref('')
const description = ref('')
const loading = ref(true)
const submitting = ref(false)
const error = ref('')

async function loadTasks() {
  loading.value = true
  error.value = ''

  try {
    const response = await fetch('/tasks')
    if (!response.ok) throw new Error('Unable to load tasks.')
    tasks.value = await response.json()
  } catch (requestError) {
    error.value = requestError.message
  } finally {
    loading.value = false
  }
}

async function addTask() {
  if (!title.value.trim()) return

  submitting.value = true
  error.value = ''

  try {
    const response = await fetch('/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.value, description: description.value }),
    })
    const data = await response.json()

    if (!response.ok) throw new Error(data.message || 'Unable to add the task.')

    tasks.value.push(data)
    title.value = ''
    description.value = ''
  } catch (requestError) {
    error.value = requestError.message
  } finally {
    submitting.value = false
  }
}

async function markCompleted(task) {
  error.value = ''

  try {
    const response = await fetch(`/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    })
    const data = await response.json()

    if (!response.ok) throw new Error(data.message || 'Unable to update the task.')
    Object.assign(task, data)
  } catch (requestError) {
    error.value = requestError.message
  }
}

onMounted(loadTasks)
</script>

<template>
  <main class="min-h-screen bg-slate-100 px-4 py-10 text-slate-900 sm:px-6">
    <div class="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[22rem_1fr]">
      <section class="h-fit rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p class="text-sm font-semibold uppercase tracking-wider text-indigo-600">Task manager</p>
        <h1 class="mt-2 text-3xl font-bold">Add a task</h1>
        <p class="mt-2 text-sm text-slate-500">Capture what needs to be done and keep moving.</p>

        <form class="mt-6 space-y-4" @submit.prevent="addTask">
          <label class="block">
            <span class="text-sm font-medium">Title</span>
            <input
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

          <button
            type="submit"
            :disabled="submitting || !title.trim()"
            class="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ submitting ? 'Adding...' : 'Add task' }}
          </button>
        </form>
      </section>

      <section>
        <div class="mb-4 flex items-end justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-wider text-indigo-600">Your work</p>
            <h2 class="mt-1 text-2xl font-bold">Tasks</h2>
          </div>
          <span class="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-600 shadow-sm">
            {{ tasks.length }} {{ tasks.length === 1 ? 'task' : 'tasks' }}
          </span>
        </div>

        <p v-if="error" class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
          {{ error }}
        </p>

        <div v-if="loading" class="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">
          Loading tasks...
        </div>

        <div v-else-if="tasks.length === 0" class="rounded-2xl border-2 border-dashed border-slate-300 p-10 text-center">
          <p class="font-semibold text-slate-700">No tasks yet</p>
          <p class="mt-1 text-sm text-slate-500">Add your first task using the form.</p>
        </div>

        <ul v-else class="space-y-3">
          <li
            v-for="task in tasks"
            :key="task.id"
            class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
          >
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="font-semibold" :class="{ 'text-slate-400 line-through': task.status === 'completed' }">
                    {{ task.title }}
                  </h3>
                  <span
                    class="rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
                    :class="task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'"
                  >
                    {{ task.status }}
                  </span>
                </div>
                <p v-if="task.description" class="mt-2 whitespace-pre-wrap text-sm text-slate-500">
                  {{ task.description }}
                </p>
              </div>

              <button
                v-if="task.status !== 'completed'"
                type="button"
                class="shrink-0 rounded-lg border border-emerald-300 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                @click="markCompleted(task)"
              >
                Mark completed
              </button>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </main>
</template>
