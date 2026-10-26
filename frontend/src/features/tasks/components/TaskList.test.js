import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import TaskList from './TaskList.vue'

function mountTaskList(statusFilter = '') {
  return mount(TaskList, {
    props: {
      tasks: [],
      loading: false,
      onTaskDelete: vi.fn(),
      statusFilter,
    },
  })
}

describe('TaskList status filters', () => {
  it('allows at most one status filter and toggles the active filter off', async () => {
    const wrapper = mountTaskList()
    const pending = wrapper.get('button[aria-label="Filter by Pending"]')
    const completed = wrapper.get('button[aria-label="Filter by Completed"]')

    await pending.trigger('click')
    expect(wrapper.emitted('update:statusFilter')).toEqual([['pending']])

    await completed.trigger('click')
    expect(wrapper.emitted('update:statusFilter')).toEqual([['pending'], ['completed']])
  })

  it('clears the selected status when its chip is clicked again', async () => {
    const wrapper = mountTaskList('pending')

    await wrapper.get('button[aria-label="Filter by Pending"]').trigger('click')

    expect(wrapper.emitted('update:statusFilter')).toEqual([['']])
  })

  it('marks only the selected status chip as pressed', () => {
    const wrapper = mountTaskList('in-progress')

    expect(wrapper.get('button[aria-label="Filter by Pending"]').attributes('aria-pressed')).toBe('false')
    expect(wrapper.get('button[aria-label="Filter by In progress"]').attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('button[aria-label="Filter by Completed"]').attributes('aria-pressed')).toBe('false')
  })
})
