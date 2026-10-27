<script setup lang="ts">
defineEmits<{ add: [] }>()
</script>

<template>
  <header class="mb-5 flex shrink-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p class="text-sm font-semibold uppercase tracking-wider text-indigo-600">Task manager</p>
      <h1 class="mt-1 text-3xl font-bold">Your tasks</h1>
      <p class="mt-2 text-sm text-slate-500">Capture what needs to be done and keep moving.</p>
    </div>
    <button
      type="button"
      class="hidden items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:inline-flex"
      @click="$emit('add')"
    >
      <span aria-hidden="true" class="text-xl leading-none">+</span>
      Add task
    </button>
  </header>
</template>
