<script setup>
import { ref } from 'vue'

const props = defineProps({
  task: { type: Object, required: true },
  onDelete: { type: Function, required: true },
  disabled: { type: Boolean, default: false },
})

const deleting = ref(false)

async function handleDelete() {
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
