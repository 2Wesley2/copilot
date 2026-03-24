import { createError } from '../../../../error/error.factory.js';
import type { DbMode } from '../mongodb.types.js';

const MISSING_DB_MODE_ERROR = 'DB_MODE é obrigatório e deve ser um de: inmemory, local, atlas.';
const INMEMORY_SEED_ERROR =
  'DB_MODE=inmemory só pode ser usado no ciclo da aplicação em development/test. Não use seed standalone com banco efêmero.';
const INVALID_LOCAL_URI_ERROR = 'DB_MODE=local exige uma URI Mongo local iniciando com mongodb://.';
const INVALID_LOCAL_SRV_URI_ERROR =
  'DB_MODE=local não aceita URI SRV. Use mongodb:// para instâncias locais.';
const INVALID_ATLAS_URI_ERROR = 'DB_MODE=atlas exige uma URI SRV iniciando com mongodb+srv://.';

export function createMissingDbModeError(): Error {
  return createError(MISSING_DB_MODE_ERROR);
}

export function createInvalidDbModeError(mode: string): Error {
  return createError(`DB_MODE inválido: "${mode}". Valores aceitos: inmemory, local, atlas.`);
}

export function createDisallowedNodeEnvError(mode: DbMode, nodeEnv: string): Error {
  return createError(`DB_MODE=${mode} não pode ser usado com NODE_ENV=${nodeEnv}.`);
}

export function createInvalidLocalUriError(): Error {
  return createError(INVALID_LOCAL_URI_ERROR);
}

export function createInvalidLocalSrvUriError(): Error {
  return createError(INVALID_LOCAL_SRV_URI_ERROR);
}

export function createInvalidAtlasUriError(): Error {
  return createError(INVALID_ATLAS_URI_ERROR);
}

export function createMissingConfiguredUriError(mode: DbMode): Error {
  return createError(`DB_MODE=${mode} exige MONGODB_URL ou DATABASE_URL configurada.`);
}

export function createInMemorySeedError(): Error {
  return createError(INMEMORY_SEED_ERROR);
}
