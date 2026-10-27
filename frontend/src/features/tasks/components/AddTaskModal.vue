<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import type { TaskForm } from '../composables/useTasks'

withDefaults(defineProps<{
  submitting?: boolean
  error?: string
}>(), {
  submitting: false,
  error: '',
})
const emit = defineEmits<{
  close: []
  submit: [form: TaskForm]
}>()

const titleInput = ref<HTMLInputElement | null>(null)
const form = reactive<TaskForm>({ title: '', description: '', dueDate: '' })

function submit(): void {
  if (!form.title.trim()) return
  emit('submit', { ...form })
}

onMounted(() => titleInput.value?.focus())
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
    role="presentation"
    @click.self="!submitting && $emit('close')"
    @keydown.esc="!submitting && $emit('close')"
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
          :disabled="submitting"
          class="rounded-lg p-2 text-2xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          @click="$emit('close')"
        >
          &times;
        </button>
      </div>

      <form class="mt-6 space-y-4" @submit.prevent="submit">
        <p v-if="error" class="rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
          {{ error }}
        </p>

        <label class="block">
          <span class="text-sm font-medium">Title</span>
          <input
            ref="titleInput"
            v-model="form.title"
            required
            type="text"
            placeholder="What needs to be done?"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        <label class="block">
          <span class="text-sm font-medium">Description <span class="text-slate-400">(optional)</span></span>
          <textarea
            v-model="form.description"
            rows="4"
            placeholder="Add more details..."
            class="mt-1 w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        <label class="block">
          <span class="text-sm font-medium">Due date <span class="text-slate-400">(optional)</span></span>
          <input
            v-model="form.dueDate"
            type="datetime-local"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        <div class="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            :disabled="submitting"
            class="rounded-lg border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="submitting || !form.title.trim()"
            class="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ submitting ? 'Adding...' : 'Add task' }}
          </button>
        </div>
      </form>
    </section>
  </div>
</template>
