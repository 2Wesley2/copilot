import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { mongoEnvSchema } from './infra/database/mongodb/env/mongodb-env.schema.js';
import { MongoModule } from './infra/database/mongodb/mongodb.module.js';
import { HealthModule } from './infra/health/health.module.js';
import { ActorModule } from './modules/actor/actor.module.js';
import { AuditEventModule } from './modules/audit-event/audit-event.module.js';
import { ConversationMessageModule } from './modules/conversation-message/conversation-message.module.js';
import { ConversationSessionModule } from './modules/conversation-session/conversation-session.module.js';
import { DraftDecisionModule } from './modules/draft-decision/draft-decision.module.js';
import { OperationDraftModule } from './modules/operation-draft/operation-draft.module.js';
import { OperationDraftItemModule } from './modules/operation-draft-item/operation-draft-item.module.js';
import { OperationExecutionModule } from './modules/operation-execution/operation-execution.module.js';
import { ProductModule } from './modules/product/product.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      validate: (env) => mongoEnvSchema.parse(env),
    }),
    MongoModule,
    HealthModule,
    ActorModule,
    ConversationSessionModule,
    ConversationMessageModule,
    OperationDraftModule,
    OperationDraftItemModule,
    DraftDecisionModule,
    OperationExecutionModule,
    AuditEventModule,
    ProductModule,
  ],
})
export class AppModule {}
