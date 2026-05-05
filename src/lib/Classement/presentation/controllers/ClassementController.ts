import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../../../../common/guards/SupabaseAuthGuard';
import { PermissionsGuard } from '../../../../common/guards/PermissionsGuard';
import { RequirePermissions } from '../../../../common/decorators/RequirePermissions.decorator';
import { Permission } from '../../../../common/permissions/Permission';
import { GetClassementsUseCase } from '../../application/use-cases/GetClassementsUseCase';

@UseGuards(SupabaseAuthGuard, PermissionsGuard)
@Controller('classements')
export class ClassementController {
  constructor(private readonly getClassementsUseCase: GetClassementsUseCase) {}

  @Get(':editionId')
  @RequirePermissions(Permission.READ_CLASSEMENTS)
  async getClassements(@Param('editionId') editionId: string) {
    const result = await this.getClassementsUseCase.execute(editionId);
    return {
      colleges: result.colleges.map((e) => e.toPlainObject()),
      lycees: result.lycees.map((e) => e.toPlainObject()),
    };
  }
}
