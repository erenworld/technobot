import { Test, TestingModule } from '@nestjs/testing';
import { MatchSumoController } from '../MatchSumoController';
import { GetMatchSumoUseCase } from '../../../application/use-cases/GetMatchSumoUseCase';
import { GetMatchsSumoUseCase } from '../../../application/use-cases/GetMatchsSumoUseCase';
import { CreateRencontreSumoUseCase } from '../../../application/use-cases/CreateRencontreSumoUseCase';
import { SupabaseAuthGuard } from '../../../../../common/guards/SupabaseAuthGuard';
import { PermissionsGuard } from '../../../../../common/guards/PermissionsGuard';
import { MatchSumo } from '../../../domain/MatchSumo';

const mockMatch = new MatchSumo({
  id: 'match-1',
  editionId: 'edit-1',
  epreuveId: 'ep-1',
  teamAId: 'team-a',
  teamBId: 'team-b',
  poule: 'A',
  zone: 'Sumo 1',
  heureDebut: '10:00',
  statut: 'planifie',
  vainqueurTeamId: null,
  observations: null,
  rencontres: [],
});

const mockGetMatch = { execute: jest.fn() };
const mockGetMatchs = { execute: jest.fn() };
const mockCreateRencontre = { execute: jest.fn() };
const mockAuthGuard = { canActivate: jest.fn().mockReturnValue(true) };
const mockPermGuard = { canActivate: jest.fn().mockReturnValue(true) };

describe('MatchSumoController', () => {
  let controller: MatchSumoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchSumoController],
      providers: [
        { provide: GetMatchSumoUseCase, useValue: mockGetMatch },
        { provide: GetMatchsSumoUseCase, useValue: mockGetMatchs },
        { provide: CreateRencontreSumoUseCase, useValue: mockCreateRencontre },
      ],
    })
      .overrideGuard(SupabaseAuthGuard).useValue(mockAuthGuard)
      .overrideGuard(PermissionsGuard).useValue(mockPermGuard)
      .compile();

    controller = module.get<MatchSumoController>(MatchSumoController);
  });

  describe('GET /matchs-sumo', () => {
    it('should return all matchs with filters', async () => {
      mockGetMatchs.execute.mockResolvedValue([mockMatch]);
      const result = await controller.getAll('edit-1', 'A', 'Sumo 1', 'planifie');
      
      expect(result).toHaveLength(1);
      expect(mockGetMatchs.execute).toHaveBeenCalledWith({
        editionId: 'edit-1',
        poule: 'A',
        zone: 'Sumo 1',
        statut: 'planifie',
      });
    });
  });

  describe('GET /matchs-sumo/:id', () => {
    it('should return a single match', async () => {
      mockGetMatch.execute.mockResolvedValue(mockMatch);
      const result = await controller.getMatch('match-1');
      expect(result.id).toBe('match-1');
    });
  });

  describe('POST /matchs-sumo/:id/rencontres', () => {
    it('should create a rencontre', async () => {
      mockCreateRencontre.execute.mockResolvedValue({ id: 'ren-1', toPlainObject: () => ({ id: 'ren-1' }) });
      const result = await controller.createRencontre('match-1', {
        vainqueur_id: 'team-a',
        yuko_a: 1,
        yuko_b: 0,
        yusei_a: 0,
        yusei_b: 0,
        configuration_depart: 'face_a_face',
        duree_secondes: 30,
        annulee: false,
        observations: null,
      });
      expect(result.id).toBe('ren-1');
    });
  });
});
