import cors from 'cors'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import { openApiSpec } from './openapi.js'

export function createApp() {
  const app = express()
  let nextTaskId = 1
  const tasks = []

  app.use(cors())
  app.use(express.json())
  app.get('/api-docs.json', (_request, response) => response.json(openApiSpec))
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
    customSiteTitle: 'Task Manager API Docs',
  }))

  app.get('/tasks', (_request, response) => {
    response.json(tasks)
  })

  app.post('/tasks', (request, response) => {
    const title = request.body.title?.trim()
    const description = request.body.description?.trim() || ''
    const dueDate = request.body.dueDate ? new Date(request.body.dueDate) : null

    if (!title) {
      return response.status(400).json({ message: 'Title is required.' })
    }

    if (dueDate && Number.isNaN(dueDate.getTime())) {
      return response.status(400).json({ message: 'Due date is invalid.' })
    }

    const task = {
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

    if (!['pending', 'in-progress', 'completed'].includes(request.body.status)) {
      return response.status(400).json({ message: 'Status must be pending, in-progress, or completed.' })
    }

    task.status = request.body.status
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
