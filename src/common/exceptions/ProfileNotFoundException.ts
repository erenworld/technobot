export class ProfileNotFoundException extends Error {
  constructor() {
    super('Profile not found for authenticated user');
    this.name = 'ProfileNotFoundException';
  }
}
