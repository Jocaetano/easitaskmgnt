import cors from 'cors'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import { isTaskStatus, type Task } from '../../shared/task.js'
import { openApiSpec } from './openapi.js'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function createApp() {
  const app = express()
  let nextTaskId = 1
  const tasks: Task[] = []

  app.use(cors())
  app.use(express.json())
  app.get('/api-docs.json', (_request, response) => response.json(openApiSpec))
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
    customSiteTitle: 'Task Manager API Docs',
  }))

  app.get('/tasks', (request, response) => {
    const { status } = request.query

    if (status !== undefined && (typeof status !== 'string' || !isTaskStatus(status))) {
      return response.status(400).json({
        message: 'Status must be pending, in-progress, or completed.',
      })
    }

    const filteredTasks = status ? tasks.filter((task) => task.status === status) : tasks
    return response.json(filteredTasks)
  })

  app.post('/tasks', (request, response) => {
    const body: unknown = request.body
    const input = isRecord(body) ? body : {}
    const title = typeof input.title === 'string' ? input.title.trim() : ''
    const description = typeof input.description === 'string' ? input.description.trim() : ''
    const dueDateValue = typeof input.dueDate === 'string' ? input.dueDate : null
    const dueDate = dueDateValue ? new Date(dueDateValue) : null

    if (!title) {
      return response.status(400).json({ message: 'Title is required.' })
    }

    if (input.description !== undefined && typeof input.description !== 'string') {
      return response.status(400).json({ message: 'Description must be a string.' })
    }

    if (input.dueDate !== undefined && input.dueDate !== null && typeof input.dueDate !== 'string') {
      return response.status(400).json({ message: 'Due date is invalid.' })
    }

    if (dueDate && Number.isNaN(dueDate.getTime())) {
      return response.status(400).json({ message: 'Due date is invalid.' })
    }

    const task: Task = {
      id: nextTaskId++,
      title,
      description,
      status: 'pending',
      dueDate: dueDate?.toISOString() || null,
      updatedAt: new Date().toISOString(),
    }

    tasks.push(task)
    return response.status(201).json(task)
  })

  app.patch('/tasks/:id', (request, response) => {
    const task = tasks.find((item) => item.id === Number(request.params.id))

    if (!task) {
      return response.status(404).json({ message: 'Task not found.' })
    }

    const body: unknown = request.body
    const status = isRecord(body) ? body.status : undefined

    if (!isTaskStatus(status)) {
      return response.status(400).json({ message: 'Status must be pending, in-progress, or completed.' })
    }

    task.status = status
    task.updatedAt = new Date().toISOString()
    return response.json(task)
  })

  app.delete('/tasks/:id', (request, response) => {
    const taskIndex = tasks.findIndex((item) => item.id === Number(request.params.id))

    if (taskIndex === -1) {
      return response.status(404).json({ message: 'Task not found.' })
    }

    tasks.splice(taskIndex, 1)
    return response.status(204).end()
  })

  return app
}
