import { User as PrismaUser } from '@prisma/client';
import { UserRepository } from '../../domain/UserRepository';
import { User } from '../../domain/User';
import { UserId } from '../../domain/UserId';
import { UserName } from '../../domain/UserName';
import { UserEmail } from '../../domain/UserEmail';
import { UserCreatedAt } from '../../domain/UserCreatedAt';
import { PrismaService } from '../../../../db/prisma.service';

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDomain(user: PrismaUser) {
    return new User(
      new UserId(user.id),
      new UserName(user.name),
      new UserEmail(user.email),
      new UserCreatedAt(user.createdAt),
    );
  }

  async getAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();

    return users.map((user) => this.mapToDomain(user));
  }

  async getOneById(id: UserId): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id.value,
      },
    });

    if (!user) return null;

    return this.mapToDomain(user);
  }

  async create(user: User): Promise<void> {
    await this.prisma.user.create({
      data: {
        id: user.id.value,
        name: user.name.value,
        email: user.email.value,
        createdAt: user.createdAt.value,
      },
    });
  }

  async edit(user: User): Promise<void> {
    await this.prisma.user.updateMany({
      where: {
        id: user.id.value,
      },
      data: {
        name: user.name.value,
        email: user.email.value,
        createdAt: user.createdAt.value,
      },
    });
  }

  async delete(id: UserId): Promise<void> {
    await this.prisma.user.deleteMany({
      where: {
        id: id.value,
      },
    });
  }
}
