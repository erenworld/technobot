import { CreateRencontreSumoUseCase } from '../CreateRencontreSumoUseCase';
import { GetMatchSumoUseCase } from '../GetMatchSumoUseCase';
import { MatchSumoRepository } from '../../../domain/MatchSumoRepository';
import { MatchSumo, RencontreSumo } from '../../../domain/MatchSumo';
import { MatchSumoNotFoundException } from '../../../../../common/exceptions/MatchSumoNotFoundException';
import { MatchAlreadyFinishedException } from '../../../../../common/exceptions/MatchAlreadyFinishedException';

function makeMatch(statut: 'planifie' | 'en_cours' | 'termine' = 'en_cours'): MatchSumo {
  return new MatchSumo({
    id: 'match-1',
    editionId: 'edit-1',
    epreuveId: 'ep-1',
    teamAId: 'team-a',
    teamBId: 'team-b',
    poule: 'A',
    zone: 'Sumo 1',
    heureDebut: '10:30',
    statut,
    vainqueurTeamId: null,
    observations: null,
    rencontres: [],
  });
}

function makeRencontre(): RencontreSumo {
  return new RencontreSumo({
    id: 'ren-1',
    matchId: 'match-1',
    numeroRencontre: 1,
    vainqueurId: 'team-a',
    yukoA: 1,
    yukoB: 0,
    yuseiA: 0,
    yuseiB: 0,
    configurationDepart: 'face_a_face',
    dureeSecondes: 30,
    annulee: false,
    observations: null,
  });
}

const mockRepo: jest.Mocked<MatchSumoRepository> = {
  getById: jest.fn(),
  getAll: jest.fn(),
  createRencontre: jest.fn(),
};

describe('GetMatchSumoUseCase', () => {
  let useCase: GetMatchSumoUseCase;

  beforeEach(() => { jest.clearAllMocks(); useCase = new GetMatchSumoUseCase(mockRepo); });

  it('should return match when found', async () => {
    mockRepo.getById.mockResolvedValue(makeMatch());
    const result = await useCase.execute('match-1');
    expect(result.id).toBe('match-1');
  });

  it('should throw MatchSumoNotFoundException when not found', async () => {
    mockRepo.getById.mockResolvedValue(null);
    await expect(useCase.execute('nonexistent')).rejects.toThrow(MatchSumoNotFoundException);
  });
});

describe('CreateRencontreSumoUseCase', () => {
  let useCase: CreateRencontreSumoUseCase;

  beforeEach(() => { jest.clearAllMocks(); useCase = new CreateRencontreSumoUseCase(mockRepo); });

  it('should create rencontre for an active match', async () => {
    mockRepo.getById.mockResolvedValue(makeMatch('en_cours'));
    mockRepo.createRencontre.mockResolvedValue(makeRencontre());
    const result = await useCase.execute('match-1', {
      vainqueurId: 'team-a',
      yukoA: 1,
      yukoB: 0,
      yuseiA: 0,
      yuseiB: 0,
      configurationDepart: 'face_a_face',
      dureeSecondes: 30,
      annulee: false,
      observations: null,
    });
    expect(result.matchId).toBe('match-1');
  });

  it('should throw MatchSumoNotFoundException when match not found', async () => {
    mockRepo.getById.mockResolvedValue(null);
    await expect(
      useCase.execute('nonexistent', { vainqueurId: null, yukoA: 0, yukoB: 0, yuseiA: 0, yuseiB: 0, configurationDepart: 'face_a_face', dureeSecondes: null, annulee: false, observations: null }),
    ).rejects.toThrow(MatchSumoNotFoundException);
  });

  it('should throw MatchAlreadyFinishedException when match is finished', async () => {
    mockRepo.getById.mockResolvedValue(makeMatch('termine'));
    await expect(
      useCase.execute('match-1', { vainqueurId: null, yukoA: 0, yukoB: 0, yuseiA: 0, yuseiB: 0, configurationDepart: 'face_a_face', dureeSecondes: null, annulee: false, observations: null }),
    ).rejects.toThrow(MatchAlreadyFinishedException);
    expect(mockRepo.createRencontre).not.toHaveBeenCalled();
  });
});
