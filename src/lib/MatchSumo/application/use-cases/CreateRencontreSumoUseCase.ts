import { RencontreSumo } from '../../domain/MatchSumo';
import { CreateRencontreSumoData, MatchSumoRepository } from '../../domain/MatchSumoRepository';
import { MatchSumoNotFoundException } from '../../../../common/exceptions/MatchSumoNotFoundException';
import { MatchAlreadyFinishedException } from '../../../../common/exceptions/MatchAlreadyFinishedException';

export class CreateRencontreSumoUseCase {
  constructor(private readonly matchSumoRepository: MatchSumoRepository) {}

  async execute(matchId: string, data: CreateRencontreSumoData): Promise<RencontreSumo> {
    const match = await this.matchSumoRepository.getById(matchId);
    if (!match) throw new MatchSumoNotFoundException(matchId);
    if (match.isFinished()) throw new MatchAlreadyFinishedException(matchId);
    return this.matchSumoRepository.createRencontre(matchId, data);
  }
}
