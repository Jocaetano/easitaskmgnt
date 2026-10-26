import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import DeleteTaskButton from './DeleteTaskButton.vue'

describe('DeleteTaskButton', () => {
  it('prevents a second delete while the first request is pending', async () => {
    let finishDelete
    const onDelete = vi.fn(() => new Promise((resolve) => {
      finishDelete = resolve
    }))
    const wrapper = mount(DeleteTaskButton, {
      props: { task: { id: 1, title: 'Test task' }, onDelete },
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
