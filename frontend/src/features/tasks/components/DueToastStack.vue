<script setup>
import { formatDate } from '../utils/taskFormatters'

defineProps({ toasts: { type: Array, required: true } })
defineEmits(['dismiss'])
</script>

<template>
  <div class="fixed right-4 top-4 z-40 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3" aria-live="polite">
    <div
      v-for="toast in toasts"
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
          @click="$emit('dismiss', toast.id)"
        >
          &times;
        </button>
      </div>
    </div>
  </div>
</template>
