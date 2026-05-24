import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from '../PermissionsGuard';
import { Permission } from '../../permissions/Permission';

function buildContext(role: string): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user: { role } }) }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as unknown as jest.Mocked<Reflector>;
    guard = new PermissionsGuard(reflector);
  });

  it('should return true when no permissions metadata is defined', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const ctx = buildContext('eleve');
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should return true when user role has the required permission', () => {
    reflector.getAllAndOverride.mockReturnValue([Permission.READ_TEAMS]);
    const ctx = buildContext('eleve');
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should throw ForbiddenException when user role lacks a required permission', () => {
    reflector.getAllAndOverride.mockReturnValue([Permission.DELETE_PROFILE]);
    const ctx = buildContext('jury');
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when multiple permissions required and one is missing', () => {
    reflector.getAllAndOverride.mockReturnValue([Permission.READ_TEAMS, Permission.DELETE_PROFILE]);
    const ctx = buildContext('organisateur'); // Has READ_TEAMS but not DELETE_PROFILE
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should return true when multiple permissions required and all are present', () => {
    reflector.getAllAndOverride.mockReturnValue([Permission.READ_TEAMS, Permission.CREATE_SCORES]);
    const ctx = buildContext('jury');
    expect(guard.canActivate(ctx)).toBe(true);
  });
});
