import assert from 'node:assert/strict'
import { beforeEach, describe, it } from 'node:test'
import request from 'supertest'
import type { Task, TaskStatus } from '../../shared/task.js'
import { createApp } from '../src/app.js'

describe('task API', () => {
  let app: ReturnType<typeof createApp>

  beforeEach(() => {
    app = createApp()
  })

  it('serves Swagger UI and the OpenAPI schema', async () => {
    const schema = await request(app).get('/api-docs.json').expect(200)
    assert.equal(schema.body.openapi, '3.1.0')
    assert.ok(schema.body.paths['/tasks'])
    assert.ok(schema.body.paths['/tasks/{id}'].delete)

    const docs = await request(app).get('/api-docs/').expect(200)
    assert.match(docs.text, /Task Manager API Docs/)
  })

  it('starts with an empty task list', async () => {
    const response = await request(app).get('/tasks').expect(200)
    assert.deepEqual(response.body, [])
  })

  it('filters tasks by status and returns all tasks when no status is selected', async () => {
    const pending = await request(app).post('/tasks').send({ title: 'Pending task' }).expect(201)
    const inProgress = await request(app).post('/tasks').send({ title: 'In-progress task' }).expect(201)
    await request(app)
      .patch(`/tasks/${inProgress.body.id}`)
      .send({ status: 'in-progress' })
      .expect(200)
    const completed = await request(app).post('/tasks').send({ title: 'Completed task' }).expect(201)
    await request(app)
      .patch(`/tasks/${completed.body.id}`)
      .send({ status: 'completed' })
      .expect(200)

    const filtered = await request(app).get('/tasks?status=in-progress').expect(200)
    assert.deepEqual(filtered.body.map((task: Task) => task.id), [inProgress.body.id])

    const allTasks = await request(app).get('/tasks').expect(200)
    assert.deepEqual(allTasks.body.map((task: Task) => task.id), [
      pending.body.id,
      inProgress.body.id,
      completed.body.id,
    ])
  })

  it('rejects an unsupported task status filter', async () => {
    const response = await request(app).get('/tasks?status=unknown').expect(400)
    assert.equal(response.body.message, 'Status must be pending, in-progress, or completed.')
  })

  it('creates and returns a task', async () => {
    const dueDate = '2026-10-05T12:00:00.000Z'
    const response = await request(app)
      .post('/tasks')
      .send({ title: 'Test task', description: 'Details', dueDate })
      .expect(201)

    assert.equal(response.body.id, 1)
    assert.equal(response.body.title, 'Test task')
    assert.equal(response.body.description, 'Details')
    assert.equal(response.body.status, 'pending')
    assert.equal(response.body.dueDate, dueDate)
    assert.ok(response.body.updatedAt)

    const list = await request(app).get('/tasks').expect(200)
    assert.equal(list.body.length, 1)
  })

  it('rejects a missing title or invalid due date', async () => {
    await request(app).post('/tasks').send({ title: '  ' }).expect(400)
    await request(app).post('/tasks').send({ title: 'Task', dueDate: 'invalid' }).expect(400)
    await request(app).post('/tasks').send({ title: 'Task', description: 12 }).expect(400)
    await request(app).post('/tasks').send({ title: 'Task', dueDate: 12 }).expect(400)
  })

  it('moves a task through all supported statuses', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Workflow' }).expect(201)

    const statuses: TaskStatus[] = ['in-progress', 'pending', 'completed']
    for (const status of statuses) {
      const response = await request(app)
        .patch(`/tasks/${created.body.id}`)
        .send({ status })
        .expect(200)
      assert.equal(response.body.status, status)
    }
  })

  it('rejects unknown tasks and statuses', async () => {
    await request(app).patch('/tasks/999').send({ status: 'pending' }).expect(404)
    const created = await request(app).post('/tasks').send({ title: 'Task' }).expect(201)
    await request(app).patch(`/tasks/${created.body.id}`).send({ status: 'unknown' }).expect(400)
  })

  it('deletes a task and removes it from the task list', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Delete me' }).expect(201)

    await request(app).delete(`/tasks/${created.body.id}`).expect(204)

    const list = await request(app).get('/tasks').expect(200)
    assert.deepEqual(list.body, [])
  })

  it('rejects deletion of an unknown task', async () => {
    await request(app).delete('/tasks/999').expect(404)
  })
})
