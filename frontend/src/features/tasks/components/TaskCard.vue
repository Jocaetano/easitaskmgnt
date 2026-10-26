<script setup>
import { ref } from 'vue'
import { formatDate, isOverdue, statusClasses, statusLabel } from '../utils/taskFormatters'
import DeleteTaskButton from './DeleteTaskButton.vue'

const props = defineProps({
  task: { type: Object, required: true },
  updating: { type: Boolean, default: false },
  onDelete: { type: Function, required: true },
})
defineEmits(['status-change'])

const expanded = ref(false)
const previewLength = 160

function isLong(description) {
  return description.length > previewLength
}

function shortDescription(description) {
  const preview = description.slice(0, previewLength)
  const lastSpace = preview.lastIndexOf(' ')
  return lastSpace > previewLength * 0.7 ? preview.slice(0, lastSpace) : preview
}
</script>

<template>
  <article class="rounded-xl bg-slate-50 p-5 ring-1 ring-slate-200 transition hover:bg-white hover:shadow-sm">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="font-semibold" :class="{ 'text-slate-400 line-through': task.status === 'completed' }">
            {{ task.title }}
          </h3>
          <span class="rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="statusClasses(task.status)">
            {{ statusLabel(task.status) }}
          </span>
        </div>

        <div v-if="task.description" class="mt-2 text-sm text-slate-500">
          <span class="whitespace-pre-wrap">{{
            isLong(task.description) && !expanded ? shortDescription(task.description) : task.description
          }}</span>
          <button
            v-if="isLong(task.description)"
            type="button"
            class="ml-1 inline font-semibold text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
            :aria-label="expanded ? `Shorten description for ${task.title}` : `Expand description for ${task.title}`"
            @click="expanded = !expanded"
          >
            {{ expanded ? 'Short' : '...' }}
          </button>
        </div>

        <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <span
            v-if="task.dueDate"
            :class="{ 'font-semibold text-red-600': isOverdue(task.dueDate) && task.status !== 'completed' }"
          >
            Due {{ formatDate(task.dueDate) }}
          </span>
          <span>Updated {{ formatDate(task.updatedAt) }}</span>
        </div>
      </div>

      <div class="flex shrink-0 flex-wrap gap-2">
        <button
          v-if="task.status === 'pending'"
          type="button"
          :disabled="updating"
          class="inline-flex items-center gap-2 rounded-lg border border-blue-300 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-wait disabled:opacity-50"
          aria-label="Start task"
          title="Start task"
          @click="$emit('status-change', task, 'in-progress')"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" class="h-4 w-4 fill-current">
            <path d="M5.5 3.8a1 1 0 0 1 1.5-.86l10 6.2a1 1 0 0 1 0 1.72l-10 6.2a1 1 0 0 1-1.5-.86V3.8Z" />
          </svg>
          Start
        </button>

        <button
          v-if="task.status === 'in-progress'"
          type="button"
          :disabled="updating"
          class="inline-flex items-center gap-2 rounded-lg border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 disabled:cursor-wait disabled:opacity-50"
          aria-label="Pause task"
          title="Pause task"
          @click="$emit('status-change', task, 'pending')"
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
          :disabled="updating"
          class="inline-flex items-center gap-2 rounded-lg border border-emerald-300 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-wait disabled:opacity-50"
          @click="$emit('status-change', task, 'completed')"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" class="h-4 w-4 fill-current">
            <path fill-rule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z" clip-rule="evenodd" />
          </svg>
          Complete
        </button>
        <DeleteTaskButton
          :task="props.task"
          :disabled="updating"
          :on-delete="props.onDelete"
        />
      </div>
    </div>
  </article>
</template>
