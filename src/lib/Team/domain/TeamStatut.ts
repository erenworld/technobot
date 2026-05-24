export type TeamStatutValue = 'inscrit' | 'valide' | 'controle_technique_ok' | 'disqualifie';

export class TeamStatut {
  readonly value: TeamStatutValue;

  private static readonly VALID_VALUES: TeamStatutValue[] = [
    'inscrit',
    'valide',
    'controle_technique_ok',
    'disqualifie',
  ];

  constructor(value: TeamStatutValue) {
    if (!TeamStatut.VALID_VALUES.includes(value)) {
      throw new Error(`Invalid TeamStatut: ${value}`);
    }
    this.value = value;
  }

  isDisqualified(): boolean {
    return this.value === 'disqualifie';
  }
}
