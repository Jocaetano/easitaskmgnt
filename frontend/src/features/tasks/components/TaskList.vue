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
        <TaskSortMenu v-model="sortBy" />
      </div>
    </header>

    <p v-if="error" class="mx-4 mt-4 shrink-0 rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
      {{ error }}
    </p>

    <div class="task-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
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
  </section>
</template>
