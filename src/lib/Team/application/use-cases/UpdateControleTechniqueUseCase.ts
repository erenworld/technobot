import { TeamId } from '../../domain/TeamId';
import { TeamStatut, TeamStatutValue } from '../../domain/TeamStatut';
import { TeamRepository } from '../../domain/TeamRepository';
import { TeamNotFoundException } from '../../../../common/exceptions/TeamNotFoundException';

export interface UpdateControleTechniqueInput {
  readonly statut: TeamStatutValue;
  readonly notesTechnique?: string | null;
}

export class UpdateControleTechniqueUseCase {
  constructor(private readonly teamRepository: TeamRepository) {}

  async execute(id: string, input: UpdateControleTechniqueInput): Promise<void> {
    const teamId = new TeamId(id);
    const team = await this.teamRepository.getOneById(teamId);
    if (!team) {
      throw new TeamNotFoundException(id);
    }

    const statut = new TeamStatut(input.statut);
    await this.teamRepository.updateControle(teamId, statut, input.notesTechnique ?? null);
  }
}
