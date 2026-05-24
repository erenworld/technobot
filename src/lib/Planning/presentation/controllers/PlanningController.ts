import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../../../../common/guards/SupabaseAuthGuard';
import { PermissionsGuard } from '../../../../common/guards/PermissionsGuard';
import { RequirePermissions } from '../../../../common/decorators/RequirePermissions.decorator';
import { Permission } from '../../../../common/permissions/Permission';
import { GetPlanningByEditionUseCase } from '../../application/use-cases/GetPlanningByEditionUseCase';

@UseGuards(SupabaseAuthGuard, PermissionsGuard)
@Controller('planning')
export class PlanningController {
  constructor(private readonly getPlanningUseCase: GetPlanningByEditionUseCase) {}

  @Get(':editionId')
  @RequirePermissions(Permission.READ_PLANNING)
  async getByEdition(@Param('editionId') editionId: string) {
    const slots = await this.getPlanningUseCase.execute(editionId);
    return slots.map((s) => s.toPlainObject());
  }
}
