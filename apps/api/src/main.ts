import { isNullish } from '@copilot/shared';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config as loadDotenv } from 'dotenv';

import { AppModule } from './app.module.js';
import { createError, errorHandler, type Result } from './error/index.js';
import { resolveMongoDatabaseConfig } from './infra/database/mongodb/config/mongodb.config.js';
import { createMongoEnvPolicy } from './infra/database/mongodb/connection/mongodb-env.policy.js';
import { resolveMongoRuntime } from './infra/database/mongodb/runtime/mongodb.runtime.js';

function resolvePort(predefinedEnv: NodeJS.ProcessEnv = process.env): number {
  const rawPort = predefinedEnv['PORT'];

  if (isNullish(rawPort)) {
    return 3000;
  }

  const parsedPort = Number(rawPort);

  if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
    return 3000;
  }

  return parsedPort;
}

function normalizeEnvFilePaths(envFilePath: string | string[]): readonly string[] {
  return Array.isArray(envFilePath) ? envFilePath : [envFilePath];
}

function applyEnvFilePolicy(predefinedEnv: NodeJS.ProcessEnv = process.env): Result<void, Error> {
  return createMongoEnvPolicy()
    .resolve(predefinedEnv)
    .andThen((policy) => {
      if (policy.ignoreEnvFile) {
        return errorHandler.ok(undefined);
      }

      for (const envFilePath of normalizeEnvFilePaths(policy.envFilePath)) {
        const loaded = loadDotenv({
          path: envFilePath,
          override: false,
        });

        if (loaded.error instanceof Error) {
          return errorHandler.err(
            createError(`Falha ao carregar arquivo de ambiente: ${envFilePath}`),
          );
        }
      }

      return errorHandler.ok(undefined);
    });
}

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  applyEnvFilePolicy(process.env).match(
    () => undefined,
    (error) => {
      throw error;
    },
  );

  const databaseConfig = resolveMongoDatabaseConfig(process.env).match(
    (value) => value,
    (error) => {
      throw error;
    },
  );

  const runtimeConfig = await resolveMongoRuntime(process.env).match(
    (value) => Promise.resolve(value),
    (error) => Promise.reject(error),
  );

  const app = await NestFactory.create(
    AppModule.register({
      databaseConfig,
      runtimeConfig,
    }),
  );

  const port = resolvePort(process.env);

  await app.listen(port);
  logger.log(`Application is running on port ${String(port)}.`);
}

void bootstrap().catch((error: unknown) => {
  const logger = new Logger('Bootstrap');

  logger.error(
    error instanceof Error ? error.message : 'Unknown bootstrap error',
    error instanceof Error ? error.stack : undefined,
  );

  process.exitCode = 1;
});
