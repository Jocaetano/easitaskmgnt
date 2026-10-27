<script setup lang="ts">
import { ref } from 'vue'
import type { Task } from '../../../../../shared/task'

const props = withDefaults(defineProps<{
  task: Task
  onDelete: (task: Task) => void | Promise<void>
  disabled?: boolean
}>(), { disabled: false })

const deleting = ref(false)

async function handleDelete(): Promise<void> {
  if (deleting.value || props.disabled) return

  deleting.value = true
  try {
    await props.onDelete(props.task)
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <button
    type="button"
    :disabled="disabled || deleting"
    class="inline-flex items-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-50"
    aria-label="Delete task"
    title="Delete task"
    @click="handleDelete"
  >
    {{ deleting ? 'Deleting...' : 'Delete' }}
  </button>
</template>
