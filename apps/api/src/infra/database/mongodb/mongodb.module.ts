import {
  type DynamicModule,
  Global,
  Injectable,
  Logger,
  Module,
  type OnApplicationShutdown,
} from '@nestjs/common';
import { MongooseModule, type MongooseModuleOptions } from '@nestjs/mongoose';

import type { MongoDatabaseConfig } from './config/mongodb.config.js';
import { createMongoConnectionInfrastructure } from './connection/mongodb-connection.policy.js';
import { MONGO_READINESS_STORE } from './connection/mongodb-readiness.constants.js';
import { stopInMemoryMongoServer } from './inmemory/mongodb.inmemory.js';
import type { MongoRuntimeConfig } from './runtime/mongodb.runtime.js';

export const MONGO_DATABASE_CONFIG = Symbol('MONGO_DATABASE_CONFIG');
export const MONGO_RUNTIME_CONFIG = Symbol('MONGO_RUNTIME_CONFIG');

const mongoConnectionInfrastructure = createMongoConnectionInfrastructure();

function createMongoMongooseOptions(runtime: MongoRuntimeConfig): MongooseModuleOptions {
  return {
    uri: runtime.uri,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5_000,
    onConnectionCreate: (connection) => mongoConnectionInfrastructure.policy.apply(connection),
  };
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
export class MongoModule {
  public static register(params: {
    readonly databaseConfig: MongoDatabaseConfig;
    readonly runtimeConfig: MongoRuntimeConfig;
  }): DynamicModule {
    return {
      module: MongoModule,
      imports: [
        MongooseModule.forRootAsync({
          inject: [MONGO_RUNTIME_CONFIG],
          useFactory: (runtime: MongoRuntimeConfig) => createMongoMongooseOptions(runtime),
        }),
      ],
      providers: [
        MongoLifecycleService,
        {
          provide: MONGO_DATABASE_CONFIG,
          useValue: params.databaseConfig,
        },
        {
          provide: MONGO_RUNTIME_CONFIG,
          useValue: params.runtimeConfig,
        },
        {
          provide: MONGO_READINESS_STORE,
          useValue: mongoConnectionInfrastructure.readinessStore,
        },
      ],
      exports: [MONGO_DATABASE_CONFIG, MONGO_RUNTIME_CONFIG, MONGO_READINESS_STORE],
    };
  }
}
