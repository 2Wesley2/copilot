import { Controller, Get } from '@nestjs/common';

import type { ProductService } from '../product.service.js';

@Controller('products')
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @Get()
  health(): { ok: true } {
    return this.service.health();
  }
}
