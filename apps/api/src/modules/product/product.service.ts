import { Inject, Injectable } from '@nestjs/common';

import type { AsyncResult } from '../../error/index.js';
import type { Product } from './product.entity.js';
import { PRODUCT_REPOSITORY, type ProductRepository } from './product.repository.js';

@Injectable()
export class ProductService {
  public constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly repository: ProductRepository,
  ) {}

  public health(): { ok: true } {
    return { ok: true };
  }

  public findById(productId: string): AsyncResult<Product | null, Error> {
    return this.repository.findById(productId);
  }

  public save(product: Product): AsyncResult<void, Error> {
    return this.repository.save(product);
  }
}
