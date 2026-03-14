import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { isNullish } from '@copilot/shared';
import { type AsyncResult, errorHandler } from '../../../../../error/index.js';
import { MONGO_SCHEMAS } from '../../../../../mongodb/mongoose.schemas.js';
import type { DraftDecision } from '../../../draft-decision.entity.js';
import type { DraftDecisionRepository } from '../../../draft-decision.repository.js';
import {
  type MongooseDraftDecisionDocument,
  type MongooseDraftDecisionMapper,
  type MongooseDraftDecisionPersistence,
} from './mongoose-draft-decision.mapper.js';

@Injectable()
export class MongooseDraftDecisionRepositoryAdapter implements DraftDecisionRepository {
  public constructor(
    @InjectModel(MONGO_SCHEMAS.names.draftDecision)
    private readonly draftDecisionModel: Model<MongooseDraftDecisionPersistence>,
    private readonly draftDecisionMapper: MongooseDraftDecisionMapper,
  ) {}

  public findById(decisionId: string): AsyncResult<DraftDecision | null, Error> {
    return errorHandler.fromPromise(async () => {
      const document: MongooseDraftDecisionDocument | null = await this.draftDecisionModel
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
