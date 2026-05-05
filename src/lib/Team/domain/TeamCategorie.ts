export type TeamCategorieValue = 'college' | 'lycee';

export class TeamCategorie {
  readonly value: TeamCategorieValue;

  constructor(value: TeamCategorieValue) {
    if (value !== 'college' && value !== 'lycee') {
      throw new Error(`Invalid TeamCategorie: ${value}`);
    }
    this.value = value;
  }
}
