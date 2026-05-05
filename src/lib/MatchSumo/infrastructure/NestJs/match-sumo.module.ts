import { Module } from '@nestjs/common';
import { SupabaseMatchSumoRepository } from '../repositories/SupabaseMatchSumoRepository';
import { GetMatchSumoUseCase } from '../../application/use-cases/GetMatchSumoUseCase';
import { GetMatchsSumoUseCase } from '../../application/use-cases/GetMatchsSumoUseCase';
import { CreateRencontreSumoUseCase } from '../../application/use-cases/CreateRencontreSumoUseCase';
import { MatchSumoController } from '../../presentation/controllers/MatchSumoController';
import { SUPABASE_CLIENT } from '../../../../common/supabase/supabase.constants';
import { SupabaseClient } from '@supabase/supabase-js';

const MATCH_SUMO_REPO = 'MATCH_SUMO_REPO';

@Module({
  controllers: [MatchSumoController],
  providers: [
    { provide: MATCH_SUMO_REPO, useFactory: (c: SupabaseClient) => new SupabaseMatchSumoRepository(c), inject: [SUPABASE_CLIENT] },
    { provide: GetMatchSumoUseCase, useFactory: (r: SupabaseMatchSumoRepository) => new GetMatchSumoUseCase(r), inject: [MATCH_SUMO_REPO] },
    { provide: GetMatchsSumoUseCase, useFactory: (r: SupabaseMatchSumoRepository) => new GetMatchsSumoUseCase(r), inject: [MATCH_SUMO_REPO] },
    { provide: CreateRencontreSumoUseCase, useFactory: (r: SupabaseMatchSumoRepository) => new CreateRencontreSumoUseCase(r), inject: [MATCH_SUMO_REPO] },
  ],
})
export class MatchSumoModule {}
