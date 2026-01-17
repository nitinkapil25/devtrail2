import { z } from 'zod';
import { insertEntrySchema, insertProjectSchema, insertTagSchema, entries, projects, tags } from './schema';

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
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  entries: {
    list: {
      method: 'GET' as const,
      path: '/api/entries',
      responses: {
        200: z.array(z.custom<typeof entries.$inferSelect & { tags: string[], projects: typeof projects.$inferSelect[] }>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/entries',
      input: insertEntrySchema.extend({
        tags: z.array(z.string()).optional(),
        projectIds: z.array(z.number()).optional(),
      }),
      responses: {
        201: z.custom<typeof entries.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/entries/:id',
      responses: {
        200: z.custom<typeof entries.$inferSelect & { tags: string[], projects: typeof projects.$inferSelect[] }>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/entries/:id',
      input: insertEntrySchema.partial().extend({
        tags: z.array(z.string()).optional(),
        projectIds: z.array(z.number()).optional(),
      }),
      responses: {
        200: z.custom<typeof entries.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/entries/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },
  projects: {
    list: {
      method: 'GET' as const,
      path: '/api/projects',
      responses: {
        200: z.array(z.custom<typeof projects.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/projects',
      input: insertProjectSchema,
      responses: {
        201: z.custom<typeof projects.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/projects/:id',
      responses: {
        200: z.custom<typeof projects.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },
  tags: {
    list: {
      method: 'GET' as const,
      path: '/api/tags',
      responses: {
        200: z.array(z.custom<typeof tags.$inferSelect>()),
      },
    },
  },
  ai: {
    generateSummary: {
      method: 'POST' as const,
      path: '/api/ai/summary',
      input: z.object({
        timeRange: z.enum(['daily', 'weekly']),
      }),
      responses: {
        200: z.object({ summary: z.string(), insights: z.array(z.string()) }),
        401: errorSchemas.unauthorized,
      },
    },
    suggestNextSteps: {
      method: 'POST' as const,
      path: '/api/ai/next-steps',
      responses: {
        200: z.object({ suggestions: z.array(z.string()) }),
        401: errorSchemas.unauthorized,
      },
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
