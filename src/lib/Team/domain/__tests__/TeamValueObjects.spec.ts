import { TeamId } from '../TeamId';
import { TeamStatut } from '../TeamStatut';
import { TeamCategorie } from '../TeamCategorie';
import { TeamEpreuve } from '../TeamEpreuve';

describe('TeamId', () => {
  it('should create with valid value', () => {
    const id = new TeamId('uuid-1');
    expect(id.value).toBe('uuid-1');
  });

  it('should throw on empty string', () => {
    expect(() => new TeamId('')).toThrow('TeamId cannot be empty');
  });

  it('should throw on whitespace-only string', () => {
    expect(() => new TeamId('   ')).toThrow('TeamId cannot be empty');
  });
});

describe('TeamStatut', () => {
  it.each(['inscrit', 'valide', 'controle_technique_ok', 'disqualifie'] as const)(
    'should accept valid statut: %s',
    (statut) => {
      expect(new TeamStatut(statut).value).toBe(statut);
    },
  );

  it('should throw on invalid statut', () => {
    expect(() => new TeamStatut('invalide' as 'valide')).toThrow('Invalid TeamStatut');
  });

  it('isDisqualified should return true for disqualifie', () => {
    expect(new TeamStatut('disqualifie').isDisqualified()).toBe(true);
  });

  it('isDisqualified should return false for other values', () => {
    expect(new TeamStatut('valide').isDisqualified()).toBe(false);
  });
});

describe('TeamCategorie', () => {
  it('should accept college', () => {
    expect(new TeamCategorie('college').value).toBe('college');
  });

  it('should accept lycee', () => {
    expect(new TeamCategorie('lycee').value).toBe('lycee');
  });

  it('should throw on invalid categorie', () => {
    expect(() => new TeamCategorie('invalid' as 'college')).toThrow('Invalid TeamCategorie');
  });
});

describe('TeamEpreuve', () => {
  it.each(['design', 'presentation_projet', 'suivi_ligne', 'formule_robot', 'sumo'] as const)(
    'should accept valid epreuve: %s',
    (epreuve) => {
      expect(new TeamEpreuve(epreuve).value).toBe(epreuve);
    },
  );

  it('should throw on invalid epreuve', () => {
    expect(() => new TeamEpreuve('invalid' as 'sumo')).toThrow('Invalid TeamEpreuve');
  });
});
