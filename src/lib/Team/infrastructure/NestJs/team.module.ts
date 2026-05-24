import { Module } from '@nestjs/common';
import { SupabaseTeamRepository } from '../repositories/SupabaseTeamRepository';
import { GetTeamsUseCase } from '../../application/use-cases/GetTeamsUseCase';
import { GetTeamByIdUseCase } from '../../application/use-cases/GetTeamByIdUseCase';
import { UpdateControleTechniqueUseCase } from '../../application/use-cases/UpdateControleTechniqueUseCase';
import { TeamController } from '../../presentation/controllers/TeamController';
import { SUPABASE_CLIENT } from '../../../../common/supabase/supabase.constants';
import { SupabaseClient } from '@supabase/supabase-js';

const TEAM_REPOSITORY = 'TEAM_REPOSITORY';

@Module({
  controllers: [TeamController],
  providers: [
    {
      provide: TEAM_REPOSITORY,
      useClass: SupabaseTeamRepository,
    },
    {
      provide: GetTeamsUseCase,
      useFactory: (repo: SupabaseTeamRepository) => new GetTeamsUseCase(repo),
      inject: [TEAM_REPOSITORY],
    },
    {
      provide: GetTeamByIdUseCase,
      useFactory: (repo: SupabaseTeamRepository) => new GetTeamByIdUseCase(repo),
      inject: [TEAM_REPOSITORY],
    },
    {
      provide: UpdateControleTechniqueUseCase,
      useFactory: (repo: SupabaseTeamRepository) => new UpdateControleTechniqueUseCase(repo),
      inject: [TEAM_REPOSITORY],
    },
    {
      provide: SupabaseTeamRepository,
      useFactory: (client: SupabaseClient) => new SupabaseTeamRepository(client),
      inject: [SUPABASE_CLIENT],
    },
  ],
})
export class TeamModule {}
