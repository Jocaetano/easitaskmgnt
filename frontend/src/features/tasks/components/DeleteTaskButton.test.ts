import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import type { Task } from '../../../../../shared/task'
import DeleteTaskButton from './DeleteTaskButton.vue'

describe('DeleteTaskButton', () => {
  it('prevents a second delete while the first request is pending', async () => {
    let finishDelete: () => void = () => {}
    const onDelete = vi.fn(() => new Promise<void>((resolve) => {
      finishDelete = resolve
    }))
    const task: Task = {
      id: 1,
      title: 'Test task',
      description: '',
      status: 'pending',
      dueDate: null,
      updatedAt: '2026-10-04T12:00:00.000Z',
    }
    const wrapper = mount(DeleteTaskButton, {
      props: { task, onDelete },
    })

    await wrapper.get('button[aria-label="Delete task"]').trigger('click')
    expect(wrapper.get('button[aria-label="Delete task"]').text()).toContain('Deleting...')
    await wrapper.get('button[aria-label="Delete task"]').trigger('click')

    expect(onDelete).toHaveBeenCalledTimes(1)

    finishDelete()
    await Promise.resolve()
    await wrapper.vm.$nextTick()
    expect(wrapper.get('button[aria-label="Delete task"]').text()).toContain('Delete')
  })

})
