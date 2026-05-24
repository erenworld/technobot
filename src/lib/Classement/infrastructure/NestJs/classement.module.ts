import { Module } from '@nestjs/common';
import { SupabaseClassementRepository } from '../repositories/SupabaseClassementRepository';
import { GetClassementsUseCase } from '../../application/use-cases/GetClassementsUseCase';
import { ClassementController } from '../../presentation/controllers/ClassementController';
import { SUPABASE_CLIENT } from '../../../../common/supabase/supabase.constants';
import { SupabaseClient } from '@supabase/supabase-js';

@Module({
  controllers: [ClassementController],
  providers: [
    {
      provide: SupabaseClassementRepository,
      useFactory: (c: SupabaseClient) => new SupabaseClassementRepository(c),
      inject: [SUPABASE_CLIENT],
    },
    {
      provide: GetClassementsUseCase,
      useFactory: (r: SupabaseClassementRepository) => new GetClassementsUseCase(r),
      inject: [SupabaseClassementRepository],
    },
  ],
})
export class ClassementModule {}
