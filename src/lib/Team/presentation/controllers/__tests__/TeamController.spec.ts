import { Test, TestingModule } from '@nestjs/testing';
import { TeamController } from '../TeamController';
import { GetTeamsUseCase } from '../../../application/use-cases/GetTeamsUseCase';
import { GetTeamByIdUseCase } from '../../../application/use-cases/GetTeamByIdUseCase';
import { UpdateControleTechniqueUseCase } from '../../../application/use-cases/UpdateControleTechniqueUseCase';
import { TeamNotFoundException } from '../../../../../common/exceptions/TeamNotFoundException';
import { SupabaseAuthGuard } from '../../../../../common/guards/SupabaseAuthGuard';
import { PermissionsGuard } from '../../../../../common/guards/PermissionsGuard';
import { Team } from '../../../domain/Team';
import { TeamId } from '../../../domain/TeamId';
import { TeamStatut } from '../../../domain/TeamStatut';
import { TeamCategorie } from '../../../domain/TeamCategorie';
import { TeamEpreuve } from '../../../domain/TeamEpreuve';

function makeTeam(): Team {
  return new Team({
    id: new TeamId('uuid-1'),
    immatriculation: 'DE01',
    nomRobot: 'Méga-Bolt',
    categorie: new TeamCategorie('college'),
    epreuve: new TeamEpreuve('design'),
    statut: new TeamStatut('inscrit'),
    etablissementId: 'etab-1',
    editionId: 'edit-1',
    poidsG: null,
    dimensionLxl: null,
    coutHt: null,
    notesTechnique: null,
  });
}

const mockGetTeams = { execute: jest.fn() };
const mockGetTeamById = { execute: jest.fn() };
const mockUpdateControle = { execute: jest.fn() };
const mockAuthGuard = { canActivate: jest.fn().mockReturnValue(true) };
const mockPermissionsGuard = { canActivate: jest.fn().mockReturnValue(true) };

describe('TeamController', () => {
  let controller: TeamController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamController],
      providers: [
        { provide: GetTeamsUseCase, useValue: mockGetTeams },
        { provide: GetTeamByIdUseCase, useValue: mockGetTeamById },
        { provide: UpdateControleTechniqueUseCase, useValue: mockUpdateControle },
      ],
    })
      .overrideGuard(SupabaseAuthGuard).useValue(mockAuthGuard)
      .overrideGuard(PermissionsGuard).useValue(mockPermissionsGuard)
      .compile();

    controller = module.get<TeamController>(TeamController);
  });

  describe('GET /teams', () => {
    it('should return list of teams', async () => {
      mockGetTeams.execute.mockResolvedValue([makeTeam()]);
      const result = await controller.getAll();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('uuid-1');
    });

    it('should pass query filters', async () => {
      mockGetTeams.execute.mockResolvedValue([]);
      await controller.getAll('college', 'design', 'inscrit', 'edit-1');
      expect(mockGetTeams.execute).toHaveBeenCalledWith({
        categorie: 'college',
        epreuve: 'design',
        statut: 'inscrit',
        editionId: 'edit-1',
      });
    });
  });

  describe('GET /teams/:id', () => {
    it('should return one team', async () => {
      mockGetTeamById.execute.mockResolvedValue(makeTeam());
      const result = await controller.getOne('uuid-1');
      expect(result.id).toBe('uuid-1');
    });

    it('should propagate TeamNotFoundException', async () => {
      mockGetTeamById.execute.mockRejectedValue(new TeamNotFoundException('uuid-x'));
      await expect(controller.getOne('uuid-x')).rejects.toThrow(TeamNotFoundException);
    });
  });

  describe('POST /teams/:id/controle-technique', () => {
    it('should call use case and return success', async () => {
      mockUpdateControle.execute.mockResolvedValue(undefined);
      const result = await controller.updateControleTechnique('uuid-1', { statut: 'valide' });
      expect(result).toEqual({ success: true });
    });

    it('should propagate TeamNotFoundException', async () => {
      mockUpdateControle.execute.mockRejectedValue(new TeamNotFoundException('uuid-x'));
      await expect(
        controller.updateControleTechnique('uuid-x', { statut: 'valide' }),
      ).rejects.toThrow(TeamNotFoundException);
    });
  });
});
