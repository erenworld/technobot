import { User } from '../User';
import { UserEmail } from '../UserEmail';
import { UserName } from '../UserName';
import { UserId } from '../UserId';
import { UserCreatedAt } from '../UserCreatedAt';

export class UserFactory {
  static create(payload: { id: UserId; name: UserName; email: UserEmail; createdAt?: UserCreatedAt }): User {
    return new User(
      payload.id,
      payload.name,
      payload.email,
      payload.createdAt ?? UserCreatedAt.create(new Date()),
    );
  }
}
