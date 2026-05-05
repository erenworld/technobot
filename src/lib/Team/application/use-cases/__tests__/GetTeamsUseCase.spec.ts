import { GetTeamsUseCase } from '../GetTeamsUseCase';
import { TeamRepository } from '../../../domain/TeamRepository';
import { Team } from '../../../domain/Team';
import { TeamId } from '../../../domain/TeamId';
import { TeamStatut } from '../../../domain/TeamStatut';
import { TeamCategorie } from '../../../domain/TeamCategorie';
import { TeamEpreuve } from '../../../domain/TeamEpreuve';

function makeTeam(id = 'uuid-1'): Team {
  return new Team({
    id: new TeamId(id),
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

describe('GetTeamsUseCase', () => {
  let useCase: GetTeamsUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetTeamsUseCase(mockRepository);
  });

  it('should return all teams when no filter is applied', async () => {
    mockRepository.getAll.mockResolvedValue([makeTeam('1'), makeTeam('2')]);
    const result = await useCase.execute({});
    expect(result).toHaveLength(2);
    expect(mockRepository.getAll).toHaveBeenCalledWith({});
  });

  it('should pass filters to the repository', async () => {
    mockRepository.getAll.mockResolvedValue([]);
    await useCase.execute({ categorie: 'college', statut: 'inscrit' });
    expect(mockRepository.getAll).toHaveBeenCalledWith({ categorie: 'college', statut: 'inscrit' });
  });

  it('should return empty array when no teams match filters', async () => {
    mockRepository.getAll.mockResolvedValue([]);
    const result = await useCase.execute({ epreuve: 'sumo' });
    expect(result).toHaveLength(0);
  });

  it('should propagate repository errors', async () => {
    mockRepository.getAll.mockRejectedValue(new Error('DB error'));
    await expect(useCase.execute({})).rejects.toThrow('DB error');
  });
});
