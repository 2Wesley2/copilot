import { isNullish } from '@copilot/shared';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { type AsyncResult, errorHandler } from '../../../../../error/index.js';
import type { Product } from '../../../domain/product.entity.js';
import type { ProductRepository } from '../../../domain/product.repository.js';
import { ProductMapper } from './product.mapper.js';
import {
  PRODUCT_MODEL_NAME,
  type ProductMongoDocument,
  type ProductMongoPersistence,
} from './product.schema.js';

@Injectable()
export class ProductMongooseRepository implements ProductRepository {
  public constructor(
    @InjectModel(PRODUCT_MODEL_NAME)
    private readonly productModel: Model<ProductMongoPersistence>,
    private readonly productMapper: ProductMapper,
  ) {}

  public findById(productId: string): AsyncResult<Product | null, Error> {
    return errorHandler.fromPromise(async () => {
      const document: ProductMongoDocument | null = await this.productModel
        .findById(productId)
        .exec();

      if (isNullish(document)) {
        return null;
      }

      return this.productMapper.toDomain(document);
    });
  }

  public save(product: Product): AsyncResult<void, Error> {
    return errorHandler.fromPromise(async () => {
      const persistence = this.productMapper.toPersistence(product);

      await this.productModel
        .findOneAndUpdate({ _id: persistence._id }, persistence, {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        })
        .exec();
    });
  }
}
