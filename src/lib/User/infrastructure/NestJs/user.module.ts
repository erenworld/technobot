import { Module } from '@nestjs/common';
import { UserCreate } from '../../application/UserCreate/UserCreate';
import { UserDelete } from '../../application/UserDelete/UserDelete';
import { UserEdit } from '../../application/UserEdit/UserEdit';
import { UserGetAll } from '../../application/UserGetAll/UserGetAll';
import { UserGetOneById } from '../../application/UserGetOneById/UserGetOneById';
import { UserController } from './user.controller';
import {
  USER_REPOSITORY,
  userRepositoryFactoryProvider,
} from '../factories/UserRepositoryFactory';
import { UserRepository } from '../../domain/UserRepository';

@Module({
  controllers: [UserController],
  providers: [
    userRepositoryFactoryProvider,
    {
      provide: 'UserGetAll',
      useFactory: (repository: UserRepository) => new UserGetAll(repository),
      inject: [USER_REPOSITORY],
    },
    {
      provide: 'UserGetOneById',
      useFactory: (repository: UserRepository) =>
        new UserGetOneById(repository),
      inject: [USER_REPOSITORY],
    },
    {
      provide: 'UserCreate',
      useFactory: (repository: UserRepository) => new UserCreate(repository),
      inject: [USER_REPOSITORY],
    },
    {
      provide: 'UserEdit',
      useFactory: (repository: UserRepository) => new UserEdit(repository),
      inject: [USER_REPOSITORY],
    },
    {
      provide: 'UserDelete',
      useFactory: (repository: UserRepository) => new UserDelete(repository),
      inject: [USER_REPOSITORY],
    },
  ],
})
export class UserModule {}
