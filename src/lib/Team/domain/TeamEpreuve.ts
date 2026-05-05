export type TeamEpreuveValue =
  | 'design'
  | 'presentation_projet'
  | 'suivi_ligne'
  | 'formule_robot'
  | 'sumo';

export class TeamEpreuve {
  readonly value: TeamEpreuveValue;

  private static readonly VALID_VALUES: TeamEpreuveValue[] = [
    'design',
    'presentation_projet',
    'suivi_ligne',
    'formule_robot',
    'sumo',
  ];

  constructor(value: TeamEpreuveValue) {
    if (!TeamEpreuve.VALID_VALUES.includes(value)) {
      throw new Error(`Invalid TeamEpreuve: ${value}`);
    }
    this.value = value;
  }
}
