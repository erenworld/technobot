export class TeamId {
  readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('TeamId cannot be empty');
    }
    this.value = value;
  }
}
