export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'Task Manager API',
    version: '1.0.0',
    description: 'API for creating, listing, updating, and deleting tasks.',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Local development' }],
  tags: [{ name: 'Tasks', description: 'Task management operations' }],
  paths: {
    '/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'List tasks, optionally filtered by status',
        parameters: [{
          name: 'status',
          in: 'query',
          required: false,
          schema: { $ref: '#/components/schemas/TaskStatus' },
        }],
        responses: {
          200: {
            description: 'Tasks matching the optional status filter',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
              },
            },
          },
          400: {
            description: 'Invalid status filter',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
        },
      },
      post: {
        tags: ['Tasks'],
        summary: 'Create a task',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateTask' },
            },
          },
        },
        responses: {
          201: {
            description: 'Task created',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Task' } },
            },
          },
          400: {
            description: 'Invalid task input',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
        },
      },
    },
    '/tasks/{id}': {
      patch: {
        tags: ['Tasks'],
        summary: 'Change a task status',
        parameters: [{
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer', minimum: 1 },
        }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateTaskStatus' },
            },
          },
        },
        responses: {
          200: {
            description: 'Task updated',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Task' } },
            },
          },
          400: {
            description: 'Invalid status',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
          404: {
            description: 'Task not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
        },
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Delete a task',
        parameters: [{
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer', minimum: 1 },
        }],
        responses: {
          204: { description: 'Task deleted' },
          404: {
            description: 'Task not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Task: {
        type: 'object',
        required: ['id', 'title', 'description', 'status', 'dueDate', 'updatedAt'],
        properties: {
          id: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'Finish the assignment' },
          description: { type: 'string', example: 'Complete the Task Manager project' },
          status: { $ref: '#/components/schemas/TaskStatus' },
          dueDate: {
            oneOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }],
            example: '2026-10-05T18:00:00.000Z',
          },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateTask: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', minLength: 1 },
          description: { type: 'string', default: '' },
          dueDate: {
            oneOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }],
          },
        },
      },
      UpdateTaskStatus: {
        type: 'object',
        required: ['status'],
        properties: { status: { $ref: '#/components/schemas/TaskStatus' } },
      },
      TaskStatus: {
        type: 'string',
        enum: ['pending', 'in-progress', 'completed'],
      },
      Error: {
        type: 'object',
        required: ['message'],
        properties: { message: { type: 'string' } },
      },
    },
  },
}
