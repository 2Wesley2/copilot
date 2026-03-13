import { type AsyncResult, errorHandler } from '../error/index.js';
import {
  type DbMode,
  MONGO_ENVIRONMENT,
  resolveMongoEnvironment,
  type RuntimeEnv,
  type RuntimePurpose,
} from './mongodb.environment.js';
import { createInMemorySeedError } from './mongodb.errors.js';
import { getMemoryServer } from './mongodb.inmemory.js';
import {
  requireConfiguredUriAsync,
  validateAllowedNodeEnvAsync,
  validateAtlasUriAsync,
  validateLocalUriAsync,
} from './mongodb.validators.js';

const MONGO_RUNTIME_NODE_ENVS = Object.freeze({
  atlas: new Set<string>(['production', 'staging']),
  localLike: new Set<string>(['development', 'test']),
});

export interface MongoRuntimeConfig {
  mode: DbMode;
  nodeEnv: string;
  uri: string;
}

interface MongoRuntimeContext {
  configuredUri: string | undefined;
  nodeEnv: string;
  purpose: RuntimePurpose;
}

interface MongoModeStrategy {
  readonly mode: DbMode;
  resolveUri(context: MongoRuntimeContext): AsyncResult<string, Error>;
}

abstract class BaseMongoModeStrategy implements MongoModeStrategy {
  public constructor(
    public readonly mode: DbMode,
    private readonly allowedNodeEnvs: Set<string>,
  ) {}

  protected ensureAllowedNodeEnv(nodeEnv: string): AsyncResult<void, Error> {
    return validateAllowedNodeEnvAsync(this.mode, nodeEnv, this.allowedNodeEnvs);
  }

  protected getRequiredUri(configuredUri: string | undefined): AsyncResult<string, Error> {
    return requireConfiguredUriAsync(this.mode, configuredUri);
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

  private readonly strategies: Record<DbMode, MongoModeStrategy>;

  private constructor() {
    this.strategies = {
      atlas: createAtlasMongoModeStrategy(),
      inmemory: createInMemoryMongoModeStrategy(),
      local: createLocalMongoModeStrategy(),
    };
  }
  private static createMongoRuntimeStrategyRegistry() {
    return new MongoRuntimeStrategyRegistry();
  }

  public static getInstance(): MongoRuntimeStrategyRegistry {
    MongoRuntimeStrategyRegistry.instance ??=
      MongoRuntimeStrategyRegistry.createMongoRuntimeStrategyRegistry();
    return MongoRuntimeStrategyRegistry.instance;
  }

  public getStrategy(mode: DbMode): MongoModeStrategy {
    return this.strategies[mode];
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
    const { configuredUri, mode, nodeEnv } = environment;
    const strategy = strategyRegistry.getStrategy(mode);

    const context: MongoRuntimeContext = {
      configuredUri,
      nodeEnv,
      purpose: environment.purpose,
    };

    return strategy.resolveUri(context).map((uri) => ({
      mode,
      nodeEnv,
      uri,
    }));
  });
}
