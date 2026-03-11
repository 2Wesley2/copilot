import type { AsyncResult } from '../../error/index.js';
import type { Actor } from './actor.entity.js';

export const ACTOR_REPOSITORY = Symbol('ACTOR_REPOSITORY');

export interface ActorRepository {
  findByExternalId(externalId: string): AsyncResult<Actor | null, Error>;
  findById(actorId: string): AsyncResult<Actor | null, Error>;
}
