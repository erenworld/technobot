import { Team } from '../../domain/Team';
import { TeamFilters, TeamRepository } from '../../domain/TeamRepository';

export class GetTeamsUseCase {
  constructor(private readonly teamRepository: TeamRepository) {}

  async execute(filters: TeamFilters): Promise<Team[]> {
    return this.teamRepository.getAll(filters);
  }
}
