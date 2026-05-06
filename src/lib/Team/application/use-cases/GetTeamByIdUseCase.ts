import { Team } from '../../domain/Team';
import { TeamId } from '../../domain/TeamId';
import { TeamRepository } from '../../domain/TeamRepository';
import { TeamNotFoundException } from '../../../../common/exceptions/TeamNotFoundException';

export class GetTeamByIdUseCase {
  constructor(private readonly teamRepository: TeamRepository) {}

  async execute(id: string): Promise<Team> {
    const teamId = new TeamId(id);
    const team = await this.teamRepository.getOneById(teamId);
    if (!team) {
      throw new TeamNotFoundException(id);
    }
    return team;
  }
}
