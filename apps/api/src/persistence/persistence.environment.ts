import { createError } from '../error/error.factory.js';
import { errorHandler, type Result } from '../error/index.js';

export type PersistenceTechnology = 'mongodb' | 'postgresql' | 'mysql' | 'sqlite';
export type PersistenceMappingStyle = 'odm' | 'orm';
export type PersistenceRuntimeEnv = Record<string, string | undefined>;
export interface PersistenceProfile {
  readonly technology: PersistenceTechnology;
  readonly mappingStyle: PersistenceMappingStyle;
}
interface PersistenceCatalog {
  readonly technologies: {
    readonly mongodb: PersistenceTechnology;
    readonly postgresql: PersistenceTechnology;
    readonly mysql: PersistenceTechnology;
    readonly sqlite: PersistenceTechnology;
  };
  readonly mappingStyles: {
    readonly odm: PersistenceMappingStyle;
    readonly orm: PersistenceMappingStyle;
  };
  readonly defaultProfile: PersistenceProfile;
}
export const PERSISTENCE: PersistenceCatalog = Object.freeze({
  technologies: Object.freeze({
    mongodb: 'mongodb',
    mysql: 'mysql',
    postgresql: 'postgresql',
    sqlite: 'sqlite',
  }),
  mappingStyles: Object.freeze({ odm: 'odm', orm: 'orm' }),
  defaultProfile: Object.freeze({ technology: 'mongodb', mappingStyle: 'odm' }),
});
interface EnvironmentValueReaderParams {
  readonly env: PersistenceRuntimeEnv;
}
class EnvironmentValueReader {
  constructor(private readonly params: EnvironmentValueReaderParams) {}
  readLowercase(key: string): string | undefined {
    const value = this.params.env[key]?.trim().toLowerCase();
    if (value === undefined || value === '') {
      return undefined;
    }
    return value;
  }
}
export interface EnvironmentOptionStrategy<TValue extends string> {
  readonly value: TValue;
  matches(rawValue: string): boolean;
}
interface ExactMatchEnvironmentOptionStrategyParams<TValue extends string> {
  readonly value: TValue;
}
class ExactMatchEnvironmentOptionStrategy<
  TValue extends string,
> implements EnvironmentOptionStrategy<TValue> {
  public readonly value: TValue;
  constructor(params: ExactMatchEnvironmentOptionStrategyParams<TValue>) {
    this.value = params.value;
  }
  matches(rawValue: string): boolean {
    return rawValue === this.value;
  }
}
interface EnvironmentOptionRegistryParams<TValue extends string> {
  readonly strategies: EnvironmentOptionStrategy<TValue>[];
}
class EnvironmentOptionRegistry<TValue extends string> {
  constructor(private readonly params: EnvironmentOptionRegistryParams<TValue>) {}
  resolve(rawValue: string): Result<TValue, Error> {
    for (const strategy of this.params.strategies) {
      if (strategy.matches(rawValue)) {
        return errorHandler.ok(strategy.value);
      }
    }
    return errorHandler.err(this.createInvalidValueError(rawValue));
  }
  private createInvalidValueError(rawValue: string): Error {
    return createError(
      `Valor inválido: "${rawValue}". Valores aceitos: ${this.getAllowedValuesLabel()}.`,
    );
  }
  private getAllowedValuesLabel(): string {
    return this.params.strategies.map((strategy) => strategy.value).join(', ');
  }
}
interface EnvironmentOptionResolverParams<TValue extends string> {
  readonly defaultValue: TValue;
  readonly errorLabel: string;
  readonly key: string;
  readonly reader: EnvironmentValueReader;
  readonly registry: EnvironmentOptionRegistry<TValue>;
}
class EnvironmentOptionResolver<TValue extends string> {
  constructor(private readonly params: EnvironmentOptionResolverParams<TValue>) {}
  resolve(): Result<TValue, Error> {
    const rawValue = this.params.reader.readLowercase(this.params.key);
    if (rawValue === undefined) {
      return errorHandler.ok(this.params.defaultValue);
    }
    return this.params.registry.resolve(rawValue).mapErr((error) => {
      return createError(`${this.params.errorLabel} inválido. ${error.message}`);
    });
  }
}
interface PersistenceProfileResolverParams {
  readonly mappingStyleResolver: EnvironmentOptionResolver<PersistenceMappingStyle>;
  readonly technologyResolver: EnvironmentOptionResolver<PersistenceTechnology>;
}
class PersistenceProfileResolver {
  constructor(private readonly params: PersistenceProfileResolverParams) {}
  resolve(): Result<PersistenceProfile, Error> {
    return this.params.technologyResolver
      .resolve()
      .andThen((technology) =>
        this.params.mappingStyleResolver
          .resolve()
          .map((mappingStyle) => ({ technology, mappingStyle })),
      );
  }
}
class PersistenceEnvironmentFactory {
  createProfileResolver(env: PersistenceRuntimeEnv): PersistenceProfileResolver {
    const reader = this.createEnvironmentValueReader(env);
    return new PersistenceProfileResolver({
      mappingStyleResolver: this.createMappingStyleResolver(reader),
      technologyResolver: this.createTechnologyResolver(reader),
    });
  }
  private createEnvironmentValueReader(env: PersistenceRuntimeEnv): EnvironmentValueReader {
    return new EnvironmentValueReader({ env });
  }
  private createTechnologyResolver(
    reader: EnvironmentValueReader,
  ): EnvironmentOptionResolver<PersistenceTechnology> {
    return new EnvironmentOptionResolver<PersistenceTechnology>({
      defaultValue: PERSISTENCE.defaultProfile.technology,
      errorLabel: 'DATABASE_TECHNOLOGY',
      key: 'DATABASE_TECHNOLOGY',
      reader,
      registry: this.createTechnologyRegistry(),
    });
  }
  private createMappingStyleResolver(
    reader: EnvironmentValueReader,
  ): EnvironmentOptionResolver<PersistenceMappingStyle> {
    return new EnvironmentOptionResolver<PersistenceMappingStyle>({
      defaultValue: PERSISTENCE.defaultProfile.mappingStyle,
      errorLabel: 'DATABASE_MAPPING_STYLE',
      key: 'DATABASE_MAPPING_STYLE',
      reader,
      registry: this.createMappingStyleRegistry(),
    });
  }
  private createTechnologyRegistry(): EnvironmentOptionRegistry<PersistenceTechnology> {
    return new EnvironmentOptionRegistry<PersistenceTechnology>({
      strategies: [
        this.createExactMatchStrategy(PERSISTENCE.technologies.mongodb),
        this.createExactMatchStrategy(PERSISTENCE.technologies.postgresql),
        this.createExactMatchStrategy(PERSISTENCE.technologies.mysql),
        this.createExactMatchStrategy(PERSISTENCE.technologies.sqlite),
      ],
    });
  }
  private createMappingStyleRegistry(): EnvironmentOptionRegistry<PersistenceMappingStyle> {
    return new EnvironmentOptionRegistry<PersistenceMappingStyle>({
      strategies: [
        this.createExactMatchStrategy(PERSISTENCE.mappingStyles.odm),
        this.createExactMatchStrategy(PERSISTENCE.mappingStyles.orm),
      ],
    });
  }
  private createExactMatchStrategy<TValue extends string>(
    value: TValue,
  ): EnvironmentOptionStrategy<TValue> {
    return new ExactMatchEnvironmentOptionStrategy<TValue>({ value });
  }
}
const persistenceEnvironmentFactory = new PersistenceEnvironmentFactory();
export function resolvePersistenceProfile(
  env: PersistenceRuntimeEnv,
): Result<PersistenceProfile, Error> {
  return persistenceEnvironmentFactory.createProfileResolver(env).resolve();
}
