import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { UserRepository } from '../../domain/UserRepository';
import { User } from '../../domain/User';
import { UserId } from '../../domain/UserId';
import { UserName } from '../../domain/UserName';
import { UserEmail } from '../../domain/UserEmail';
import { UserCreatedAt } from '../../domain/UserCreatedAt';
import { SUPABASE_CLIENT } from '../../../../common/supabase/supabase.constants';

@Injectable()
export class SupabaseUserRepository implements UserRepository {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  private mapToDomain(row: any) {
    return new User(
      new UserId(row.id),
      new UserName(row.name),
      new UserEmail(row.email),
      new UserCreatedAt(new Date(row.createdAt)),
    );
  }

  async getAll(): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*');

    if (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }

    return (data || []).map((row) => this.mapToDomain(row));
  }

  async getOneById(id: UserId): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id.value)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error fetching user: ${error.message}`);
    }

    return this.mapToDomain(data);
  }

  async create(user: User): Promise<void> {
    const { error } = await this.supabase.from('users').insert({
      id: user.id.value,
      name: user.name.value,
      email: user.email.value,
      createdAt: user.createdAt.value.toISOString(),
    });

    if (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  async edit(user: User): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .update({
        name: user.name.value,
        email: user.email.value,
        createdAt: user.createdAt.value.toISOString(),
      })
      .eq('id', user.id.value);

    if (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  async delete(id: UserId): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .delete()
      .eq('id', id.value);

    if (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }
}
