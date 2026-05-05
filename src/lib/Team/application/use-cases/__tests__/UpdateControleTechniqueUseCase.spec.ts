import { UpdateControleTechniqueUseCase } from '../UpdateControleTechniqueUseCase';
import { TeamRepository } from '../../../domain/TeamRepository';
import { TeamNotFoundException } from '../../../../../common/exceptions/TeamNotFoundException';
import { Team } from '../../../domain/Team';
import { TeamId } from '../../../domain/TeamId';
import { TeamStatut } from '../../../domain/TeamStatut';
import { TeamCategorie } from '../../../domain/TeamCategorie';
import { TeamEpreuve } from '../../../domain/TeamEpreuve';

function makeTeam(statut = 'inscrit'): Team {
  return new Team({
    id: new TeamId('uuid-1'),
    immatriculation: 'DE01',
    nomRobot: 'Méga-Bolt',
    categorie: new TeamCategorie('college'),
    epreuve: new TeamEpreuve('design'),
    statut: new TeamStatut(statut as 'inscrit' | 'valide' | 'controle_technique_ok' | 'disqualifie'),
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

describe('UpdateControleTechniqueUseCase', () => {
  let useCase: UpdateControleTechniqueUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UpdateControleTechniqueUseCase(mockRepository);
  });

  it('should update team statut and call repository', async () => {
    mockRepository.getOneById.mockResolvedValue(makeTeam());
    mockRepository.updateControle.mockResolvedValue();
    await useCase.execute('uuid-1', { statut: 'controle_technique_ok', notesTechnique: 'Poids OK' });
    expect(mockRepository.updateControle).toHaveBeenCalledWith(
      expect.objectContaining({ value: 'uuid-1' }),
      expect.objectContaining({ value: 'controle_technique_ok' }),
      'Poids OK',
    );
  });

  it('should throw TeamNotFoundException when team does not exist', async () => {
    mockRepository.getOneById.mockResolvedValue(null);
    await expect(useCase.execute('nonexistent', { statut: 'valide' })).rejects.toThrow(TeamNotFoundException);
  });

  it('should pass null notesTechnique when not provided', async () => {
    mockRepository.getOneById.mockResolvedValue(makeTeam());
    mockRepository.updateControle.mockResolvedValue();
    await useCase.execute('uuid-1', { statut: 'valide' });
    expect(mockRepository.updateControle).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      null,
    );
  });

  it('should throw on invalid statut value', async () => {
    mockRepository.getOneById.mockResolvedValue(makeTeam());
    await expect(
      useCase.execute('uuid-1', { statut: 'invalide' as 'valide' }),
    ).rejects.toThrow('Invalid TeamStatut');
  });
});
