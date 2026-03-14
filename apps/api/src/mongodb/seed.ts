import 'dotenv/config';

import mongoose, { type Model } from 'mongoose';
import { isNullish } from '@copilot/shared';
import { type AsyncResult, createError, errorHandler, type Result } from '../error/index.js';
import { stopInMemoryMongoServer } from './mongodb.inmemory.js';
import { resolveMongoRuntime } from './mongodb.runtime.js';
import {
  type Actor,
  type ActorDocument,
  MONGO_SCHEMAS,
  mongoSchemas,
  type Product,
  type ProductDocument,
} from './mongoose.schemas.js';

const actorModel: Model<Actor> = mongoose.model<Actor>(
  MONGO_SCHEMAS.names.actor,
  mongoSchemas.actor,
);

const productModel: Model<Product> = mongoose.model<Product>(
  MONGO_SCHEMAS.names.product,
  mongoSchemas.product,
);

function ensureDocument<TDocument>(
  document: TDocument | null | undefined,
  message: string,
): Result<TDocument, Error> {
  if (isNullish(document)) {
    return errorHandler.err(createError(message));
  }

  return errorHandler.ok(document);
}

function connectMongo(): AsyncResult<void, Error> {
  return resolveMongoRuntime(process.env, 'seed').andThen((runtime) =>
    errorHandler.fromPromise(() => mongoose.connect(runtime.uri)).map(() => undefined),
  );
}

function disconnectMongo(): AsyncResult<void, Error> {
  return errorHandler.fromPromise(() => mongoose.disconnect());
}

function seedActor(): AsyncResult<ActorDocument, Error> {
  return errorHandler
    .fromPromise(() =>
      actorModel
        .findOneAndUpdate(
          { externalId: 'local-dev-actor-1' },
          {
            externalId: 'local-dev-actor-1',
            name: 'Dev User',
            email: 'dev@example.com',
          },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
          },
        )
        .exec(),
    )
    .andThen((actor) =>
      errorHandler.fromResult(ensureDocument(actor, 'Falha ao criar ou atualizar o actor seed.')),
    );
}

function seedProduct(): AsyncResult<ProductDocument, Error> {
  return errorHandler
    .fromPromise(() =>
      productModel
        .findOneAndUpdate(
          { sku: 'SKU-001', isCurrent: true },
          {
            sku: 'SKU-001',
            name: 'Produto de Exemplo',
            description: 'Produto seed para desenvolvimento local',
            priceCents: 999,
            stock: 100,
          },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
          },
        )
        .exec(),
    )
    .andThen((product) =>
      errorHandler.fromResult(
        ensureDocument(product, 'Falha ao criar ou atualizar o product seed.'),
      ),
    );
}

function stopMongoInfrastructure(): AsyncResult<void, Error> {
  return stopInMemoryMongoServer();
}

async function main(): Promise<void> {
  await connectMongo()
    .andThen(() => {
      console.log('Seeding minimal data...');

      return seedActor().andThen((actor) =>
        seedProduct().map((product) => ({
          actorId: actor._id.toString(),
          productId: product._id.toString(),
        })),
      );
    })
    .match(
      ({ actorId, productId }) => {
        console.log('Seed completed:', {
          actorId,
          productId,
        });
      },
      (error) => {
        console.error(error);
        process.exitCode = 1;
      },
    );
}

main()
  .catch((error: unknown) => {
    console.error(errorHandler.normalize(error));
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectMongo().match(
      () => undefined,
      (error) => {
        console.error(error);
        process.exitCode = 1;
      },
    );

    await stopMongoInfrastructure().match(
      () => undefined,
      (error) => {
        console.error(error);
        process.exitCode = 1;
      },
    );
  });
