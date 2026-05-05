import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SupabaseAuthGuard } from '../SupabaseAuthGuard';

const mockGetUser = jest.fn();
const mockFrom = jest.fn();

const mockSupabase = {
  auth: { getUser: mockGetUser },
  from: mockFrom,
};

const mockReflector = {
  getAllAndOverride: jest.fn(),
};

const mockProfile = {
  id: 'profile-uuid',
  nom: 'Dupont',
  prenom: 'Jean',
  email: 'jean@example.com',
  role: 'jury',
  etablissement_id: 'etab-uuid',
};

function buildContext(authHeader?: string): ExecutionContext {
  const request: Record<string, unknown> = {};
  if (authHeader !== undefined) {
    request['headers'] = { authorization: authHeader };
  } else {
    request['headers'] = {};
  }
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('SupabaseAuthGuard', () => {
  let guard: SupabaseAuthGuard;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReflector.getAllAndOverride.mockReturnValue(false);
    guard = new SupabaseAuthGuard(mockSupabase as never, mockReflector as never);
  });

  it('should return true with a valid token and existing profile', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'auth-uuid' } }, error: null });
    const selectMock = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }) };
    mockFrom.mockReturnValue(selectMock);

    const ctx = buildContext('Bearer valid-token');
    mockReflector.getAllAndOverride.mockReturnValue(false); // Not public
    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
  });

  it('should return true if route is marked as @Public()', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(true);
    const ctx = buildContext(undefined);
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when Authorization header is absent', async () => {
    const ctx = buildContext(undefined);
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when token is invalid or expired', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'expired' } });
    const ctx = buildContext('Bearer bad-token');
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw ForbiddenException when profile is not found in DB', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'auth-uuid' } }, error: null });
    const selectMock = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }) };
    mockFrom.mockReturnValue(selectMock);

    const ctx = buildContext('Bearer valid-token');
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('should inject user into request on success', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'auth-uuid' } }, error: null });
    const selectMock = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }) };
    mockFrom.mockReturnValue(selectMock);

    const ctx = buildContext('Bearer valid-token');
    await guard.canActivate(ctx);

    const request = ctx.switchToHttp().getRequest<{ user: unknown }>();
    expect(request.user).toMatchObject({ id: 'profile-uuid', role: 'jury' });
  });
});
