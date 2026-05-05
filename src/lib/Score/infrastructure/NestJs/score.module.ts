import { Module } from '@nestjs/common';
import { SupabaseScoreDesignRepository } from '../repositories/SupabaseScoreDesignRepository';
import { SupabaseScorePresentationCollegeRepository } from '../repositories/SupabaseScorePresentationCollegeRepository';
import { SupabaseScorePresentationLyceeRepository } from '../repositories/SupabaseScorePresentationLyceeRepository';
import { SupabaseScoreSuiviLigneRepository } from '../repositories/SupabaseScoreSuiviLigneRepository';
import { CreateScoreDesignUseCase } from '../../application/use-cases/CreateScoreDesignUseCase';
import { UpdateScoreDesignUseCase } from '../../application/use-cases/UpdateScoreDesignUseCase';
import { CreateScorePresentationCollegeUseCase } from '../../application/use-cases/CreateScorePresentationCollegeUseCase';
import { UpdateScorePresentationCollegeUseCase } from '../../application/use-cases/UpdateScorePresentationCollegeUseCase';
import { CreateScorePresentationLyceeUseCase } from '../../application/use-cases/CreateScorePresentationLyceeUseCase';
import { UpdateScorePresentationLyceeUseCase } from '../../application/use-cases/UpdateScorePresentationLyceeUseCase';
import { CreateScoreSuiviLigneUseCase } from '../../application/use-cases/CreateScoreSuiviLigneUseCase';
import { UpdateScoreSuiviLigneUseCase } from '../../application/use-cases/UpdateScoreSuiviLigneUseCase';
import { ScoreController } from '../../presentation/controllers/ScoreController';
import { SUPABASE_CLIENT } from '../../../../common/supabase/supabase.constants';
import { SupabaseClient } from '@supabase/supabase-js';

const SCORE_DESIGN_REPO = 'SCORE_DESIGN_REPO';
const SCORE_PRES_COL_REPO = 'SCORE_PRES_COL_REPO';
const SCORE_PRES_LYC_REPO = 'SCORE_PRES_LYC_REPO';
const SCORE_SUIVI_REPO = 'SCORE_SUIVI_REPO';

@Module({
  controllers: [ScoreController],
  providers: [
    { provide: SCORE_DESIGN_REPO, useFactory: (c: SupabaseClient) => new SupabaseScoreDesignRepository(c), inject: [SUPABASE_CLIENT] },
    { provide: SCORE_PRES_COL_REPO, useFactory: (c: SupabaseClient) => new SupabaseScorePresentationCollegeRepository(c), inject: [SUPABASE_CLIENT] },
    { provide: SCORE_PRES_LYC_REPO, useFactory: (c: SupabaseClient) => new SupabaseScorePresentationLyceeRepository(c), inject: [SUPABASE_CLIENT] },
    { provide: SCORE_SUIVI_REPO, useFactory: (c: SupabaseClient) => new SupabaseScoreSuiviLigneRepository(c), inject: [SUPABASE_CLIENT] },
    { provide: CreateScoreDesignUseCase, useFactory: (r: SupabaseScoreDesignRepository) => new CreateScoreDesignUseCase(r), inject: [SCORE_DESIGN_REPO] },
    { provide: UpdateScoreDesignUseCase, useFactory: (r: SupabaseScoreDesignRepository) => new UpdateScoreDesignUseCase(r), inject: [SCORE_DESIGN_REPO] },
    { provide: CreateScorePresentationCollegeUseCase, useFactory: (r: SupabaseScorePresentationCollegeRepository) => new CreateScorePresentationCollegeUseCase(r), inject: [SCORE_PRES_COL_REPO] },
    { provide: UpdateScorePresentationCollegeUseCase, useFactory: (r: SupabaseScorePresentationCollegeRepository) => new UpdateScorePresentationCollegeUseCase(r), inject: [SCORE_PRES_COL_REPO] },
    { provide: CreateScorePresentationLyceeUseCase, useFactory: (r: SupabaseScorePresentationLyceeRepository) => new CreateScorePresentationLyceeUseCase(r), inject: [SCORE_PRES_LYC_REPO] },
    { provide: UpdateScorePresentationLyceeUseCase, useFactory: (r: SupabaseScorePresentationLyceeRepository) => new UpdateScorePresentationLyceeUseCase(r), inject: [SCORE_PRES_LYC_REPO] },
    { provide: CreateScoreSuiviLigneUseCase, useFactory: (r: SupabaseScoreSuiviLigneRepository) => new CreateScoreSuiviLigneUseCase(r), inject: [SCORE_SUIVI_REPO] },
    { provide: UpdateScoreSuiviLigneUseCase, useFactory: (r: SupabaseScoreSuiviLigneRepository) => new UpdateScoreSuiviLigneUseCase(r), inject: [SCORE_SUIVI_REPO] },
  ],
  exports: [SCORE_DESIGN_REPO, SCORE_PRES_LYC_REPO, SCORE_SUIVI_REPO],
})
export class ScoreModule {}
