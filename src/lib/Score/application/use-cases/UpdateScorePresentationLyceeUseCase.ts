import { ScorePresentationLycee } from '../../domain/ScorePresentationLycee';
import { UpdateScorePresentationLyceeData, ScorePresentationLyceeRepository } from '../../domain/ScorePresentationLyceeRepository';
import { ScoreNotFoundException } from '../../../../common/exceptions/ScoreNotFoundException';
import { UnauthorizedScoreModificationException } from '../../../../common/exceptions/UnauthorizedScoreModificationException';

export class UpdateScorePresentationLyceeUseCase {
  constructor(private readonly repository: ScorePresentationLyceeRepository) {}

  async execute(id: string, data: UpdateScorePresentationLyceeData, connectedJuryId: string): Promise<ScorePresentationLycee> {
    const existing = await this.repository.getById(id);
    if (!existing) throw new ScoreNotFoundException(id);
    if (existing.juryId !== connectedJuryId) throw new UnauthorizedScoreModificationException();
    return this.repository.update(id, data);
  }
}
