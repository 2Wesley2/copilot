import { Inject, Injectable } from '@nestjs/common';

import type { AsyncResult } from '../../error/index.js';
import type { Product } from './product.entity.js';
import { PRODUCT_REPOSITORY, type ProductRepository } from './product.repository.js';

@Injectable()
export class ProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly repository: ProductRepository,
  ) {}

  health(): { ok: true } {
    return { ok: true };
  }

  findById(productId: string): AsyncResult<Product | null, Error> {
    return this.repository.findById(productId);
  }

  save(product: Product): AsyncResult<void, Error> {
    return this.repository.save(product);
  }
}
