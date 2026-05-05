import { ScoreSuiviLigne } from '../../domain/ScoreSuiviLigne';
import { CreateScoreSuiviLigneData, ScoreSuiviLigneRepository } from '../../domain/ScoreSuiviLigneRepository';
import { ScoreAlreadyExistsException } from '../../../../common/exceptions/ScoreAlreadyExistsException';
import { UnauthorizedScoreModificationException } from '../../../../common/exceptions/UnauthorizedScoreModificationException';

export class CreateScoreSuiviLigneUseCase {
  constructor(private readonly repository: ScoreSuiviLigneRepository) {}

  async execute(data: CreateScoreSuiviLigneData, connectedJuryId: string): Promise<ScoreSuiviLigne> {
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
