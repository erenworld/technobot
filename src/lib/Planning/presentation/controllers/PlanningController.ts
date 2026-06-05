import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../../../../common/decorators/Public.decorator';
import { GetPlanningByEditionUseCase } from '../../application/use-cases/GetPlanningByEditionUseCase';

@Controller('planning')
export class PlanningController {
  constructor(private readonly getPlanningUseCase: GetPlanningByEditionUseCase) {}

  @Get(':editionId')
  @Public()
  async getByEdition(@Param('editionId') editionId: string) {
    const slots = await this.getPlanningUseCase.execute(editionId);
    return slots.map((s) => s.toPlainObject());
  }
}
