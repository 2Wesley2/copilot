import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { isNullish } from '@copilot/shared';

import { createError } from '../../../../error/error.factory.js';
import { errorHandler, type Result } from '../../../../error/index.js';

export interface MongoEnvPolicyResult {
  readonly envFilePath: string | string[];
  readonly ignoreEnvFile: boolean;
}

export interface MongoEnvPolicy {
  resolve(predefinedEnv?: NodeJS.ProcessEnv): Result<MongoEnvPolicyResult, Error>;
}

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = dirname(currentFilePath);
const envFileName = '.env';

function findEnvFileUpwards(startDirectory: string): Result<string, Error> {
  let currentDirectory = startDirectory;
  let reachedRoot = false;

  while (!reachedRoot) {
    const candidateEnvPath = resolve(currentDirectory, envFileName);

    if (existsSync(candidateEnvPath)) {
      return errorHandler.ok(candidateEnvPath);
    }

    const parentDirectory = dirname(currentDirectory);
    reachedRoot = parentDirectory === currentDirectory;
    currentDirectory = parentDirectory;
  }

  return errorHandler.err(
    createError(
      `Arquivo "${envFileName}" não encontrado ao subir a árvore de diretórios a partir de "${startDirectory}".`,
    ),
  );
}

function resolveExplicitEnvPath(envPath: string): Result<string, Error> {
  const resolvedEnvPath = resolve(envPath);

  if (!existsSync(resolvedEnvPath)) {
    return errorHandler.err(
      createError(
        `Arquivo de ambiente informado em ENV_PATH não encontrado: "${resolvedEnvPath}".`,
      ),
    );
  }

  return errorHandler.ok(resolvedEnvPath);
}

export class DefaultMongoEnvPolicy implements MongoEnvPolicy {
  public resolve(
    predefinedEnv: NodeJS.ProcessEnv = process.env,
  ): Result<MongoEnvPolicyResult, Error> {
    const { NODE_ENV, ENV_PATH } = predefinedEnv;
    const ignoreEnvFile = NODE_ENV === 'production' || NODE_ENV === 'test';

    if (ignoreEnvFile) {
      return errorHandler.ok({
        envFilePath: ENV_PATH ?? [],
        ignoreEnvFile: true,
      });
    }

    if (!isNullish(ENV_PATH)) {
      return resolveExplicitEnvPath(ENV_PATH).map((envFilePath) => ({
        envFilePath,
        ignoreEnvFile: false,
      }));
    }

    return findEnvFileUpwards(currentDirPath).map((envFilePath) => ({
      envFilePath,
      ignoreEnvFile: false,
    }));
  }
}

export const createMongoEnvPolicy = (): MongoEnvPolicy => new DefaultMongoEnvPolicy();
