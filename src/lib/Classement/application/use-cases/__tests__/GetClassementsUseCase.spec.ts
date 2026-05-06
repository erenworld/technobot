import { GetClassementsUseCase } from '../GetClassementsUseCase';
import { SupabaseClassementRepository } from '../../../infrastructure/repositories/SupabaseClassementRepository';
import { ClassementEntry } from '../../../domain/ClassementEntry';

function makeEntry(rang: number, totalPoints: number, detail: Record<string, unknown> = {}): ClassementEntry {
  return new ClassementEntry({
    rang,
    teamId: `team-${rang}`,
    immatriculation: `DE0${rang}`,
    nomRobot: `Robot ${rang}`,
    etablissement: `Collège ${rang}`,
    totalPoints,
    detailScores: detail,
  });
}

const mockRepo = {
  getClassements: jest.fn(),
} as unknown as jest.Mocked<SupabaseClassementRepository>;

describe('GetClassementsUseCase', () => {
  let useCase: GetClassementsUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetClassementsUseCase(mockRepo);
  });

  it('should return colleges and lycees arrays', async () => {
    mockRepo.getClassements.mockResolvedValue({
      colleges: [makeEntry(1, 100)],
      lycees: [makeEntry(1, 280)],
    });
    const result = await useCase.execute('edition-1');
    expect(result.colleges).toHaveLength(1);
    expect(result.lycees).toHaveLength(1);
  });

  it('should pass correct editionId to repository', async () => {
    mockRepo.getClassements.mockResolvedValue({ colleges: [], lycees: [] });
    await useCase.execute('edition-abc');
    expect(mockRepo.getClassements).toHaveBeenCalledWith('edition-abc');
  });

  it('should correctly rank colleges by total points', async () => {
    mockRepo.getClassements.mockResolvedValue({
      colleges: [makeEntry(1, 100, { design: 40, presentation: 30, suivi_ligne: 30 }), makeEntry(2, 80)],
      lycees: [],
    });
    const result = await useCase.execute('edition-1');
    expect(result.colleges[0].totalPoints).toBeGreaterThan(result.colleges[1].totalPoints);
  });

  it('should compute correct sumo points for rank 1 (150 pts)', async () => {
    mockRepo.getClassements.mockResolvedValue({
      colleges: [],
      lycees: [makeEntry(1, 150 + 35, { sumo_rang: 1, sumo_points: 150, presentation: 35 })],
    });
    const result = await useCase.execute('edition-1');
    expect(result.lycees[0].detailScores.sumo_points).toBe(150);
  });

  it('should give 30 points for ranks 13 and above', async () => {
    mockRepo.getClassements.mockResolvedValue({
      colleges: [],
      lycees: [makeEntry(13, 30, { sumo_rang: 13, sumo_points: 30, presentation: 0 })],
    });
    const result = await useCase.execute('edition-1');
    expect(result.lycees[0].detailScores.sumo_points).toBe(30);
  });

  it('should propagate repository errors', async () => {
    mockRepo.getClassements.mockRejectedValue(new Error('DB error'));
    await expect(useCase.execute('edition-1')).rejects.toThrow('DB error');
  });
});
