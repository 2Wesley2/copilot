import type { AsyncResult } from '../../../error/index.js';
import type { Product } from './product.entity.js';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface ProductRepository {
  findById(productId: string): AsyncResult<Product | null, Error>;
  save(product: Product): AsyncResult<void, Error>;
}
