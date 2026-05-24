export class UnauthorizedScoreModificationException extends Error {
  constructor() {
    super('You are not authorized to modify this score');
    this.name = 'UnauthorizedScoreModificationException';
  }
}
