import {
  type AsyncResult,
  createError,
  errorHandler,
  type Result,
} from '../../../../error/index.js';
import {
  type DbMode,
  MONGO_ENVIRONMENT,
  resolveMongoEnvironment,
  type RuntimeEnv,
  type RuntimePurpose,
} from '../env/mongodb.environment.js';
import { getMemoryServer } from '../inmemory/mongodb.inmemory.js';
import { createInMemorySeedError } from './mongodb.errors.js';
import {
  requireConfiguredUriAsync,
  validateAllowedNodeEnvAsync,
  validateAtlasUriAsync,
  validateLocalUriAsync,
} from './mongodb.validators.js';

const MONGO_RUNTIME_NODE_ENVS = Object.freeze({
  atlas: new Set<string>(['production']),
  localLike: new Set<string>(['development', 'test']),
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

abstract class BaseMongoModeStrategy implements MongoModeStrategy {
  public constructor(
    private readonly supportedMode: DbMode,
    private readonly allowedNodeEnvs: Set<string>,
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
    super(MONGO_ENVIRONMENT.dbModes.inmemory, MONGO_RUNTIME_NODE_ENVS.localLike);
  }

  public resolveUri(context: MongoRuntimeContext): AsyncResult<string, Error> {
    return this.ensureAllowedNodeEnv(context.nodeEnv)
      .andThen(() =>
        context.purpose === MONGO_ENVIRONMENT.runtimePurposes.application
          ? errorHandler.okAsync(undefined)
          : errorHandler.errAsync(createInMemorySeedError()),
      )
      .andThen(() => getMemoryServer())
      .map((memoryServer) => memoryServer.getUri());
  }
}

class LocalMongoModeStrategy extends BaseMongoModeStrategy {
  public constructor() {
    super(MONGO_ENVIRONMENT.dbModes.local, MONGO_RUNTIME_NODE_ENVS.localLike);
  }

  public resolveUri(context: MongoRuntimeContext): AsyncResult<string, Error> {
    return this.ensureAllowedNodeEnv(context.nodeEnv)
      .andThen(() => this.getRequiredUri(context.configuredUri))
      .andThen((configuredUri) => validateLocalUriAsync(configuredUri));
  }
}

class AtlasMongoModeStrategy extends BaseMongoModeStrategy {
  public constructor() {
    super(MONGO_ENVIRONMENT.dbModes.atlas, MONGO_RUNTIME_NODE_ENVS.atlas);
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

    return errorHandler.err<MongoModeStrategy, Error>(
      createError(`Mongo runtime strategy not found for mode: ${context.mode}`),
    );
  }
}

function getMongoRuntimeStrategyRegistry(): MongoRuntimeStrategyRegistry {
  return MongoRuntimeStrategyRegistry.getInstance();
}

export function resolveMongoRuntime(
  env: RuntimeEnv,
  purpose: RuntimePurpose = MONGO_ENVIRONMENT.runtimePurposes.application,
): AsyncResult<MongoRuntimeConfig, Error> {
  const strategyRegistry = getMongoRuntimeStrategyRegistry();

  return errorHandler.fromResult(resolveMongoEnvironment(env, purpose)).andThen((environment) => {
    const context: MongoRuntimeContext = {
      mode: environment.mode,
      configuredUri: environment.configuredUri,
      nodeEnv: environment.nodeEnv,
      purpose: environment.purpose,
    };

    return errorHandler.fromResult(strategyRegistry.resolveStrategy(context)).andThen((strategy) =>
      strategy.resolveUri(context).map((uri) => ({
        mode: environment.mode,
        nodeEnv: environment.nodeEnv,
        uri,
      })),
    );
  });
}
