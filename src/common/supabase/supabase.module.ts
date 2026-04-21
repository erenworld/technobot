import { Global, Module } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from './supabase.constants';
import { SupabaseService } from './supabase.service';
import { SupabaseController } from './supabase.controller';

@Global()
@Module({
  providers: [
    {
      provide: SUPABASE_CLIENT,
      useFactory: () => {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!url || !key) {
          throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined');
        }

        return createClient(url, key);
      },
    },
    SupabaseService,
  ],
  exports: [SUPABASE_CLIENT, SupabaseService],
  controllers: [SupabaseController],
})
export class SupabaseModule {}
