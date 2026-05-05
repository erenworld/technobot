import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
  ForbiddenException as NestForbiddenException
} from '@nestjs/common';
import { SupabaseAuthGuard, AuthenticatedUser } from '../../../../common/guards/SupabaseAuthGuard';
import { PermissionsGuard } from '../../../../common/guards/PermissionsGuard';
import { RequirePermissions } from '../../../../common/decorators/RequirePermissions.decorator';
import { Permission } from '../../../../common/permissions/Permission';
import { ROLE_PERMISSIONS } from '../../../../common/permissions/RolePermissions';
import { CurrentUser } from '../../../../common/decorators/CurrentUser.decorator';
import { UserGetAll } from '../../application/UserGetAll/UserGetAll';
import { UserGetOneById } from '../../application/UserGetOneById/UserGetOneById';
import { UserCreate } from '../../application/UserCreate/UserCreate';
import { UserEdit } from '../../application/UserEdit/UserEdit';
import { UserDelete } from '../../application/UserDelete/UserDelete';
import { Create, Edit, FindOneParams } from './Validations';
import { UserNotFoundError } from '../../domain/UserNotFoundError';


@UseGuards(SupabaseAuthGuard, PermissionsGuard)
@Controller('users')
export class UserController {
  constructor(
    @Inject('UserGetAll') private readonly userGetAll: UserGetAll,
    @Inject('UserGetOneById') private readonly userGetOneById: UserGetOneById,
    @Inject('UserCreate') private readonly userCreate: UserCreate,
    @Inject('UserEdit') private readonly userEdit: UserEdit,
    @Inject('UserDelete') private readonly userDelete: UserDelete,
  ) {}

  @Get()
  @RequirePermissions(Permission.READ_USERS)
  async getAll() {
    return (await this.userGetAll.run()).map((u) => u.toPlainObject());
  }

  @Get(':id')
  @RequirePermissions(Permission.READ_USERS)
  async getOneById(@Param() params: FindOneParams) {
    try {
      return (await this.userGetOneById.run(params.id)).toPlainObject();
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException();
      }

      throw error;
    }
  }

  @Post()
  @RequirePermissions(Permission.MANAGE_ALL_PROFILES)
  async create(@Body() body: Create) {
    return (await this.userCreate.run(
      body.id,
      body.name,
      body.email,
      new Date(),
    )).toPlainObject();
  }

  @Put(':id')
  async edit(@Param() params: FindOneParams, @Body() body: Edit, @CurrentUser() user: AuthenticatedUser) {
    const isOwnProfile = params.id === user.id;
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    
    const canManageAll = permissions.includes(Permission.MANAGE_ALL_PROFILES);
    const canManageOwn = permissions.includes(Permission.MANAGE_OWN_PROFILE);

    if (!canManageAll && (!isOwnProfile || !canManageOwn)) {
      throw new NestForbiddenException('You do not have permission to edit this profile');
    }
    const existingUser = await this.userGetOneById.run(params.id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    return (await this.userEdit.run(
      params.id,
      body.name,
      body.email,
      existingUser.createdAt.value,
    )).toPlainObject();
  }

  @Delete(':id')
  @RequirePermissions(Permission.DELETE_PROFILE)
  async delete(@Param() params: FindOneParams) {
    return await this.userDelete.run(params.id);
  }
}
