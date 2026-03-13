import { Controller, Get } from '@nestjs/common';

import { type ActorService } from '../actor.service.js';

@Controller('actors')
export class ActorController {
  public constructor(private readonly service: ActorService) {}

  @Get('health')
  public health(): { ok: true } {
    return this.service.health();
  }
}
