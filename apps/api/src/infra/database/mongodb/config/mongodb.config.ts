import { isNullish } from '@copilot/shared';

import type { Result } from '../../../../error/index.js';
import { createError, errorHandler } from '../../../../error/index.js';
import type { MongoEnv } from '../env/mongodb-env.schema.js';
import { validateMongoEnv } from '../env/mongodb-env.schema.js';
import type { DbMode } from '../mongodb.types.js';
import {
  createDisallowedNodeEnvError,
  createInvalidAtlasUriError,
  createInvalidLocalSrvUriError,
  createInvalidLocalUriError,
  createMissingConfiguredUriError,
} from '../runtime/mongodb.errors.js';

export interface MongoDatabaseConfig {
  readonly nodeEnv: MongoEnv['NODE_ENV'];
  readonly mode: DbMode;
  readonly configuredUri?: string | undefined;
}

const ALLOWED_MODES_BY_NODE_ENV: Readonly<Record<MongoEnv['NODE_ENV'], ReadonlySet<DbMode>>> =
  Object.freeze({
    development: new Set<DbMode>(['local', 'inmemory']),
    test: new Set<DbMode>(['inmemory']),
    production: new Set<DbMode>(['atlas']),
  });

function parseMongoEnv(predefinedEnv: NodeJS.ProcessEnv = process.env): Result<MongoEnv, Error> {
  try {
    return errorHandler.ok(validateMongoEnv(predefinedEnv));
  } catch (cause: unknown) {
    return errorHandler.err(errorHandler.normalize(cause));
  }
}

function resolveConfiguredUri(env: MongoEnv): string | undefined {
  const value = env.MONGODB_URL ?? env.DATABASE_URL;

  if (isNullish(value)) {
    return undefined;
  }

  const trimmedValue = value.trim();

  return trimmedValue === '' ? undefined : trimmedValue;
}

function validateModeAgainstNodeEnv(
  nodeEnv: MongoEnv['NODE_ENV'],
  mode: DbMode,
): Result<DbMode, Error> {
  const allowedModes = ALLOWED_MODES_BY_NODE_ENV[nodeEnv];

  if (!allowedModes.has(mode)) {
    return errorHandler.err(createDisallowedNodeEnvError(mode, nodeEnv));
  }

  return errorHandler.ok(mode);
}

function validateConfiguredUri(
  mode: DbMode,
  configuredUri: string | undefined,
): Result<string | undefined, Error> {
  if (mode === 'inmemory') {
    return errorHandler.ok(undefined);
  }

  if (isNullish(configuredUri)) {
    return errorHandler.err(createMissingConfiguredUriError(mode));
  }

  if (mode === 'local') {
    if (!configuredUri.startsWith('mongodb://')) {
      return errorHandler.err(createInvalidLocalUriError());
    }

    if (configuredUri.includes('+srv')) {
      return errorHandler.err(createInvalidLocalSrvUriError());
    }

    return errorHandler.ok(configuredUri);
  }

  if (!configuredUri.startsWith('mongodb+srv://')) {
    return errorHandler.err(createInvalidAtlasUriError());
  }

  return errorHandler.ok(configuredUri);
}

function createMongoDatabaseConfig(params: {
  nodeEnv: MongoEnv['NODE_ENV'];
  mode: DbMode;
  configuredUri?: string | undefined;
}): MongoDatabaseConfig {
  return {
    nodeEnv: params.nodeEnv,
    mode: params.mode,
    ...(isNullish(params.configuredUri) ? {} : { configuredUri: params.configuredUri }),
  };
}

export function resolveMongoDatabaseConfig(
  predefinedEnv: NodeJS.ProcessEnv = process.env,
): Result<MongoDatabaseConfig, Error> {
  return parseMongoEnv(predefinedEnv).andThen((env) => {
    const configuredUri = resolveConfiguredUri(env);

    return validateModeAgainstNodeEnv(env.NODE_ENV, env.DB_MODE).andThen((mode) =>
      validateConfiguredUri(mode, configuredUri).map((validatedConfiguredUri) =>
        createMongoDatabaseConfig({
          nodeEnv: env.NODE_ENV,
          mode,
          configuredUri: validatedConfiguredUri,
        }),
      ),
    );
  });
}

export function createMongoConfigNotResolvedError(): Error {
  return createError('MongoDatabaseConfig não foi resolvido antes da inicialização do módulo.');
}
