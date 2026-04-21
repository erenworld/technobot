import { Provider } from '@nestjs/common';
import { UserRepository } from '../../domain/UserRepository';
import { InMemoryUserRepository } from '../InMemoryUserRepository';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { PrismaUserRepository } from '../Prisma/PrismaUserRepository';

export const USER_REPOSITORY = 'UserRepository';

export const userRepositoryFactoryProvider: Provider = {
  provide: USER_REPOSITORY,
  inject: [PrismaService],
  useFactory: (prisma: PrismaService): UserRepository => {
    const driver = process.env.USER_REPOSITORY_DRIVER ?? 'prisma';

    if (driver === 'memory') {
      return new InMemoryUserRepository();
    }

    return new PrismaUserRepository(prisma);
  },
};
