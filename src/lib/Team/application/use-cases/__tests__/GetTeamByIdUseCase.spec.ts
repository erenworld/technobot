import { GetTeamByIdUseCase } from '../GetTeamByIdUseCase';
import { TeamRepository } from '../../../domain/TeamRepository';
import { TeamNotFoundException } from '../../../../../common/exceptions/TeamNotFoundException';
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

const mockRepository: jest.Mocked<TeamRepository> = {
  getAll: jest.fn(),
  getOneById: jest.fn(),
  updateControle: jest.fn(),
};

describe('GetTeamByIdUseCase', () => {
  let useCase: GetTeamByIdUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetTeamByIdUseCase(mockRepository);
  });

  it('should return team when found', async () => {
    mockRepository.getOneById.mockResolvedValue(makeTeam());
    const result = await useCase.execute('uuid-1');
    expect(result.id.value).toBe('uuid-1');
  });

  it('should throw TeamNotFoundException when team does not exist', async () => {
    mockRepository.getOneById.mockResolvedValue(null);
    await expect(useCase.execute('nonexistent')).rejects.toThrow(TeamNotFoundException);
  });

  it('should call repository with correct TeamId', async () => {
    mockRepository.getOneById.mockResolvedValue(makeTeam());
    await useCase.execute('uuid-1');
    expect(mockRepository.getOneById).toHaveBeenCalledWith(expect.objectContaining({ value: 'uuid-1' }));
  });
});
