<script setup>
import { ref } from 'vue'
import { useTasks } from './composables/useTasks'
import AddTaskModal from './components/AddTaskModal.vue'
import DueToastStack from './components/DueToastStack.vue'
import TaskHeader from './components/TaskHeader.vue'
import TaskList from './components/TaskList.vue'

const modalOpen = ref(false)
const {
  tasks,
  statusFilter,
  loading,
  submitting,
  updatingTaskId,
  error,
  formError,
  dueToasts,
  addTask,
  updateStatus,
  deleteTask,
  dismissToast,
} = useTasks()

function openModal() {
  formError.value = ''
  modalOpen.value = true
}

function closeModal() {
  if (!submitting.value) modalOpen.value = false
}

async function handleAdd(form) {
  if (await addTask(form)) modalOpen.value = false
}

function handleDelete(task) {
  if (!window.confirm(`Delete "${task.title}"? This action cannot be undone.`)) return
  return deleteTask(task)
}
</script>

<template>
  <main class="h-dvh overflow-hidden bg-slate-100 px-4 py-4 text-slate-900 sm:px-6 sm:py-6">
    <DueToastStack :toasts="dueToasts" @dismiss="dismissToast" />

    <section class="mx-auto flex h-full max-w-4xl flex-col">
      <TaskHeader @add="openModal" />
      <TaskList
        :tasks="tasks"
        v-model:status-filter="statusFilter"
        :loading="loading"
        :error="error"
        :updating-task-id="updatingTaskId"
        :on-task-delete="handleDelete"
        @add="openModal"
        @status-change="updateStatus"
      />
    </section>

    <AddTaskModal
      v-if="modalOpen"
      :submitting="submitting"
      :error="formError"
      @close="closeModal"
      @submit="handleAdd"
    />
  </main>
</template>
