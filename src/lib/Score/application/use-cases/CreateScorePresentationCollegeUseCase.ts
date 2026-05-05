import { ScorePresentationCollege } from '../../domain/ScorePresentationCollege';
import { CreateScorePresentationCollegeData, ScorePresentationCollegeRepository } from '../../domain/ScorePresentationCollegeRepository';
import { ScoreAlreadyExistsException } from '../../../../common/exceptions/ScoreAlreadyExistsException';
import { UnauthorizedScoreModificationException } from '../../../../common/exceptions/UnauthorizedScoreModificationException';

export class CreateScorePresentationCollegeUseCase {
  constructor(private readonly repository: ScorePresentationCollegeRepository) {}

  async execute(data: CreateScorePresentationCollegeData, connectedJuryId: string): Promise<ScorePresentationCollege> {
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
