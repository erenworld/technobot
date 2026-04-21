import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from './supabase.constants';

@Injectable()
export class SupabaseService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly client: SupabaseClient,
  ) {}

  getClient(): SupabaseClient {
    return this.client;
  }

  async checkConnection() {
    const { error } = await this.client.from('users').select('id').limit(1);

    return {
      ok: !error,
      error: error?.message ?? null,
    };
  }
}
