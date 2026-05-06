import { ScorePresentationLycee } from '../../domain/ScorePresentationLycee';
import { CreateScorePresentationLyceeData, ScorePresentationLyceeRepository } from '../../domain/ScorePresentationLyceeRepository';
import { ScoreAlreadyExistsException } from '../../../../common/exceptions/ScoreAlreadyExistsException';
import { UnauthorizedScoreModificationException } from '../../../../common/exceptions/UnauthorizedScoreModificationException';

export class CreateScorePresentationLyceeUseCase {
  constructor(private readonly repository: ScorePresentationLyceeRepository) {}

  async execute(data: CreateScorePresentationLyceeData, connectedJuryId: string): Promise<ScorePresentationLycee> {
    if (data.juryId !== connectedJuryId) throw new UnauthorizedScoreModificationException();
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
