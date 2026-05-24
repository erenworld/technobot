import { PlanningSlot } from '../../src/lib/Planning/domain/PlanningSlot';

interface PlanningSlotOverrides {
  id?: string;
  teamId?: string | null;
  epreuveId?: string | null;
  poule?: string | null;
  juryVestiaire?: string | null;
  heurePresentation?: string | null;
  heureDebutRencontres?: string | null;
  heureFinRencontres?: string | null;
  zoneRencontres?: string | null;
  sallePresentation?: string | null;
  observations?: string | null;
}

export function PlanningSlotFactory(overrides: PlanningSlotOverrides = {}): PlanningSlot {
  return new PlanningSlot({
    id: overrides.id ?? 'slot-test-uuid',
    teamId: overrides.teamId ?? 'team-test-uuid',
    epreuveId: overrides.epreuveId ?? 'epreuve-test-uuid',
    poule: overrides.poule ?? 'A',
    juryVestiaire: overrides.juryVestiaire ?? 'Vestiaire 1',
    heurePresentation: overrides.heurePresentation ?? '09:00',
    heureDebutRencontres: overrides.heureDebutRencontres ?? '10:00',
    heureFinRencontres: overrides.heureFinRencontres ?? '11:00',
    zoneRencontres: overrides.zoneRencontres ?? 'Zone A',
    sallePresentation: overrides.sallePresentation ?? 'Salle A',
    observations: overrides.observations ?? null,
    team: null,
  });
}
