import { type DynamicModule, Module } from '@nestjs/common';

import { createError } from '../error/error.factory.js';
import { errorHandler, type Result } from '../error/index.js';
import { MongoMongoosePersistenceStrategy } from '../mongodb/mongodb.module.js';
import {
  type PersistenceProfile,
  type PersistenceRuntimeEnv,
  resolvePersistenceProfile,
} from './persistence.environment.js';

export interface PersistenceModuleStrategy {
  supports(profile: PersistenceProfile): boolean;
  createModule(): DynamicModule;
}

const persistenceStrategies: PersistenceModuleStrategy[] = [new MongoMongoosePersistenceStrategy()];

function resolvePersistenceStrategy(
  profile: PersistenceProfile,
): Result<PersistenceModuleStrategy, Error> {
  for (const strategy of persistenceStrategies) {
    if (strategy.supports(profile)) {
      return errorHandler.ok(strategy);
    }
  }

  return errorHandler.err(
    createError(
      `Nenhuma estratégia de persistência encontrada para technology=${profile.technology} e mappingStyle=${profile.mappingStyle}.`,
    ),
  );
}

@Module({})
export class PersistenceModule {
  static register(env: PersistenceRuntimeEnv = process.env): DynamicModule {
    return resolvePersistenceProfile(env)
      .andThen((profile) => resolvePersistenceStrategy(profile))
      .match(
        (strategy) => strategy.createModule(),
        (error) => {
          throw error;
        },
      );
  }
}
