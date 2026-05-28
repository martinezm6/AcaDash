import { z } from 'zod';
import { insertSubjectSchema, insertTaskSchema, insertEventSchema, insertClassSchema, subjects, tasks, events, classes } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  subjects: {
    list: {
      method: 'GET' as const,
      path: '/api/subjects' as const,
      responses: { 200: z.array(z.custom<typeof subjects.$inferSelect>()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/subjects' as const,
      input: insertSubjectSchema,
      responses: { 201: z.custom<typeof subjects.$inferSelect>(), 400: errorSchemas.validation },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/subjects/:id' as const,
      input: insertSubjectSchema.partial(),
      responses: { 200: z.custom<typeof subjects.$inferSelect>(), 404: errorSchemas.notFound },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/subjects/:id' as const,
      responses: { 204: z.void(), 404: errorSchemas.notFound },
    },
  },
  tasks: {
    list: {
      method: 'GET' as const,
      path: '/api/tasks' as const,
      responses: { 200: z.array(z.custom<typeof tasks.$inferSelect>()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/tasks' as const,
      input: insertTaskSchema,
      responses: { 201: z.custom<typeof tasks.$inferSelect>(), 400: errorSchemas.validation },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/tasks/:id' as const,
      input: insertTaskSchema.partial(),
      responses: { 200: z.custom<typeof tasks.$inferSelect>(), 404: errorSchemas.notFound },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/tasks/:id' as const,
      responses: { 204: z.void(), 404: errorSchemas.notFound },
    },
  },
  events: {
    list: {
      method: 'GET' as const,
      path: '/api/events' as const,
      responses: { 200: z.array(z.custom<typeof events.$inferSelect>()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/events' as const,
      input: insertEventSchema,
      responses: { 201: z.custom<typeof events.$inferSelect>(), 400: errorSchemas.validation },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/events/:id' as const,
      input: insertEventSchema.partial(),
      responses: { 200: z.custom<typeof events.$inferSelect>(), 404: errorSchemas.notFound },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/events/:id' as const,
      responses: { 204: z.void(), 404: errorSchemas.notFound },
    },
  },
  classes: {
    list: {
      method: 'GET' as const,
      path: '/api/classes' as const,
      responses: { 200: z.array(z.custom<typeof classes.$inferSelect>()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/classes' as const,
      input: insertClassSchema,
      responses: { 201: z.custom<typeof classes.$inferSelect>(), 400: errorSchemas.validation },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/classes/:id' as const,
      input: insertClassSchema.partial(),
      responses: { 200: z.custom<typeof classes.$inferSelect>(), 404: errorSchemas.notFound },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/classes/:id' as const,
      responses: { 204: z.void(), 404: errorSchemas.notFound },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
