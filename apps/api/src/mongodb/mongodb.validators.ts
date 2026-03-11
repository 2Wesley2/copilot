import { type AsyncResult, errorHandler, type Result } from '../error/index.js';
import type { DbMode } from './mongodb.environment.js';
import {
  createDisallowedNodeEnvError,
  createInvalidAtlasUriError,
  createInvalidLocalSrvUriError,
  createInvalidLocalUriError,
  createMissingConfiguredUriError,
} from './mongodb.errors.js';

function requireConfiguredUri(
  mode: DbMode,
  configuredUri: string | undefined,
): Result<string, Error> {
  if (configuredUri === undefined || configuredUri === '') {
    return errorHandler.err(createMissingConfiguredUriError(mode));
  }

  return errorHandler.ok(configuredUri);
}

export function requireConfiguredUriAsync(
  mode: DbMode,
  configuredUri: string | undefined,
): AsyncResult<string, Error> {
  return errorHandler.fromResult(requireConfiguredUri(mode, configuredUri));
}

function validateAllowedNodeEnv(
  mode: DbMode,
  nodeEnv: string,
  allowedNodeEnvs: Set<string>,
): Result<void, Error> {
  if (!allowedNodeEnvs.has(nodeEnv)) {
    return errorHandler.err(createDisallowedNodeEnvError(mode, nodeEnv));
  }

  return errorHandler.ok(undefined);
}

function validateLocalUri(uri: string): Result<string, Error> {
  if (!uri.startsWith('mongodb://')) {
    return errorHandler.err(createInvalidLocalUriError());
  }

  if (uri.includes('+srv')) {
    return errorHandler.err(createInvalidLocalSrvUriError());
  }

  return errorHandler.ok(uri);
}

function validateAtlasUri(uri: string): Result<string, Error> {
  if (!uri.includes('mongodb+srv://')) {
    return errorHandler.err(createInvalidAtlasUriError());
  }

  return errorHandler.ok(uri);
}

function validateDbConfig(
  mode: DbMode,
  nodeEnv: string,
  allowedNodeEnvs: Set<string>,
  uri: string,
): Result<string, Error> {
  return validateAllowedNodeEnv(mode, nodeEnv, allowedNodeEnvs).andThen(() =>
    mode === 'local' ? validateLocalUri(uri) : validateAtlasUri(uri),
  );
}

export function validateDbConfigAsync(
  mode: DbMode,
  nodeEnv: string,
  allowedNodeEnvs: Set<string>,
  uri: string,
): AsyncResult<string, Error> {
  return errorHandler.fromResult(validateDbConfig(mode, nodeEnv, allowedNodeEnvs, uri));
}

export function validateAllowedNodeEnvAsync(
  mode: DbMode,
  nodeEnv: string,
  allowedNodeEnvs: Set<string>,
): AsyncResult<void, Error> {
  return errorHandler.fromResult(validateAllowedNodeEnv(mode, nodeEnv, allowedNodeEnvs));
}

export function validateLocalUriAsync(uri: string): AsyncResult<string, Error> {
  return errorHandler.fromResult(validateLocalUri(uri));
}

export function validateAtlasUriAsync(uri: string): AsyncResult<string, Error> {
  return errorHandler.fromResult(validateAtlasUri(uri));
}
