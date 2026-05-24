export class TeamNotFoundException extends Error {
  constructor(id: string) {
    super(`Team not found: ${id}`);
    this.name = 'TeamNotFoundException';
  }
}
