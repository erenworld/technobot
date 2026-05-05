import { ScoreDesign } from '../../domain/ScoreDesign';
import { CreateScoreDesignData, ScoreDesignRepository } from '../../domain/ScoreDesignRepository';
import { ScoreAlreadyExistsException } from '../../../../common/exceptions/ScoreAlreadyExistsException';
import { UnauthorizedScoreModificationException } from '../../../../common/exceptions/UnauthorizedScoreModificationException';

export class CreateScoreDesignUseCase {
  constructor(private readonly repository: ScoreDesignRepository) {}

  async execute(data: CreateScoreDesignData, connectedJuryId: string): Promise<ScoreDesign> {
    if (data.juryId !== connectedJuryId) {
      throw new UnauthorizedScoreModificationException();
    }

    try {
      return await this.repository.create(data);
    } catch (err) {
      if (err instanceof Error && err.message.includes('23505')) {
        throw new ScoreAlreadyExistsException(data.teamId);
      }
      throw err;
    }
  }
}
