import {
  type AsyncResult,
  createError,
  errorHandler,
  type Result,
} from '../../../../error/index.js';
import type { MongoDatabaseConfig } from '../config/mongodb.config.js';
import { resolveMongoDatabaseConfig } from '../config/mongodb.config.js';
import { getMemoryServer } from '../inmemory/mongodb.inmemory.js';
import type { DbMode, RuntimeEnv, RuntimePurpose } from '../mongodb.types.js';
import {
  createDisallowedNodeEnvError,
  createInMemorySeedError,
  createInvalidAtlasUriError,
  createInvalidLocalSrvUriError,
  createInvalidLocalUriError,
  createMissingConfiguredUriError,
} from './mongodb.errors.js';

const MONGO_RUNTIME_PURPOSES = Object.freeze({
  application: 'application' as const,
  seed: 'seed' as const,
});

const MONGO_RUNTIME_NODE_ENVS = Object.freeze({
  atlas: new Set<string>(['production']),
  local: new Set<string>(['development']),
  inmemory: new Set<string>(['development', 'test']),
});

export interface MongoRuntimeConfig {
  readonly mode: DbMode;
  readonly nodeEnv: string;
  readonly uri: string;
}

interface MongoRuntimeContext {
  readonly mode: DbMode;
  readonly configuredUri: string | undefined;
  readonly nodeEnv: string;
  readonly purpose: RuntimePurpose;
}

interface MongoModeStrategy {
  supports(context: MongoRuntimeContext): boolean;
  resolveUri(context: MongoRuntimeContext): AsyncResult<string, Error>;
}

function validateAllowedNodeEnv(
  mode: DbMode,
  nodeEnv: string,
  allowedNodeEnvs: ReadonlySet<string>,
): Result<void, Error> {
  if (!allowedNodeEnvs.has(nodeEnv)) {
    return errorHandler.err(createDisallowedNodeEnvError(mode, nodeEnv));
  }

  return errorHandler.ok(undefined);
}

function validateAllowedNodeEnvAsync(
  mode: DbMode,
  nodeEnv: string,
  allowedNodeEnvs: ReadonlySet<string>,
): AsyncResult<void, Error> {
  return errorHandler.fromResult(validateAllowedNodeEnv(mode, nodeEnv, allowedNodeEnvs));
}

function requireConfiguredUri(
  mode: DbMode,
  configuredUri: string | undefined,
): Result<string, Error> {
  if (configuredUri === undefined || configuredUri === '') {
    return errorHandler.err(createMissingConfiguredUriError(mode));
  }

  return errorHandler.ok(configuredUri);
}

function requireConfiguredUriAsync(
  mode: DbMode,
  configuredUri: string | undefined,
): AsyncResult<string, Error> {
  return errorHandler.fromResult(requireConfiguredUri(mode, configuredUri));
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

function validateLocalUriAsync(uri: string): AsyncResult<string, Error> {
  return errorHandler.fromResult(validateLocalUri(uri));
}

function validateAtlasUri(uri: string): Result<string, Error> {
  if (!uri.startsWith('mongodb+srv://')) {
    return errorHandler.err(createInvalidAtlasUriError());
  }

  return errorHandler.ok(uri);
}

function validateAtlasUriAsync(uri: string): AsyncResult<string, Error> {
  return errorHandler.fromResult(validateAtlasUri(uri));
}

abstract class BaseMongoModeStrategy implements MongoModeStrategy {
  public constructor(
    private readonly supportedMode: DbMode,
    private readonly allowedNodeEnvs: ReadonlySet<string>,
  ) {}

  public supports(context: MongoRuntimeContext): boolean {
    return context.mode === this.supportedMode;
  }

  protected ensureAllowedNodeEnv(nodeEnv: string): AsyncResult<void, Error> {
    return validateAllowedNodeEnvAsync(this.supportedMode, nodeEnv, this.allowedNodeEnvs);
  }

  protected getRequiredUri(configuredUri: string | undefined): AsyncResult<string, Error> {
    return requireConfiguredUriAsync(this.supportedMode, configuredUri);
  }

  public abstract resolveUri(context: MongoRuntimeContext): AsyncResult<string, Error>;
}

class InMemoryMongoModeStrategy extends BaseMongoModeStrategy {
  public constructor() {
    super('inmemory', MONGO_RUNTIME_NODE_ENVS.inmemory);
  }

  public resolveUri(context: MongoRuntimeContext): AsyncResult<string, Error> {
    return this.ensureAllowedNodeEnv(context.nodeEnv)
      .andThen(() =>
        context.purpose === MONGO_RUNTIME_PURPOSES.application
          ? errorHandler.okAsync(undefined)
          : errorHandler.errAsync(createInMemorySeedError()),
      )
      .andThen(() => getMemoryServer())
      .map((memoryServer) => memoryServer.getUri());
  }
}

class LocalMongoModeStrategy extends BaseMongoModeStrategy {
  public constructor() {
    super('local', MONGO_RUNTIME_NODE_ENVS.local);
  }

  public resolveUri(context: MongoRuntimeContext): AsyncResult<string, Error> {
    return this.ensureAllowedNodeEnv(context.nodeEnv)
      .andThen(() => this.getRequiredUri(context.configuredUri))
      .andThen((configuredUri) => validateLocalUriAsync(configuredUri));
  }
}

class AtlasMongoModeStrategy extends BaseMongoModeStrategy {
  public constructor() {
    super('atlas', MONGO_RUNTIME_NODE_ENVS.atlas);
  }

  public resolveUri(context: MongoRuntimeContext): AsyncResult<string, Error> {
    return this.ensureAllowedNodeEnv(context.nodeEnv)
      .andThen(() => this.getRequiredUri(context.configuredUri))
      .andThen((configuredUri) => validateAtlasUriAsync(configuredUri));
  }
}

const createAtlasMongoModeStrategy = (): MongoModeStrategy => new AtlasMongoModeStrategy();
const createInMemoryMongoModeStrategy = (): MongoModeStrategy => new InMemoryMongoModeStrategy();
const createLocalMongoModeStrategy = (): MongoModeStrategy => new LocalMongoModeStrategy();

class MongoRuntimeStrategyRegistry {
  private static instance: MongoRuntimeStrategyRegistry | undefined;

  private readonly strategies: readonly MongoModeStrategy[];

  private constructor(strategies: readonly MongoModeStrategy[]) {
    this.strategies = strategies;
  }

  private static createMongoRuntimeStrategyRegistry(): MongoRuntimeStrategyRegistry {
    return new MongoRuntimeStrategyRegistry([
      createAtlasMongoModeStrategy(),
      createInMemoryMongoModeStrategy(),
      createLocalMongoModeStrategy(),
    ]);
  }

  public static getInstance(): MongoRuntimeStrategyRegistry {
    MongoRuntimeStrategyRegistry.instance ??=
      MongoRuntimeStrategyRegistry.createMongoRuntimeStrategyRegistry();

    return MongoRuntimeStrategyRegistry.instance;
  }

  public resolveStrategy(context: MongoRuntimeContext): Result<MongoModeStrategy, Error> {
    const strategy = this.strategies.find((candidate) => candidate.supports(context));

    if (strategy) {
      return errorHandler.ok(strategy);
    }

    return errorHandler.err(
      createError(`Mongo runtime strategy not found for mode: ${context.mode}`),
    );
  }
}

function getMongoRuntimeStrategyRegistry(): MongoRuntimeStrategyRegistry {
  return MongoRuntimeStrategyRegistry.getInstance();
}

function createMongoRuntimeContext(
  databaseConfig: MongoDatabaseConfig,
  purpose: RuntimePurpose,
): MongoRuntimeContext {
  return {
    mode: databaseConfig.mode,
    configuredUri: databaseConfig.configuredUri,
    nodeEnv: databaseConfig.nodeEnv,
    purpose,
  };
}

export function resolveMongoRuntimeFromConfig(
  databaseConfig: MongoDatabaseConfig,
  purpose: RuntimePurpose = 'application',
): AsyncResult<MongoRuntimeConfig, Error> {
  const strategyRegistry = getMongoRuntimeStrategyRegistry();
  const context = createMongoRuntimeContext(databaseConfig, purpose);

  return errorHandler.fromResult(strategyRegistry.resolveStrategy(context)).andThen((strategy) =>
    strategy.resolveUri(context).map((uri) => ({
      mode: context.mode,
      nodeEnv: context.nodeEnv,
      uri,
    })),
  );
}

export function resolveMongoRuntime(
  env: RuntimeEnv,
  purpose: RuntimePurpose = 'application',
): AsyncResult<MongoRuntimeConfig, Error> {
  return errorHandler
    .fromResult(resolveMongoDatabaseConfig(env))
    .andThen((databaseConfig) => resolveMongoRuntimeFromConfig(databaseConfig, purpose));
}
