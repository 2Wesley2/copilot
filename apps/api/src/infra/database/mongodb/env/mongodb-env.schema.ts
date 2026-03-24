import { z } from 'zod';

export const mongoEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  ENV_PATH: z.string().optional(),
  DB_MODE: z.enum(['inmemory', 'local', 'atlas']),
  DATABASE_URL: z.string().optional(),
  MONGODB_URL: z.string().optional(),
});

export type MongoEnv = z.infer<typeof mongoEnvSchema>;

export function validateMongoEnv(config: Record<string, unknown> | NodeJS.ProcessEnv): MongoEnv {
  return mongoEnvSchema.parse(config);
}
