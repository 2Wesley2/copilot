import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';

function resolvePort(predefinedEnv: NodeJS.ProcessEnv = process.env): number {
  const rawPort = predefinedEnv['PORT'];

  if (rawPort === undefined) {
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
  const app = await NestFactory.create(AppModule);
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
