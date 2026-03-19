import { type ConfigModuleOptions } from '@nestjs/config';
import type { MongooseModuleOptions } from '@nestjs/mongoose';

import { type AsyncResult, errorHandler, type Result } from '../../../../error/index.js';
import type { MongoConnectionPolicy } from '../connection/mongodb-connection.policy.js';
import type { MongoEnvPolicy } from '../connection/mongodb-env.policy.js';
import { type MongoEnv, validateMongoEnv } from '../env/mongodb-env.schema.js';
import { resolveMongoRuntime } from '../runtime/mongodb.runtime.js';

export interface MongoEnvConfig {
  readonly databaseUrl: string | undefined;
  readonly dbMode: MongoEnv['DB_MODE'];
  readonly mongodbUrl: string | undefined;
  readonly nodeEnv: MongoEnv['NODE_ENV'];
}

export interface MongoConnectionConfig {
  readonly maxPoolSize: number;
  readonly serverSelectionTimeoutMS: number;
}

export interface MongoNamespaceConfig {
  readonly env: MongoEnvConfig;
  readonly connection: MongoConnectionConfig;
}

export interface MongoRuntimeConfig {
  readonly uri: string;
}

export class MongoBootstrapFactory {
  private validatedEnvCache: MongoEnv | undefined;

  public constructor(
    private readonly envPolicy: MongoEnvPolicy,
    private readonly connectionPolicy: MongoConnectionPolicy,
  ) {}

  public createConfigModuleOptionsResult(): Result<ConfigModuleOptions, Error> {
    return this.envPolicy.resolve().map(() => ({
      isGlobal: true,
      cache: true,
      ignoreEnvFile: true,
      expandVariables: true,
    }));
  }

  public createNamespaceConfigResult(
    predefinedEnv: NodeJS.ProcessEnv = process.env,
  ): Result<MongoNamespaceConfig, Error> {
    return this.createEnvConfigResult(predefinedEnv).map((env) => ({
      env,
      connection: this.createConnectionConfig(),
    }));
  }

  public createRuntimeConfigResult(
    config: MongoNamespaceConfig,
  ): AsyncResult<MongoRuntimeConfig, Error> {
    return resolveMongoRuntime({
      DATABASE_URL: config.env.databaseUrl,
      DB_MODE: config.env.dbMode,
      MONGODB_URL: config.env.mongodbUrl,
      NODE_ENV: config.env.nodeEnv,
    }).map((runtime) => ({
      uri: runtime.uri,
    }));
  }

  public createMongooseOptionsResult(
    config: MongoNamespaceConfig,
  ): AsyncResult<MongooseModuleOptions, Error> {
    return this.createRuntimeConfigResult(config).map((runtime) => ({
      uri: runtime.uri,
      maxPoolSize: config.connection.maxPoolSize,
      serverSelectionTimeoutMS: config.connection.serverSelectionTimeoutMS,
      onConnectionCreate: (connection) => this.connectionPolicy.apply(connection),
    }));
  }

  private createEnvConfigResult(
    predefinedEnv: NodeJS.ProcessEnv = process.env,
  ): Result<MongoEnvConfig, Error> {
    return this.getValidatedEnvResult(predefinedEnv).map((env) => ({
      databaseUrl: env.DATABASE_URL,
      dbMode: env.DB_MODE,
      mongodbUrl: env.MONGODB_URL,
      nodeEnv: env.NODE_ENV,
    }));
  }

  private createConnectionConfig(): MongoConnectionConfig {
    return {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5_000,
    };
  }

  private getValidatedEnvResult(
    predefinedEnv: NodeJS.ProcessEnv = process.env,
  ): Result<MongoEnv, Error> {
    if (this.validatedEnvCache !== undefined) {
      return errorHandler.ok(this.validatedEnvCache);
    }

    try {
      const validatedEnv = validateMongoEnv(predefinedEnv);

      this.validatedEnvCache = validatedEnv;

      return errorHandler.ok(validatedEnv);
    } catch (cause: unknown) {
      return errorHandler.err(errorHandler.normalize(cause));
    }
  }
}

export const createMongoBootstrapFactory = (
  envPolicy: MongoEnvPolicy,
  connectionPolicy: MongoConnectionPolicy,
) => new MongoBootstrapFactory(envPolicy, connectionPolicy);
