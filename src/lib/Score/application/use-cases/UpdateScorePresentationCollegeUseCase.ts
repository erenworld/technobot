import { ScorePresentationCollege } from '../../domain/ScorePresentationCollege';
import { UpdateScorePresentationCollegeData, ScorePresentationCollegeRepository } from '../../domain/ScorePresentationCollegeRepository';
import { ScoreNotFoundException } from '../../../../common/exceptions/ScoreNotFoundException';
import { UnauthorizedScoreModificationException } from '../../../../common/exceptions/UnauthorizedScoreModificationException';

export class UpdateScorePresentationCollegeUseCase {
  constructor(private readonly repository: ScorePresentationCollegeRepository) {}

  async execute(id: string, data: UpdateScorePresentationCollegeData, connectedJuryId: string): Promise<ScorePresentationCollege> {
    const existing = await this.repository.getById(id);
    if (!existing) throw new ScoreNotFoundException(id);
    if (existing.juryId !== connectedJuryId) throw new UnauthorizedScoreModificationException();
    return this.repository.update(id, data);
  }
}
