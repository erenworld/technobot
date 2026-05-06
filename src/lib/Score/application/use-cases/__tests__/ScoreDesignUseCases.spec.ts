import { CreateScoreDesignUseCase } from '../CreateScoreDesignUseCase';
import { UpdateScoreDesignUseCase } from '../UpdateScoreDesignUseCase';
import { ScoreDesignRepository } from '../../../domain/ScoreDesignRepository';
import { ScoreDesign } from '../../../domain/ScoreDesign';
import { ScoreAlreadyExistsException } from '../../../../../common/exceptions/ScoreAlreadyExistsException';
import { UnauthorizedScoreModificationException } from '../../../../../common/exceptions/UnauthorizedScoreModificationException';
import { ScoreNotFoundException } from '../../../../../common/exceptions/ScoreNotFoundException';

const baseScoreData = {
  teamId: 'team-1',
  juryId: 'jury-1',
  accessInterrupteur: 2,
  refroidCarte: 2,
  acesCableProg: 2,
  facilitePiles: 2,
  solidite: 2,
  homogeneite: 2,
  oeuvreOriginale: 2,
  qualiteVisuelle: 2,
  dissimulationPieces: 2,
  qualiteAffiche: 2,
  qualiteEchange: 2,
  bonusSuiviOvale: false,
  bonusConnecte: false,
  observations: null,
};

function makeScore(juryId = 'jury-1'): ScoreDesign {
  return new ScoreDesign({ id: 'score-1', ...baseScoreData, juryId, total: 22 });
}

const mockRepo: jest.Mocked<ScoreDesignRepository> = {
  create: jest.fn(),
  getById: jest.fn(),
  update: jest.fn(),
};

describe('CreateScoreDesignUseCase', () => {
  let useCase: CreateScoreDesignUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateScoreDesignUseCase(mockRepo);
  });

  it('should create score when jury_id matches connected user', async () => {
    mockRepo.create.mockResolvedValue(makeScore());
    const result = await useCase.execute(baseScoreData, 'jury-1');
    expect(result.juryId).toBe('jury-1');
  });

  it('should throw UnauthorizedScoreModificationException when jury_id does not match', async () => {
    await expect(useCase.execute(baseScoreData, 'other-jury')).rejects.toThrow(
      UnauthorizedScoreModificationException,
    );
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it('should throw ScoreAlreadyExistsException on unique constraint error', async () => {
    mockRepo.create.mockRejectedValue(new Error('duplicate key 23505'));
    await expect(useCase.execute(baseScoreData, 'jury-1')).rejects.toThrow(ScoreAlreadyExistsException);
  });

  it('should propagate other errors', async () => {
    mockRepo.create.mockRejectedValue(new Error('DB error'));
    await expect(useCase.execute(baseScoreData, 'jury-1')).rejects.toThrow('DB error');
  });
});

describe('UpdateScoreDesignUseCase', () => {
  let useCase: UpdateScoreDesignUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UpdateScoreDesignUseCase(mockRepo);
  });

  it('should update score when jury owns it', async () => {
    mockRepo.getById.mockResolvedValue(makeScore('jury-1'));
    mockRepo.update.mockResolvedValue(makeScore('jury-1'));
    const result = await useCase.execute('score-1', { solidite: 1 }, 'jury-1');
    expect(result).toBeTruthy();
  });

  it('should throw ScoreNotFoundException when score not found', async () => {
    mockRepo.getById.mockResolvedValue(null);
    await expect(useCase.execute('nonexistent', {}, 'jury-1')).rejects.toThrow(ScoreNotFoundException);
  });

  it('should throw UnauthorizedScoreModificationException when jury does not own score', async () => {
    mockRepo.getById.mockResolvedValue(makeScore('other-jury'));
    await expect(useCase.execute('score-1', {}, 'jury-1')).rejects.toThrow(
      UnauthorizedScoreModificationException,
    );
    expect(mockRepo.update).not.toHaveBeenCalled();
  });
});
