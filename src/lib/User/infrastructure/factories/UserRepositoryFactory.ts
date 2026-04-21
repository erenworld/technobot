import { Provider } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { UserRepository } from '../../domain/UserRepository';
import { InMemoryUserRepository } from '../InMemoryUserRepository';
import { SupabaseUserRepository } from '../Supabase/SupabaseUserRepository';
import { SUPABASE_CLIENT } from '../../../../common/supabase/supabase.constants';

export const USER_REPOSITORY = 'UserRepository';

export const userRepositoryFactoryProvider: Provider = {
  provide: USER_REPOSITORY,
  inject: [SUPABASE_CLIENT],
  useFactory: (supabase: SupabaseClient): UserRepository => {
    const driver = process.env.USER_REPOSITORY_DRIVER ?? 'supabase';

    if (driver === 'memory') {
      return new InMemoryUserRepository();
    }

    return new SupabaseUserRepository(supabase);
  },
};
