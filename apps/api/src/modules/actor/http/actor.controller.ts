import { Controller, Get } from '@nestjs/common';

import { type ActorService } from '../actor.service.js';

@Controller('actors')
export class ActorController {
  constructor(private readonly service: ActorService) {}

  @Get('health')
  health(): { ok: true } {
    return this.service.health();
  }
}
