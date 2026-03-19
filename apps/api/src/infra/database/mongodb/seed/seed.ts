import 'dotenv/config';

import { isNullish } from '@copilot/shared';
import mongoose, { type Model, type Types } from 'mongoose';

import {
  type AsyncResult,
  createError,
  errorHandler,
  type Result,
} from '../../../../error/index.js';
import { stopInMemoryMongoServer } from '../inmemory/mongodb.inmemory.js';
import {
  type Actor,
  type ActorDocument,
  type AuditEvent,
  type AuditEventDocument,
  type ConversationMessage,
  type ConversationMessageDocument,
  type ConversationSession,
  type ConversationSessionDocument,
  type DraftDecision,
  type DraftDecisionDocument,
  MONGO_SCHEMAS,
  mongoSchemas,
  type OperationDraft,
  type OperationDraftDocument,
  type OperationDraftItem,
  type OperationDraftItemDocument,
  type OperationExecution,
  type OperationExecutionDocument,
  type Product,
  type ProductDocument,
} from '../mongoose/mongoose.schemas.js';
import { resolveMongoRuntime } from '../runtime/mongodb.runtime.js';

const actorModel: Model<Actor> = mongoose.model<Actor>(
  MONGO_SCHEMAS.names.actor,
  mongoSchemas.actor,
);

const conversationSessionModel: Model<ConversationSession> = mongoose.model<ConversationSession>(
  MONGO_SCHEMAS.names.conversationSession,
  mongoSchemas.conversationSession,
);

const conversationMessageModel: Model<ConversationMessage> = mongoose.model<ConversationMessage>(
  MONGO_SCHEMAS.names.conversationMessage,
  mongoSchemas.conversationMessage,
);

const operationDraftModel: Model<OperationDraft> = mongoose.model<OperationDraft>(
  MONGO_SCHEMAS.names.operationDraft,
  mongoSchemas.operationDraft,
);

const operationDraftItemModel: Model<OperationDraftItem> = mongoose.model<OperationDraftItem>(
  MONGO_SCHEMAS.names.operationDraftItem,
  mongoSchemas.operationDraftItem,
);

const draftDecisionModel: Model<DraftDecision> = mongoose.model<DraftDecision>(
  MONGO_SCHEMAS.names.draftDecision,
  mongoSchemas.draftDecision,
);

const operationExecutionModel: Model<OperationExecution> = mongoose.model<OperationExecution>(
  MONGO_SCHEMAS.names.operationExecution,
  mongoSchemas.operationExecution,
);

const auditEventModel: Model<AuditEvent> = mongoose.model<AuditEvent>(
  MONGO_SCHEMAS.names.auditEvent,
  mongoSchemas.auditEvent,
);

const productModel: Model<Product> = mongoose.model<Product>(
  MONGO_SCHEMAS.names.product,
  mongoSchemas.product,
);

const SEED_KEYS = Object.freeze({
  actorExternalId: 'local-dev-actor-1',
  sessionKey: 'local-dev-session-1',
  productLineageKey: 'local-dev-product-1',
  productSku: 'SKU-001',
  userMessageContent: 'Cadastre um produto de exemplo para o ambiente local.',
  assistantMessageContent: 'Produto de exemplo preparado para desenvolvimento local.',
  draftIntent: 'product.create',
  auditKind: 'product.seeded',
});

const SEED_DATES = Object.freeze({
  executionStartedAt: new Date('2026-03-17T12:00:00.000Z'),
  executionFinishedAt: new Date('2026-03-17T12:00:01.000Z'),
});

interface SeedSummary {
  readonly actorId: string;
  readonly sessionId: string;
  readonly userMessageId: string;
  readonly assistantMessageId: string;
  readonly productId: string;
  readonly draftId: string;
  readonly draftItemId: string;
  readonly draftDecisionId: string;
  readonly operationExecutionId: string;
  readonly auditEventId: string;
}

function ensureDocument<TDocument>(
  document: TDocument | null | undefined,
  message: string,
): Result<TDocument, Error> {
  if (isNullish(document)) {
    return errorHandler.err(createError(message));
  }

  return errorHandler.ok(document);
}

function upsertDocument<TDocument>(
  operation: () => Promise<TDocument | null>,
  message: string,
): AsyncResult<TDocument, Error> {
  return errorHandler
    .fromPromise(operation)
    .andThen((document) => errorHandler.fromResult(ensureDocument(document, message)));
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
  return upsertDocument(
    () =>
      actorModel
        .findOneAndUpdate(
          { externalId: SEED_KEYS.actorExternalId },
          {
            externalId: SEED_KEYS.actorExternalId,
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
    'Falha ao criar ou atualizar o actor seed.',
  );
}

function seedConversationSession(
  actorId: Types.ObjectId,
): AsyncResult<ConversationSessionDocument, Error> {
  return upsertDocument(
    () =>
      conversationSessionModel
        .findOneAndUpdate(
          {
            actorId,
            'metadata.seedKey': SEED_KEYS.sessionKey,
          },
          {
            actorId,
            metadata: {
              seedKey: SEED_KEYS.sessionKey,
              channel: 'local-dev',
              locale: 'pt-BR',
              source: 'seed',
            },
          },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
          },
        )
        .exec(),
    'Falha ao criar ou atualizar a conversation session seed.',
  );
}

function seedConversationMessages(
  sessionId: Types.ObjectId,
  actorId: Types.ObjectId,
): AsyncResult<
  {
    readonly userMessage: ConversationMessageDocument;
    readonly assistantMessage: ConversationMessageDocument;
  },
  Error
> {
  return upsertDocument(
    () =>
      conversationMessageModel
        .findOneAndUpdate(
          {
            sessionId,
            role: 'USER',
            content: SEED_KEYS.userMessageContent,
          },
          {
            actorId,
            content: SEED_KEYS.userMessageContent,
            role: 'USER',
            sessionId,
            streamed: false,
          },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
          },
        )
        .exec(),
    'Falha ao criar ou atualizar a user conversation message seed.',
  ).andThen((userMessage) =>
    upsertDocument(
      () =>
        conversationMessageModel
          .findOneAndUpdate(
            {
              sessionId,
              role: 'ASSISTANT',
              content: SEED_KEYS.assistantMessageContent,
            },
            {
              actorId: null,
              content: SEED_KEYS.assistantMessageContent,
              role: 'ASSISTANT',
              sessionId,
              streamed: false,
            },
            {
              new: true,
              upsert: true,
              setDefaultsOnInsert: true,
            },
          )
          .exec(),
      'Falha ao criar ou atualizar a assistant conversation message seed.',
    ).map((assistantMessage) => ({
      userMessage,
      assistantMessage,
    })),
  );
}

function seedProduct(): AsyncResult<ProductDocument, Error> {
  return upsertDocument(
    () =>
      productModel
        .findOneAndUpdate(
          {
            lineageKey: SEED_KEYS.productLineageKey,
            version: 1,
          },
          {
            deletedAt: null,
            description: 'Produto seed para desenvolvimento local',
            isCurrent: true,
            lineageKey: SEED_KEYS.productLineageKey,
            name: 'Produto de Exemplo',
            priceCents: 999,
            sku: SEED_KEYS.productSku,
            stock: 100,
            version: 1,
          },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
          },
        )
        .exec(),
    'Falha ao criar ou atualizar o product seed.',
  );
}

function seedOperationDraft(
  actorId: Types.ObjectId,
  sessionId: Types.ObjectId,
  productId: Types.ObjectId,
): AsyncResult<OperationDraftDocument, Error> {
  return upsertDocument(
    () =>
      operationDraftModel
        .findOneAndUpdate(
          {
            actorId,
            sessionId,
            intent: SEED_KEYS.draftIntent,
          },
          {
            actorId,
            intent: SEED_KEYS.draftIntent,
            payload: {
              source: 'seed',
              entityType: 'product',
              input: {
                sku: SEED_KEYS.productSku,
                name: 'Produto de Exemplo',
                description: 'Produto seed para desenvolvimento local',
                priceCents: 999,
                stock: 100,
              },
              productId: productId.toHexString(),
            },
            sessionId,
            status: 'CONFIRMED',
          },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
          },
        )
        .exec(),
    'Falha ao criar ou atualizar o operation draft seed.',
  );
}

function seedOperationDraftItem(
  draftId: Types.ObjectId,
  productId: Types.ObjectId,
): AsyncResult<OperationDraftItemDocument, Error> {
  return upsertDocument(
    () =>
      operationDraftItemModel
        .findOneAndUpdate(
          {
            draftId,
            position: 0,
          },
          {
            action: 'CREATE',
            draftId,
            payload: {
              entityType: 'product',
              source: 'seed',
              data: {
                productId: productId.toHexString(),
                sku: SEED_KEYS.productSku,
                name: 'Produto de Exemplo',
                priceCents: 999,
                stock: 100,
              },
            },
            position: 0,
            productId,
          },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
          },
        )
        .exec(),
    'Falha ao criar ou atualizar o operation draft item seed.',
  );
}

function seedDraftDecision(
  actorId: Types.ObjectId,
  draftId: Types.ObjectId,
): AsyncResult<DraftDecisionDocument, Error> {
  return upsertDocument(
    () =>
      draftDecisionModel
        .findOneAndUpdate(
          { draftId },
          {
            actorId,
            approved: true,
            draftId,
            reason: 'Aprovado automaticamente para ambiente local.',
          },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
          },
        )
        .exec(),
    'Falha ao criar ou atualizar o draft decision seed.',
  );
}

function seedOperationExecution(
  draftId: Types.ObjectId,
  productId: Types.ObjectId,
): AsyncResult<OperationExecutionDocument, Error> {
  return upsertDocument(
    () =>
      operationExecutionModel
        .findOneAndUpdate(
          { draftId },
          {
            draftId,
            finishedAt: SEED_DATES.executionFinishedAt,
            result: {
              ok: true,
              source: 'seed',
              productId: productId.toHexString(),
            },
            startedAt: SEED_DATES.executionStartedAt,
            status: 'SUCCESS',
          },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
          },
        )
        .exec(),
    'Falha ao criar ou atualizar o operation execution seed.',
  );
}

function seedAuditEvent(
  actorId: Types.ObjectId,
  draftId: Types.ObjectId,
  sessionId: Types.ObjectId,
  operationExecutionId: Types.ObjectId,
  productId: Types.ObjectId,
): AsyncResult<AuditEventDocument, Error> {
  return upsertDocument(
    () =>
      auditEventModel
        .findOneAndUpdate(
          {
            kind: SEED_KEYS.auditKind,
            entityId: productId.toHexString(),
            sessionId,
          },
          {
            actorId,
            draftId,
            entityId: productId.toHexString(),
            entityType: 'product',
            kind: SEED_KEYS.auditKind,
            operationExecutionId,
            payload: {
              source: 'seed',
              sku: SEED_KEYS.productSku,
              outcome: 'SUCCESS',
            },
            sessionId,
          },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
          },
        )
        .exec(),
    'Falha ao criar ou atualizar o audit event seed.',
  );
}

function seedLocalDevelopmentData(): AsyncResult<SeedSummary, Error> {
  return seedActor().andThen((actor) =>
    seedProduct().andThen((product) =>
      seedConversationSession(actor._id).andThen((session) =>
        seedConversationMessages(session._id, actor._id).andThen((messages) =>
          seedOperationDraft(actor._id, session._id, product._id).andThen((draft) =>
            seedOperationDraftItem(draft._id, product._id).andThen((draftItem) =>
              seedDraftDecision(actor._id, draft._id).andThen((draftDecision) =>
                seedOperationExecution(draft._id, product._id).andThen((operationExecution) =>
                  seedAuditEvent(
                    actor._id,
                    draft._id,
                    session._id,
                    operationExecution._id,
                    product._id,
                  ).map((auditEvent) => ({
                    actorId: actor._id.toHexString(),
                    sessionId: session._id.toHexString(),
                    userMessageId: messages.userMessage._id.toHexString(),
                    assistantMessageId: messages.assistantMessage._id.toHexString(),
                    productId: product._id.toHexString(),
                    draftId: draft._id.toHexString(),
                    draftItemId: draftItem._id.toHexString(),
                    draftDecisionId: draftDecision._id.toHexString(),
                    operationExecutionId: operationExecution._id.toHexString(),
                    auditEventId: auditEvent._id.toHexString(),
                  })),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

function stopMongoInfrastructure(): AsyncResult<void, Error> {
  return stopInMemoryMongoServer();
}

async function main(): Promise<void> {
  await connectMongo()
    .andThen(() => {
      console.log('Seeding local development data...');
      return seedLocalDevelopmentData();
    })
    .match(
      (summary) => {
        console.log('Seed completed:', summary);
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
