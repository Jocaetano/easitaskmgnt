import cors from 'cors'
import express from 'express'

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

let nextTaskId = 1
const tasks = []

app.get('/tasks', (_request, response) => {
  response.json(tasks)
})

app.post('/tasks', (request, response) => {
  const title = request.body.title?.trim()
  const description = request.body.description?.trim() || ''

  if (!title) {
    return response.status(400).json({ message: 'Title is required.' })
  }

  const task = {
    id: nextTaskId++,
    title,
    description,
    status: 'pending',
  }

  tasks.push(task)
  return response.status(201).json(task)
})

app.patch('/tasks/:id', (request, response) => {
  const taskId = Number(request.params.id)
  const task = tasks.find((item) => item.id === taskId)

  if (!task) {
    return response.status(404).json({ message: 'Task not found.' })
  }

  if (!['pending', 'completed'].includes(request.body.status)) {
    return response.status(400).json({ message: 'Status must be pending or completed.' })
  }

  task.status = request.body.status
  return response.json(task)
})

app.listen(port, () => {
  console.log(`Task API running at http://localhost:${port}`)
})
