import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { isNullish } from '@copilot/shared';
import { type AsyncResult, errorHandler } from '../../../../../error/index.js';
import type { DraftDecision } from '../../../domain/draft-decision.entity.js';
import type { DraftDecisionRepository } from '../../../domain/draft-decision.repository.js';
import { DRAFT_DECISION_MODEL_NAME, type DraftDecisionMongoDocument, type DraftDecisionMongoPersistence } from './draft-decision.schema.js';
import { DraftDecisionMapper } from './draft-decision.mapper.js';

@Injectable()
export class DraftDecisionMongooseRepository implements DraftDecisionRepository {
  public constructor(
    @InjectModel(DRAFT_DECISION_MODEL_NAME)
    private readonly draftDecisionModel: Model<DraftDecisionMongoPersistence>,
    private readonly draftDecisionMapper: DraftDecisionMapper,
  ) {}

  public findById(decisionId: string): AsyncResult<DraftDecision | null, Error> {
    return errorHandler.fromPromise(async () => {
      const document: DraftDecisionMongoDocument | null = await this.draftDecisionModel
        .findById(decisionId)
        .exec();

      if (isNullish(document)) {
        return null;
      }

      return this.draftDecisionMapper.toDomain(document);
    });
  }

  public save(decision: DraftDecision): AsyncResult<void, Error> {
    return errorHandler.fromPromise(async () => {
      const persistence = this.draftDecisionMapper.toPersistence(decision);

      await this.draftDecisionModel
        .findOneAndUpdate({ _id: persistence._id }, persistence, {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        })
        .exec();
    });
  }
}
