import { errorHandler, type Result } from '../error/index.js';
import { createInvalidDbModeError, createMissingDbModeError } from './mongodb.errors.js';

export type DbMode = 'inmemory' | 'local' | 'atlas';
export type RuntimePurpose = 'application' | 'seed';
export type RuntimeEnv = Record<string, string | undefined>;

export interface MongoEnvironmentConfig {
  configuredUri: string | undefined;
  mode: DbMode;
  nodeEnv: string;
  purpose: RuntimePurpose;
}

interface MongoEnvironmentCatalog {
  readonly defaultNodeEnv: string;
  readonly dbModes: {
    readonly inmemory: DbMode;
    readonly local: DbMode;
    readonly atlas: DbMode;
  };
  readonly runtimePurposes: {
    readonly application: RuntimePurpose;
    readonly seed: RuntimePurpose;
  };
}

export const MONGO_ENVIRONMENT: MongoEnvironmentCatalog = Object.freeze({
  defaultNodeEnv: 'development',
  dbModes: Object.freeze({
    inmemory: 'inmemory',
    local: 'local',
    atlas: 'atlas',
  }),
  runtimePurposes: Object.freeze({
    application: 'application',
    seed: 'seed',
  }),
});

class MongoEnvironmentVariables {
  public constructor(private readonly env: RuntimeEnv) {}

  private read(name: string): string | undefined {
    const value = this.env[name]?.trim();

    if (value === undefined || value === '') {
      return undefined;
    }

    return value;
  }

  private readLowercase(name: string): string | undefined {
    const value = this.read(name);

    if (value === undefined) {
      return undefined;
    }

    return value.toLowerCase();
  }

  public getNodeEnv(): string {
    return this.readLowercase('NODE_ENV') ?? MONGO_ENVIRONMENT.defaultNodeEnv;
  }

  public getDbModeRaw(): string | undefined {
    return this.readLowercase('DB_MODE');
  }

  public getConfiguredUri(): string | undefined {
    return this.read('MONGODB_URL') ?? this.read('DATABASE_URL');
  }
}

const createMongoEnvironmentVariables = (env: RuntimeEnv): MongoEnvironmentVariables =>
  new MongoEnvironmentVariables(env);

class MongoDbMode {
  public constructor(readonly value: DbMode) {}

  public static parse(rawMode: string | undefined): Result<MongoDbMode, Error> {
    if (rawMode === undefined) {
      return errorHandler.err(createMissingDbModeError());
    }

    if (rawMode === MONGO_ENVIRONMENT.dbModes.inmemory) {
      return errorHandler.ok(createMongoDbMode(MONGO_ENVIRONMENT.dbModes.inmemory));
    }

    if (rawMode === MONGO_ENVIRONMENT.dbModes.local) {
      return errorHandler.ok(createMongoDbMode(MONGO_ENVIRONMENT.dbModes.local));
    }

    if (rawMode === MONGO_ENVIRONMENT.dbModes.atlas) {
      return errorHandler.ok(createMongoDbMode(MONGO_ENVIRONMENT.dbModes.atlas));
    }

    return errorHandler.err(createInvalidDbModeError(rawMode));
  }

  public toValue(): DbMode {
    return this.value;
  }

  public isInMemory(): boolean {
    return this.value === MONGO_ENVIRONMENT.dbModes.inmemory;
  }

  public isLocal(): boolean {
    return this.value === MONGO_ENVIRONMENT.dbModes.local;
  }

  public isAtlas(): boolean {
    return this.value === MONGO_ENVIRONMENT.dbModes.atlas;
  }
}
const createMongoDbMode = (value: DbMode): MongoDbMode => new MongoDbMode(value);

interface ResolvedMongoEnvironmentParams {
  configuredUri: string | undefined;
  mode: DbMode;
  nodeEnv: string;
  purpose: RuntimePurpose;
}

class ResolvedMongoEnvironment implements MongoEnvironmentConfig {
  public readonly configuredUri: string | undefined;
  public readonly mode: DbMode;
  public readonly nodeEnv: string;
  public readonly purpose: RuntimePurpose;

  constructor(params: ResolvedMongoEnvironmentParams) {
    this.configuredUri = params.configuredUri;
    this.mode = params.mode;
    this.nodeEnv = params.nodeEnv;
    this.purpose = params.purpose;
  }
}

const createResolvedMongoEnvironment = (
  params: ResolvedMongoEnvironmentParams,
): ResolvedMongoEnvironment => new ResolvedMongoEnvironment(params);

class MongoEnvironmentResolver {
  public constructor(
    private readonly variables: MongoEnvironmentVariables,
    private readonly purpose: RuntimePurpose,
  ) {}

  public resolve(): Result<MongoEnvironmentConfig, Error> {
    const nodeEnv = this.variables.getNodeEnv();
    const configuredUri = this.variables.getConfiguredUri();

    return MongoDbMode.parse(this.variables.getDbModeRaw()).map((mode) =>
      createResolvedMongoEnvironment({
        configuredUri,
        mode: mode.toValue(),
        nodeEnv,
        purpose: this.purpose,
      }),
    );
  }
}

const createMongoEnvironmentResolver = (
  variables: MongoEnvironmentVariables,
  purpose: RuntimePurpose,
) => new MongoEnvironmentResolver(variables, purpose);

export function resolveMongoEnvironment(
  env: RuntimeEnv,
  purpose: RuntimePurpose = MONGO_ENVIRONMENT.runtimePurposes.application,
): Result<MongoEnvironmentConfig, Error> {
  const variables = createMongoEnvironmentVariables(env);
  const resolver = createMongoEnvironmentResolver(variables, purpose);

  return resolver.resolve();
}
