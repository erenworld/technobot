import { PlanningSlot } from './PlanningSlot';

export interface PlanningRepository {
  getByEditionId(editionId: string): Promise<PlanningSlot[]>;
}
