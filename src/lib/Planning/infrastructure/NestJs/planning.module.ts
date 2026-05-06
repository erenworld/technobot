import { Module } from '@nestjs/common';
import { SupabasePlanningRepository } from '../repositories/SupabasePlanningRepository';
import { GetPlanningByEditionUseCase } from '../../application/use-cases/GetPlanningByEditionUseCase';
import { PlanningController } from '../../presentation/controllers/PlanningController';
import { SUPABASE_CLIENT } from '../../../../common/supabase/supabase.constants';
import { SupabaseClient } from '@supabase/supabase-js';

const PLANNING_REPO = 'PLANNING_REPO';

@Module({
  controllers: [PlanningController],
  providers: [
    { provide: PLANNING_REPO, useFactory: (c: SupabaseClient) => new SupabasePlanningRepository(c), inject: [SUPABASE_CLIENT] },
    { provide: GetPlanningByEditionUseCase, useFactory: (r: SupabasePlanningRepository) => new GetPlanningByEditionUseCase(r), inject: [PLANNING_REPO] },
  ],
})
export class PlanningModule {}
