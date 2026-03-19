import { Global, Injectable, Logger, Module, type OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, type MongooseModuleOptions } from '@nestjs/mongoose';

import { MONGO_READINESS_STORE } from './connection/mongodb-readiness.constants.js';
import { createMongoConnectionInfrastructure } from './connection/mongodb-connection.policy.js';
import type { MongoEnv } from './env/mongodb-env.schema.js';
import { stopInMemoryMongoServer } from './inmemory/mongodb.inmemory.js';
import { resolveMongoRuntime } from './runtime/mongodb.runtime.js';

const mongoConnectionInfrastructure = createMongoConnectionInfrastructure();

async function createMongoMongooseOptions(
  configService: ConfigService,
): Promise<MongooseModuleOptions> {
  const runtime = await resolveMongoRuntime({
    DATABASE_URL: configService.get<string>('DATABASE_URL'),
    DB_MODE: configService.get<MongoEnv['DB_MODE']>('DB_MODE'),
    MONGODB_URL: configService.get<string>('MONGODB_URL'),
    NODE_ENV: configService.get<MongoEnv['NODE_ENV']>('NODE_ENV'),
  }).match(
    (value) => Promise.resolve(value),
    (error) => Promise.reject(error),
  );

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
@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: createMongoMongooseOptions,
    }),
  ],
  providers: [
    MongoLifecycleService,
    {
      provide: MONGO_READINESS_STORE,
      useValue: mongoConnectionInfrastructure.readinessStore,
    },
  ],
  exports: [MONGO_READINESS_STORE],
})
export class MongoModule {}
