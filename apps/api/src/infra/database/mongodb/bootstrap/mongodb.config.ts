import type { ConfigModuleOptions } from '@nestjs/config';
import type { MongooseModuleOptions } from '@nestjs/mongoose';

import type { AsyncResult, Result } from '../../../../error/index.js';
import { createMongoConnectionInfrastructure } from '../connection/mongodb-connection.policy.js';
import { createMongoEnvPolicy } from '../connection/mongodb-env.policy.js';
import {
  createMongoBootstrapFactory,
  type MongoNamespaceConfig,
} from './mongodb-bootstrap.factory.js';

const mongoConnectionInfrastructure = createMongoConnectionInfrastructure();

const mongoBootstrapFactory = createMongoBootstrapFactory(
  createMongoEnvPolicy(),
  mongoConnectionInfrastructure.policy,
);

export const mongoReadinessStore = mongoConnectionInfrastructure.readinessStore;

export type MongoConfig = MongoNamespaceConfig;

export function createMongoConfigModuleOptionsResult(): Result<ConfigModuleOptions, Error> {
  return mongoBootstrapFactory.createConfigModuleOptionsResult();
}

export function createMongoNamespaceConfigResult(
  predefinedEnv: NodeJS.ProcessEnv = process.env,
): Result<MongoNamespaceConfig, Error> {
  return mongoBootstrapFactory.createNamespaceConfigResult(predefinedEnv);
}

export function createMongoMongooseOptionsResult(
  config: MongoNamespaceConfig,
): AsyncResult<MongooseModuleOptions, Error> {
  return mongoBootstrapFactory.createMongooseOptionsResult(config);
}
