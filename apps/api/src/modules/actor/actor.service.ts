import { Inject, Injectable } from '@nestjs/common';

import type { AsyncResult } from '../../error/index.js';
import type { Actor } from './actor.entity.js';
import { ACTOR_REPOSITORY, type ActorRepository } from './actor.repository.js';

@Injectable()
export class ActorService {
  constructor(
    @Inject(ACTOR_REPOSITORY)
    private readonly repository: ActorRepository,
  ) {}

  public health(): { ok: true } {
    return { ok: true };
  }

  public findById(actorId: string): AsyncResult<Actor | null, Error> {
    return this.repository.findById(actorId);
  }

  public findByExternalId(externalId: string): AsyncResult<Actor | null, Error> {
    return this.repository.findByExternalId(externalId);
  }
}
