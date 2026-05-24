import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { ForbiddenException } from '@nestjs/common';
import { SupabaseAuthGuard } from '../../../../../common/guards/SupabaseAuthGuard';
import { PermissionsGuard } from '../../../../../common/guards/PermissionsGuard';

const mockGetAll = { run: jest.fn() };
const mockGetOne = { run: jest.fn() };
const mockCreate = { run: jest.fn() };
const mockEdit = { run: jest.fn() };
const mockDelete = { run: jest.fn() };

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: 'UserGetAll', useValue: mockGetAll },
        { provide: 'UserGetOneById', useValue: mockGetOne },
        { provide: 'UserCreate', useValue: mockCreate },
        { provide: 'UserEdit', useValue: mockEdit },
        { provide: 'UserDelete', useValue: mockDelete },
      ],
    })
      .overrideGuard(SupabaseAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserController>(UserController);
  });

  describe('PUT /users/:id (edit)', () => {
    it('should allow user to edit their own profile if they have MANAGE_OWN_PROFILE', async () => {
      const user = { id: 'user-1', role: 'eleve' }; // Eleve has MANAGE_OWN_PROFILE
      mockGetOne.run.mockResolvedValue({ createdAt: { value: new Date() } });
      mockEdit.run.mockResolvedValue({ toPlainObject: () => ({ id: 'user-1' }) });

      const result = await controller.edit({ id: 'user-1' }, { name: 'New Name', email: 'new@email.com' }, user as any);
      expect((result as any).id).toBe('user-1');
      expect(mockEdit.run).toHaveBeenCalled();
    });

    it('should allow admin to edit any profile', async () => {
      const user = { id: 'admin-1', role: 'admin' };
      mockGetOne.run.mockResolvedValue({ createdAt: { value: new Date() } });
      mockEdit.run.mockResolvedValue({ toPlainObject: () => ({ id: 'user-2' }) });

      const result = await controller.edit({ id: 'user-2' }, { name: 'New Name', email: 'new@email.com' }, user as any);
      expect((result as any).id).toBe('user-2');
    });

    it('should throw ForbiddenException if user tries to edit another profile without MANAGE_ALL_PROFILES', async () => {
      const user = { id: 'user-1', role: 'eleve' }; // Has manage:own but NOT manage:all
      
      await expect(
        controller.edit({ id: 'user-2' }, { name: 'New Name', email: 'new@email.com' }, user as any)
      ).rejects.toThrow(ForbiddenException);
      
      expect(mockEdit.run).not.toHaveBeenCalled();
    });
  });
});
