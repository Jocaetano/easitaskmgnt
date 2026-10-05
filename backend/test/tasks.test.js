import assert from 'node:assert/strict'
import { beforeEach, describe, it } from 'node:test'
import request from 'supertest'
import { createApp } from '../src/app.js'

describe('task API', () => {
  let app

  beforeEach(() => {
    app = createApp()
  })

  it('serves Swagger UI and the OpenAPI schema', async () => {
    const schema = await request(app).get('/api-docs.json').expect(200)
    assert.equal(schema.body.openapi, '3.1.0')
    assert.ok(schema.body.paths['/tasks'])

    const docs = await request(app).get('/api-docs/').expect(200)
    assert.match(docs.text, /Task Manager API Docs/)
  })

  it('starts with an empty task list', async () => {
    const response = await request(app).get('/tasks').expect(200)
    assert.deepEqual(response.body, [])
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
  })

  it('moves a task through all supported statuses', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Workflow' }).expect(201)

    for (const status of ['in-progress', 'pending', 'completed']) {
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
})
