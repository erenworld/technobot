import { ScoreSuiviLigne } from '../../domain/ScoreSuiviLigne';
import { UpdateScoreSuiviLigneData, ScoreSuiviLigneRepository } from '../../domain/ScoreSuiviLigneRepository';
import { ScoreNotFoundException } from '../../../../common/exceptions/ScoreNotFoundException';
import { UnauthorizedScoreModificationException } from '../../../../common/exceptions/UnauthorizedScoreModificationException';

export class UpdateScoreSuiviLigneUseCase {
  constructor(private readonly repository: ScoreSuiviLigneRepository) {}

  async execute(id: string, data: UpdateScoreSuiviLigneData, connectedJuryId: string): Promise<ScoreSuiviLigne> {
    const existing = await this.repository.getById(id);
    if (!existing) throw new ScoreNotFoundException(id);
    if (existing.juryId !== connectedJuryId) throw new UnauthorizedScoreModificationException();
    return this.repository.update(id, data);
  }
}
