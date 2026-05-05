import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Request } from 'express';
import { SUPABASE_CLIENT } from '../supabase/supabase.constants';
import { UserRole } from '../decorators/Roles.decorator';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/Public.decorator';

export interface AuthenticatedUser {
  readonly id: string;
  readonly nom: string;
  readonly prenom: string;
  readonly email: string;
  readonly role: UserRole;
  readonly etablissement_id: string | null;
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { user: AuthenticatedUser }>();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.slice(7);

    const { data: authData, error: authError } = await this.supabase.auth.getUser(token);

    if (authError || !authData.user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const { data: profile, error: profileError } = await this.supabase
      .from('profiles')
      .select('id, nom, prenom, email, role, etablissement_id')
      .eq('auth_user_id', authData.user.id)
      .single();

    if (profileError || !profile) {
      throw new ForbiddenException('Profile not found for authenticated user');
    }

    request.user = {
      id: profile.id as string,
      nom: profile.nom as string,
      prenom: profile.prenom as string,
      email: profile.email as string,
      role: profile.role as UserRole,
      etablissement_id: profile.etablissement_id as string | null,
    };

    return true;
  }
}
