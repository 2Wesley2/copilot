import 'dotenv/config';

import mongoose from 'mongoose';

import { stopInMemoryMongoServer } from './mongodb.inmemory.js';
import { resolveMongoRuntime } from './mongodb.runtime.js';
import { Actor, ActorSchema, Product, ProductSchema } from './mongoose.schemas.js';

const ActorModel = mongoose.model(Actor.name, ActorSchema);
const ProductModel = mongoose.model(Product.name, ProductSchema);

async function main() {
  const runtime = await resolveMongoRuntime(process.env, 'seed').match(
    (resolvedRuntime) => resolvedRuntime,
    (error) => {
      throw error;
    },
  );

  await mongoose.connect(runtime.uri);

  console.log('Seeding minimal data...');

  const actor = await ActorModel.findOneAndUpdate(
    { externalId: 'local-dev-actor-1' },
    {
      externalId: 'local-dev-actor-1',
      name: 'Dev User',
      email: 'dev@example.com',
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).orFail();

  const product = await ProductModel.findOneAndUpdate(
    { sku: 'SKU-001', isCurrent: true },
    {
      sku: 'SKU-001',
      name: 'Produto de Exemplo',
      description: 'Produto seed para desenvolvimento local',
      priceCents: 999,
      stock: 100,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).orFail();

  const actorId = String(actor._id);
  const productId = String(product._id);

  console.log('Seed completed:', {
    actorId,
    productId,
  });
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
    await stopInMemoryMongoServer().match(
      () => undefined,
      (error) => {
        throw error;
      },
    );
  });
