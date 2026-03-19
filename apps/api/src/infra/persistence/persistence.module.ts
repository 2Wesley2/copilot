import type { DynamicModule } from '@nestjs/common';

import { createError } from '../../error/error.factory.js';
import { type AsyncResult, errorHandler, type Result, toResultAsync } from '../../error/index.js';
import { createMongoMongoosePersistenceStrategy } from '../database/mongodb/mongodb.module.js';
import {
  type PersistenceProfile,
  type PersistenceRuntimeEnv,
  resolvePersistenceProfile,
} from './persistence.environment.js';

export interface PersistenceModuleStrategy {
  supports(profile: PersistenceProfile): boolean;
  createModuleResult(): AsyncResult<DynamicModule, Error>;
}

class PersistenceStrategyRegistry {
  private static instance: PersistenceStrategyRegistry | undefined;

  private readonly strategies: readonly PersistenceModuleStrategy[];

  private constructor() {
    this.strategies = [createMongoMongoosePersistenceStrategy()];
  }

  private static create(): PersistenceStrategyRegistry {
    return new PersistenceStrategyRegistry();
  }

  public static getInstance(): PersistenceStrategyRegistry {
    PersistenceStrategyRegistry.instance ??= PersistenceStrategyRegistry.create();

    return PersistenceStrategyRegistry.instance;
  }

  public resolve(profile: PersistenceProfile): Result<PersistenceModuleStrategy, Error> {
    for (const strategy of this.strategies) {
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
}

function getPersistenceStrategyRegistry(): PersistenceStrategyRegistry {
  return PersistenceStrategyRegistry.getInstance();
}

function resolvePersistenceStrategy(
  profile: PersistenceProfile,
): Result<PersistenceModuleStrategy, Error> {
  return getPersistenceStrategyRegistry().resolve(profile);
}

function resolvePersistenceDynamicModuleResult(
  env: PersistenceRuntimeEnv = process.env,
): AsyncResult<DynamicModule, Error> {
  const profileResult: Result<PersistenceProfile, Error> = resolvePersistenceProfile(env);

  return toResultAsync(profileResult).andThen((profile: PersistenceProfile) => {
    const strategyResult: Result<PersistenceModuleStrategy, Error> =
      resolvePersistenceStrategy(profile);

    return toResultAsync(strategyResult).andThen((strategy: PersistenceModuleStrategy) =>
      strategy.createModuleResult(),
    );
  });
}

export class PersistenceModule {
  public static registerResult(
    env: PersistenceRuntimeEnv = process.env,
  ): AsyncResult<DynamicModule, Error> {
    return resolvePersistenceDynamicModuleResult(env);
  }
}
