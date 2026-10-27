<script setup lang="ts">
import { ref } from 'vue'
import type { TaskSortKey } from '../utils/taskFormatters'

withDefaults(defineProps<{
  modelValue: TaskSortKey
  compact?: boolean
}>(), { compact: false })
const emit = defineEmits<{ 'update:modelValue': [value: TaskSortKey] }>()
const open = ref(false)

function select(value: TaskSortKey): void {
  emit('update:modelValue', value)
  open.value = false
}
</script>

<template>
  <div class="relative" @keydown.esc="open = false">
    <button
      type="button"
      class="inline-flex items-center justify-center font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      :class="compact
        ? 'h-14 w-14 rounded-full bg-white text-indigo-700 shadow-lg ring-1 ring-slate-200 hover:bg-indigo-50'
        : 'gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50'"
      :aria-expanded="open"
      aria-haspopup="menu"
      :aria-label="compact ? 'Sort tasks' : undefined"
      @click="open = !open"
    >
      <svg aria-hidden="true" viewBox="0 0 20 20" class="h-4 w-4 fill-current">
        <path d="M6 3a1 1 0 0 1 1 1v9.6l1.3-1.3a1 1 0 1 1 1.4 1.4l-3 3a1 1 0 0 1-1.4 0l-3-3a1 1 0 0 1 1.4-1.4L5 13.6V4a1 1 0 0 1 1-1Zm7-1a1 1 0 0 1 .7.3l3 3a1 1 0 0 1-1.4 1.4L14 5.4V15a1 1 0 1 1-2 0V5.4l-1.3 1.3a1 1 0 1 1-1.4-1.4l3-3A1 1 0 0 1 13 2Z" />
      </svg>
      <span v-if="!compact">Sort</span>
    </button>

    <div
      v-if="open"
      class="absolute right-0 z-20 w-52 overflow-hidden rounded-xl bg-white p-1.5 shadow-xl ring-1 ring-slate-200"
      :class="compact ? 'bottom-full mb-3' : 'mt-2'"
      role="menu"
    >
      <button
        v-for="option in [{ value: 'updatedAt', label: 'Update date' }, { value: 'dueDate', label: 'Due date' }]"
        :key="option.value"
        type="button"
        role="menuitemradio"
        :aria-checked="modelValue === option.value"
        class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-slate-100"
        :class="modelValue === option.value ? 'font-semibold text-indigo-700' : 'text-slate-700'"
        @click="select(option.value)"
      >
        {{ option.label }}
        <span v-if="modelValue === option.value" aria-hidden="true">&#10003;</span>
      </button>
    </div>
  </div>
</template>
