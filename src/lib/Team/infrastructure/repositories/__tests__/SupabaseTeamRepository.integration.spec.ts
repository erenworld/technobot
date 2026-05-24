import { SupabaseTeamRepository } from '../SupabaseTeamRepository';
import { TeamId } from '../../../domain/TeamId';
import { TeamStatut } from '../../../domain/TeamStatut';

const teamRow = {
  id: 'uuid-1',
  immatriculation: 'DE01',
  nom_robot: 'Méga-Bolt',
  categorie: 'college',
  epreuve: 'design',
  statut: 'inscrit',
  etablissement_id: 'etab-1',
  edition_id: 'edit-1',
  poids_g: null,
  dimension_lxl: null,
  cout_ht: null,
  notes_technique: null,
};

function makeSupabase(fromReturn: unknown) {
  return { from: jest.fn().mockReturnValue(fromReturn) } as never;
}

describe('SupabaseTeamRepository (integration)', () => {
  describe('getAll()', () => {
    it('should return mapped teams', async () => {
      const supabase = makeSupabase({
        select: jest.fn().mockResolvedValue({ data: [teamRow], error: null }),
      });
      const repo = new SupabaseTeamRepository(supabase);
      const result = await repo.getAll({});
      expect(result).toHaveLength(1);
      expect(result[0].id.value).toBe('uuid-1');
    });

    it('should return empty array when no teams', async () => {
      const supabase = makeSupabase({
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      });
      const repo = new SupabaseTeamRepository(supabase);
      const result = await repo.getAll({});
      expect(result).toHaveLength(0);
    });

    it('should throw on Supabase error', async () => {
      const supabase = makeSupabase({
        select: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      });
      const repo = new SupabaseTeamRepository(supabase);
      await expect(repo.getAll({})).rejects.toThrow('Error fetching teams');
    });
  });

  describe('getOneById()', () => {
    it('should return team when found', async () => {
      const supabase = makeSupabase({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: teamRow, error: null }),
          }),
        }),
      });
      const repo = new SupabaseTeamRepository(supabase);
      const result = await repo.getOneById(new TeamId('uuid-1'));
      expect(result?.immatriculation).toBe('DE01');
    });

    it('should return null when team not found (PGRST116)', async () => {
      const supabase = makeSupabase({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
          }),
        }),
      });
      const repo = new SupabaseTeamRepository(supabase);
      const result = await repo.getOneById(new TeamId('uuid-x'));
      expect(result).toBeNull();
    });

    it('should throw on other Supabase errors', async () => {
      const supabase = makeSupabase({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: { code: '500', message: 'Internal' } }),
          }),
        }),
      });
      const repo = new SupabaseTeamRepository(supabase);
      await expect(repo.getOneById(new TeamId('uuid-x'))).rejects.toThrow('Error fetching team');
    });
  });

  describe('updateControle()', () => {
    it('should update correctly', async () => {
      const updateEq = jest.fn().mockResolvedValue({ error: null });
      const supabase = makeSupabase({
        update: jest.fn().mockReturnValue({ eq: updateEq }),
      });
      const repo = new SupabaseTeamRepository(supabase);
      await expect(
        repo.updateControle(new TeamId('uuid-1'), new TeamStatut('valide'), 'Tout OK'),
      ).resolves.not.toThrow();
      expect(updateEq).toHaveBeenCalledWith('id', 'uuid-1');
    });

    it('should throw on update error', async () => {
      const supabase = makeSupabase({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: { message: 'update failed' } }),
        }),
      });
      const repo = new SupabaseTeamRepository(supabase);
      await expect(
        repo.updateControle(new TeamId('uuid-1'), new TeamStatut('valide'), null),
      ).rejects.toThrow('Error updating team');
    });
  });
});
