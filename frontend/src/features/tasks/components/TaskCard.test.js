import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TaskCard from './TaskCard.vue'

function task(overrides = {}) {
  return {
    id: 1,
    title: 'Test task',
    description: 'Short description',
    status: 'pending',
    dueDate: null,
    updatedAt: '2026-10-04T12:00:00.000Z',
    ...overrides,
  }
}

describe('TaskCard', () => {
  it('emits an in-progress status when Start is clicked', async () => {
    const item = task()
    const wrapper = mount(TaskCard, { props: { task: item } })

    await wrapper.get('button[aria-label="Start task"]').trigger('click')

    expect(wrapper.emitted('status-change')[0]).toEqual([item, 'in-progress'])
  })

  it('shows pause and complete actions for an in-progress task', () => {
    const wrapper = mount(TaskCard, { props: { task: task({ status: 'in-progress' }) } })

    expect(wrapper.get('button[aria-label="Pause task"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Complete')
  })

  it('expands and shortens a long description', async () => {
    const finalMarker = 'ZZZ-FINAL-MARKER'
    const description = `Beginning ${'long description '.repeat(20)}${finalMarker}`
    const wrapper = mount(TaskCard, { props: { task: task({ description }) } })

    expect(wrapper.text()).not.toContain(finalMarker)
    await wrapper.get('button[aria-label^="Expand description"]').trigger('click')
    expect(wrapper.text()).toContain(finalMarker)
    expect(wrapper.text()).toContain('Short')

    await wrapper.get('button[aria-label^="Shorten description"]').trigger('click')
    expect(wrapper.text()).not.toContain(finalMarker)
  })
})
