export class ScoreAlreadyExistsException extends Error {
  constructor(teamId: string) {
    super(`A score already exists for team: ${teamId}`);
    this.name = 'ScoreAlreadyExistsException';
  }
}
