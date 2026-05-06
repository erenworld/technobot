export class MatchSumoNotFoundException extends Error {
  constructor(id: string) {
    super(`Match sumo not found: ${id}`);
    this.name = 'MatchSumoNotFoundException';
  }
}
