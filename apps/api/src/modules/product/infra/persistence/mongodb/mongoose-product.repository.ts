import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { type AsyncResult, errorHandler } from '../../../../../error/index.js';
import { MONGO_SCHEMAS } from '../../../../../mongodb/mongoose.schemas.js';
import type { Product } from '../../../product.entity.js';
import type { ProductRepository } from '../../../product.repository.js';
import {
  type MongooseProductDocument,
  type MongooseProductMapper,
  type MongooseProductPersistence,
} from './mongoose-product.mapper.js';

@Injectable()
export class MongooseProductRepositoryAdapter implements ProductRepository {
  public constructor(
    @InjectModel(MONGO_SCHEMAS.names.product)
    private readonly productModel: Model<MongooseProductPersistence>,
    private readonly productMapper: MongooseProductMapper,
  ) {}

  public findById(productId: string): AsyncResult<Product | null, Error> {
    return errorHandler.fromPromise(async () => {
      const document: MongooseProductDocument | null = await this.productModel
        .findById(productId)
        .exec();

      if (document === null) {
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
