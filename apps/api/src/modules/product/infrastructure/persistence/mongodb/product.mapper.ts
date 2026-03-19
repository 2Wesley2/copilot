import { isNullish } from '@copilot/shared';
import { Types } from 'mongoose';

import { createProduct, type Product } from '../../../domain/product.entity.js';

import type { ProductMongoDocument, ProductMongoPersistence } from './product.schema.js';

export class ProductMapper {
  public toDomain(document: ProductMongoDocument): Product {
    return createProduct({
      id: document._id.toHexString(),
      ...(isNullish(document.deletedAt) ? {} : { deletedAt: document.deletedAt }),
      ...(isNullish(document.description) ? {} : { description: document.description }),
      ...(isNullish(document.isCurrent) ? {} : { isCurrent: document.isCurrent }),
      ...(isNullish(document.lineageKey) ? {} : { lineageKey: document.lineageKey }),
      name: document.name,
      ...(isNullish(document.previousVersionId)
        ? {}
        : { previousVersionId: document.previousVersionId.toHexString() }),
      ...(isNullish(document.priceCents) ? {} : { priceCents: document.priceCents }),
      sku: document.sku,
      ...(isNullish(document.stock) ? {} : { stock: document.stock }),
      ...(isNullish(document.version) ? {} : { version: document.version }),
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }

  public toPersistence(product: Product): ProductMongoPersistence {
    return {
      _id: new Types.ObjectId(product.id),
      ...(isNullish(product.deletedAt) ? {} : { deletedAt: product.deletedAt }),
      ...(isNullish(product.description) ? {} : { description: product.description }),
      ...(isNullish(product.isCurrent) ? {} : { isCurrent: product.isCurrent }),
      ...(isNullish(product.lineageKey) ? {} : { lineageKey: product.lineageKey }),
      name: product.name,
      ...(isNullish(product.previousVersionId)
        ? {}
        : { previousVersionId: new Types.ObjectId(product.previousVersionId) }),
      ...(isNullish(product.priceCents) ? {} : { priceCents: product.priceCents }),
      sku: product.sku,
      ...(isNullish(product.stock) ? {} : { stock: product.stock }),
      ...(isNullish(product.version) ? {} : { version: product.version }),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
