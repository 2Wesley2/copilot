import { Controller, Get } from '@nestjs/common';

import { ProductService } from '../../application/product.service.js';

@Controller('products')
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @Get('health')
  public health(): { ok: true } {
    return this.service.health();
  }
}
