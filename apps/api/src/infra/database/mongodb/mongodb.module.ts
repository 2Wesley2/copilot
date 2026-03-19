import { isNullish } from '@copilot/shared';
import type { DynamicModule, OnApplicationShutdown } from '@nestjs/common';
import { Global, Injectable, Logger, Module } from '@nestjs/common';
import type { ConfigModuleOptions } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule, type MongooseModuleOptions } from '@nestjs/mongoose';

import { createError } from '../../../../error/error.factory.js';
import {
  type AsyncResult,
  errorHandler,
  type Result,
  toResultAsync,
} from '../../../../error/index.js';
import {
  PERSISTENCE,
  type PersistenceProfile,
} from '../../../persistence/persistence.environment.js';
import type { PersistenceModuleStrategy } from '../../../persistence/persistence.module.js';
import { MONGO_READINESS_STORE } from '../connection/mongodb-readiness.constants.js';
import { stopInMemoryMongoServer } from '../inmemory/mongodb.inmemory.js';
import { mongoSchemaDefinitions } from '../mongoose/mongoose.schemas.js';
import {
  createMongoConfigModuleOptionsResult,
  createMongoMongooseOptionsResult,
  createMongoNamespaceConfigResult,
  type MongoConfig,
  mongoReadinessStore,
} from './mongodb.config.js';

interface ResolvedMongooseRootOptions {
  readonly uri: string;
  readonly connectionOptions: Omit<MongooseModuleOptions, 'uri'>;
}

function resolveMongooseRootOptions(
  mongooseOptions: MongooseModuleOptions,
): Result<ResolvedMongooseRootOptions, Error> {
  const uri = mongooseOptions.uri;

  if (isNullish(uri)) {
    return errorHandler.err(
      createError('MongoDB connection uri was not resolved for MongooseModule.forRoot.'),
    );
  }

  const { uri: _ignoredUri, ...connectionOptions } = mongooseOptions;

  return errorHandler.ok({
    uri,
    connectionOptions,
  });
}

@Injectable()
class MongoLifecycleService implements OnApplicationShutdown {
  private readonly logger = new Logger(MongoLifecycleService.name);

  public async onApplicationShutdown(): Promise<void> {
    await stopInMemoryMongoServer().match(
      () => undefined,
      (error) => {
        this.logger.error('Failed to stop in-memory Mongo server', error.stack);
      },
    );
  }
}

@Global()
@Module({})
export class MongoPersistenceModule {
  public static registerResult(): AsyncResult<DynamicModule, Error> {
    const configModuleOptionsResult: Result<ConfigModuleOptions, Error> =
      createMongoConfigModuleOptionsResult();

    return toResultAsync(configModuleOptionsResult).andThen(
      (configModuleOptions: ConfigModuleOptions) => {
        const namespaceConfigResult: Result<MongoConfig, Error> =
          createMongoNamespaceConfigResult();

        return toResultAsync(namespaceConfigResult).andThen((config: MongoConfig) =>
          createMongoMongooseOptionsResult(config).andThen(
            (mongooseOptions: MongooseModuleOptions) =>
              toResultAsync(resolveMongooseRootOptions(mongooseOptions)).map(
                ({ uri, connectionOptions }: ResolvedMongooseRootOptions) => ({
                  module: MongoPersistenceModule,
                  imports: [
                    ConfigModule.forRoot(configModuleOptions),
                    MongooseModule.forRoot(uri, connectionOptions),
                    MongooseModule.forFeature(mongoSchemaDefinitions),
                  ],
                  providers: [
                    MongoLifecycleService,
                    {
                      provide: MONGO_READINESS_STORE,
                      useValue: mongoReadinessStore,
                    },
                  ],
                  exports: [MongooseModule, MONGO_READINESS_STORE],
                }),
              ),
          ),
        );
      },
    );
  }
}

export function createMongoMongoosePersistenceStrategy(): PersistenceModuleStrategy {
  return {
    supports(profile: PersistenceProfile): boolean {
      return (
        profile.technology === PERSISTENCE.technologies.mongodb &&
        profile.mappingStyle === PERSISTENCE.mappingStyles.odm
      );
    },

    createModuleResult(): AsyncResult<DynamicModule, Error> {
      return MongoPersistenceModule.registerResult();
    },
  };
}
