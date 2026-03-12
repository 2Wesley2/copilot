import { isNullish } from '@copilot/shared';
import { type DynamicModule, Global, Module } from '@nestjs/common';

import { createError } from '../error/error.factory.js';
import { errorHandler, type Result } from '../error/index.js';
import { createMongoMongoosePersistenceStrategy } from '../mongodb/mongodb.module.js';
import {
  type PersistenceProfile,
  type PersistenceRuntimeEnv,
  resolvePersistenceProfile,
} from './persistence.environment.js';

export interface PersistenceModuleStrategy {
  supports(profile: PersistenceProfile): boolean;
  createModule(): DynamicModule;
}

const persistenceStrategies: PersistenceModuleStrategy[] = [
  createMongoMongoosePersistenceStrategy(),
];

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

function resolvePersistenceDynamicModule(env: PersistenceRuntimeEnv = process.env): DynamicModule {
  return resolvePersistenceProfile(env)
    .andThen((profile) => resolvePersistenceStrategy(profile))
    .match(
      (strategy) => strategy.createModule(),
      (error) => {
        throw error;
      },
    );
}

type PersistenceStaticModuleMetadata = Parameters<typeof Module>[0];

function toPersistenceStaticModuleMetadata(
  dynamicModule: DynamicModule,
): PersistenceStaticModuleMetadata {
  const metadata: PersistenceStaticModuleMetadata = {};

  if (!isNullish(dynamicModule.controllers)) {
    metadata.controllers = dynamicModule.controllers;
  }

  if (!isNullish(dynamicModule.exports)) {
    metadata.exports = dynamicModule.exports;
  }

  if (!isNullish(dynamicModule.imports)) {
    metadata.imports = dynamicModule.imports;
  }

  if (!isNullish(dynamicModule.providers)) {
    metadata.providers = dynamicModule.providers;
  }

  return metadata;
}

export function PersistenceModuleDecorator(
  env: PersistenceRuntimeEnv = process.env,
): ClassDecorator {
  return (target) => {
    const dynamicModule = resolvePersistenceDynamicModule(env);

    if (dynamicModule.global === true) {
      Global()(target);
    }

    Module(toPersistenceStaticModuleMetadata(dynamicModule))(target);
  };
}

@PersistenceModuleDecorator()
export class PersistenceModule {
  static register(env: PersistenceRuntimeEnv = process.env): DynamicModule {
    return resolvePersistenceDynamicModule(env);
  }
}
