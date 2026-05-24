import { PlanningSlot } from '../../domain/PlanningSlot';
import { PlanningRepository } from '../../domain/PlanningRepository';

export class GetPlanningByEditionUseCase {
  constructor(private readonly planningRepository: PlanningRepository) {}

  async execute(editionId: string): Promise<PlanningSlot[]> {
    return this.planningRepository.getByEditionId(editionId);
  }
}
