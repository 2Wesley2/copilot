import type { DynamicModule, OnApplicationShutdown } from '@nestjs/common';
import { Global, Injectable, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { PERSISTENCE, type PersistenceProfile } from '../persistence/persistence.environment.js';
import type { PersistenceModuleStrategy } from '../persistence/persistence.module.js';
import { stopInMemoryMongoServer } from './mongodb.inmemory.js';
import { resolveMongoRuntime } from './mongodb.runtime.js';
import { mongoModelDefinitions } from './mongoose.schemas.js';

@Injectable()
class MongoLifecycleService implements OnApplicationShutdown {
  async onApplicationShutdown(): Promise<void> {
    await stopInMemoryMongoServer().match(
      () => undefined,
      (error) => {
        throw error;
      },
    );
  }
}

@Global()
@Module({})
export class MongoPersistenceModule {
  static register(): DynamicModule {
    return {
      module: MongoPersistenceModule,
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
          inject: [ConfigService],
          useFactory: async (config: ConfigService) => {
            const runtime = await resolveMongoRuntime({
              DATABASE_URL: config.get<string>('DATABASE_URL'),
              DB_MODE: config.get<string>('DB_MODE'),
              MONGODB_URL: config.get<string>('MONGODB_URL'),
              NODE_ENV: config.get<string>('NODE_ENV'),
            }).match(
              (resolvedRuntime) => resolvedRuntime,
              (error) => {
                throw error;
              },
            );

            return { uri: runtime.uri };
          },
        }),
        MongooseModule.forFeature(mongoModelDefinitions),
      ],
      providers: [MongoLifecycleService],
      exports: [MongooseModule],
    };
  }
}

export class MongoMongoosePersistenceStrategy implements PersistenceModuleStrategy {
  public supports(profile: PersistenceProfile): boolean {
    return (
      profile.technology === PERSISTENCE.technologies.mongodb &&
      profile.mappingStyle === PERSISTENCE.mappingStyles.odm
    );
  }

  public createModule(): DynamicModule {
    return MongoPersistenceModule.register();
  }
}

export const createMongoMongoosePersistenceStrategy = () => new MongoMongoosePersistenceStrategy();
