import { MatchSumo } from '../../domain/MatchSumo';
import { MatchSumoRepository } from '../../domain/MatchSumoRepository';
import { MatchSumoNotFoundException } from '../../../../common/exceptions/MatchSumoNotFoundException';

export class GetMatchSumoUseCase {
  constructor(private readonly matchSumoRepository: MatchSumoRepository) {}

  async execute(id: string): Promise<MatchSumo> {
    const match = await this.matchSumoRepository.getById(id);
    if (!match) throw new MatchSumoNotFoundException(id);
    return match;
  }
}
