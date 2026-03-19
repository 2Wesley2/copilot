import { isNullish } from '@copilot/shared';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config as loadDotEnv } from 'dotenv';

import { createAppModuleResult } from './app.module.js';
import { createError } from './error/error.factory.js';
import { errorHandler, type Result, toResultAsync } from './error/index.js';
import { createMongoEnvPolicy } from './infra/database/mongodb/connection/mongodb-env.policy.js';

function normalizeEnvFilePaths(envFilePath: string | string[]): readonly string[] {
  return Array.isArray(envFilePath) ? envFilePath : [envFilePath];
}

function loadMongoEnvFilesResult(
  predefinedEnv: NodeJS.ProcessEnv = process.env,
): Result<void, Error> {
  return createMongoEnvPolicy()
    .resolve(predefinedEnv)
    .andThen((policy) => {
      if (policy.ignoreEnvFile) {
        return errorHandler.ok(undefined);
      }

      const envFilePaths = normalizeEnvFilePaths(policy.envFilePath);

      if (envFilePaths.length === 0) {
        return errorHandler.err(
          createError('Nenhum arquivo .env foi resolvido para carregamento.'),
        );
      }

      for (const envFilePath of envFilePaths) {
        const dotenvResult = loadDotEnv({
          path: envFilePath,
          override: false,
        });

        if (!isNullish(dotenvResult.error)) {
          return errorHandler.err(dotenvResult.error);
        }
      }

      return errorHandler.ok(undefined);
    });
}

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

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  await toResultAsync(loadMongoEnvFilesResult())
    .andThen(() => createAppModuleResult(process.env))
    .match(
      async (appModule) => {
        const app = await NestFactory.create(appModule);
        const port = resolvePort(process.env);

        await app.listen(port);
        logger.log(`Application is running on port ${String(port)}.`);
      },
      (error) => {
        logger.error(error.message, error.stack);
        process.exitCode = 1;

        return Promise.resolve();
      },
    );
}

void bootstrap().catch((cause: unknown) => {
  const logger = new Logger('Bootstrap');
  const error = errorHandler.normalize(cause);

  logger.error(error.message, error.stack);
  process.exitCode = 1;
});
