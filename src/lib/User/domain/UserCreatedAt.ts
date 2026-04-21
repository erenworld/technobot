export class UserCreatedAt {
  value: Date;

  constructor(value: Date) {
    this.value = value;
    this.ensureIsValid();
  }

  static create(input?: Date | string | UserCreatedAt): UserCreatedAt {
    if (input instanceof UserCreatedAt) {
      return input;
    }

    if (!input) {
      return new UserCreatedAt(new Date());
    }

    if (typeof input === 'string') {
      return new UserCreatedAt(new Date(input));
    }

    return new UserCreatedAt(input);
  }

  private ensureIsValid() {
    if (this.value > new Date()) {
      throw new Error('UserCreatedAt must be in the past');
    }
  }
}