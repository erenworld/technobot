export class ScoreNotFoundException extends Error {
  constructor(id: string) {
    super(`Score not found: ${id}`);
    this.name = 'ScoreNotFoundException';
  }
}
