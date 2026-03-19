import { Module, type Type } from '@nestjs/common';

import type { AsyncResult } from './error/index.js';
import { HealthModule } from './infra/database/health/health.module.js';
import type { PersistenceRuntimeEnv } from './infra/persistence/persistence.environment.js';
import { PersistenceModule } from './infra/persistence/persistence.module.js';
import { ActorModule } from './modules/actor/actor.module.js';
import { AuditEventModule } from './modules/audit-event/audit-event.module.js';
import { ConversationMessageModule } from './modules/conversation-message/conversation-message.module.js';
import { ConversationSessionModule } from './modules/conversation-session/conversation-session.module.js';
import { DraftDecisionModule } from './modules/draft-decision/draft-decision.module.js';
import { OperationDraftModule } from './modules/operation-draft/operation-draft.module.js';
import { OperationDraftItemModule } from './modules/operation-draft-item/operation-draft-item.module.js';
import { OperationExecutionModule } from './modules/operation-execution/operation-execution.module.js';
import { ProductModule } from './modules/product/product.module.js';

export function createAppModuleResult(
  env: PersistenceRuntimeEnv = process.env,
): AsyncResult<Type<object>, Error> {
  return PersistenceModule.registerResult(env).map((persistenceModule) => {
    class RuntimeAppModule {
      private readonly runtimeAppModuleBrand = 'RuntimeAppModule';
    }

    Module({
      imports: [
        persistenceModule,
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
    })(RuntimeAppModule);

    return RuntimeAppModule;
  });
}
