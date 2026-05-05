import { MatchSumo } from '../../domain/MatchSumo';
import { MatchSumoRepository, MatchSumoFilters } from '../../domain/MatchSumoRepository';

export class GetMatchsSumoUseCase {
  constructor(private readonly matchSumoRepository: MatchSumoRepository) {}

  async execute(filters: MatchSumoFilters): Promise<MatchSumo[]> {
    return this.matchSumoRepository.getAll(filters);
  }
}
