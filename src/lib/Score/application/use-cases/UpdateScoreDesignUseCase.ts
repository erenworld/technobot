import { ScoreDesign } from '../../domain/ScoreDesign';
import { UpdateScoreDesignData, ScoreDesignRepository } from '../../domain/ScoreDesignRepository';
import { ScoreNotFoundException } from '../../../../common/exceptions/ScoreNotFoundException';
import { UnauthorizedScoreModificationException } from '../../../../common/exceptions/UnauthorizedScoreModificationException';

export class UpdateScoreDesignUseCase {
  constructor(private readonly repository: ScoreDesignRepository) {}

  async execute(id: string, data: UpdateScoreDesignData, connectedJuryId: string): Promise<ScoreDesign> {
    const existing = await this.repository.getById(id);
    if (!existing) {
      throw new ScoreNotFoundException(id);
    }
    if (existing.juryId !== connectedJuryId) {
      throw new UnauthorizedScoreModificationException();
    }
    return this.repository.update(id, data);
  }
}
