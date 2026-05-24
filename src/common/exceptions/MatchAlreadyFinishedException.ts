export class MatchAlreadyFinishedException extends Error {
  constructor(matchId: string) {
    super(`Match is already finished: ${matchId}`);
    this.name = 'MatchAlreadyFinishedException';
  }
}
