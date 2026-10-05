<script setup>
import { computed, ref } from 'vue'
import { sortTasks } from '../utils/taskFormatters'
import TaskCard from './TaskCard.vue'
import TaskSortMenu from './TaskSortMenu.vue'

const props = defineProps({
  tasks: { type: Array, required: true },
  loading: { type: Boolean, required: true },
  error: { type: String, default: '' },
  updatingTaskId: { type: Number, default: null },
})
defineEmits(['add', 'status-change'])

const sortBy = ref('updatedAt')
const sortedTasks = computed(() => sortTasks(props.tasks, sortBy.value))
</script>

<template>
  <section class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
    <header class="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
      <h2 class="text-lg font-semibold text-slate-700">Task list</h2>
      <div class="flex items-center gap-2">
        <span class="hidden rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600 sm:inline-flex">
          {{ tasks.length }} {{ tasks.length === 1 ? 'task' : 'tasks' }}
        </span>
        <div class="hidden sm:block">
          <TaskSortMenu v-model="sortBy" />
        </div>
      </div>
    </header>

    <p v-if="error" class="mx-4 mt-4 shrink-0 rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
      {{ error }}
    </p>

    <div class="task-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-24 sm:p-5">
      <div v-if="loading" class="flex h-full min-h-40 items-center justify-center text-slate-500">
        Loading tasks...
      </div>

      <div
        v-else-if="tasks.length === 0"
        class="flex h-full min-h-52 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-10 text-center"
      >
        <p class="font-semibold text-slate-700">No tasks yet</p>
        <p class="mt-1 text-sm text-slate-500">Create your first task to get started.</p>
        <button type="button" class="mt-4 font-semibold text-indigo-600 hover:text-indigo-700" @click="$emit('add')">
          Add your first task
        </button>
      </div>

      <ul v-else class="space-y-3">
        <li v-for="task in sortedTasks" :key="task.id">
          <TaskCard
            :task="task"
            :updating="updatingTaskId === task.id"
            @status-change="(item, status) => $emit('status-change', item, status)"
          />
        </li>
      </ul>
    </div>

    <div class="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-30 flex w-[60vw] -translate-x-1/2 items-center justify-between rounded-full bg-white/35 p-2 shadow-lg ring-1 ring-white/40 backdrop-blur-[2px] sm:hidden">
      <button
        type="button"
        class="inline-flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        aria-label="Add task"
        @click="$emit('add')"
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" class="h-6 w-6 fill-current">
          <path d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1Z" />
        </svg>
      </button>
      <TaskSortMenu v-model="sortBy" compact />
    </div>
  </section>
</template>
