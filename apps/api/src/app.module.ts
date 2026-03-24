import { type DynamicModule, Module } from '@nestjs/common';

import { type MongoDatabaseConfig } from './infra/database/mongodb/config/mongodb.config.js';
import { MongoModule } from './infra/database/mongodb/mongodb.module.js';
import type { MongoRuntimeConfig } from './infra/database/mongodb/runtime/mongodb.runtime.js';
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

@Module({})
export class AppModule {
  public static register(params: {
    readonly databaseConfig: MongoDatabaseConfig;
    readonly runtimeConfig: MongoRuntimeConfig;
  }): DynamicModule {
    return {
      module: AppModule,
      imports: [
        MongoModule.register({
          databaseConfig: params.databaseConfig,
          runtimeConfig: params.runtimeConfig,
        }),
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
    };
  }
}
