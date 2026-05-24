import { useEffect, useState } from 'react';
import { Categorie, Epreuve, Team } from '../types/api';
import { api } from './api';

/**
 * Charge les équipes pour un filtre épreuve/catégorie donné.
 *
 * Tant que la base Supabase n'est pas peuplée (ou que l'API renvoie une
 * liste vide / une erreur), on retombe sur un jeu de démonstration afin que
 * l'interface de notation reste utilisable. `usingMock` permet de le signaler.
 */

type Filter = { epreuve: Epreuve; categorie?: Categorie };

type TeamsState = {
  teams: Team[];
  loading: boolean;
  error: string | null;
  usingMock: boolean;
};

const IDLE: TeamsState = { teams: [], loading: false, error: null, usingMock: false };

const MOCK_TEAMS: Team[] = [
  // Design — collèges
  { id: '5e1b0a10-0000-4000-8000-000000000001', edition_id: 'demo', immatriculation: 'DE01', nom_robot: 'Mega-Bolt', etablissement: 'Collège Jean Mermoz · Yutz', categorie: 'college', epreuve: 'design', statut: 'controle_technique_ok' },
  { id: '5e1b0a10-0000-4000-8000-000000000002', edition_id: 'demo', immatriculation: 'DE02', nom_robot: 'Pixel', etablissement: 'Collège Robert Schuman · Hombourg-Haut', categorie: 'college', epreuve: 'design', statut: 'controle_technique_ok' },
  { id: '5e1b0a10-0000-4000-8000-000000000003', edition_id: 'demo', immatriculation: 'DE03', nom_robot: 'Cuivre', etablissement: 'Collège Saint Pierre Chanel · Thionville', categorie: 'college', epreuve: 'design', statut: 'valide' },
  // Présentation de projet — collèges
  { id: '5e1b0a10-0000-4000-8000-000000000011', edition_id: 'demo', immatriculation: 'PC01', nom_robot: 'Atlas', etablissement: 'Collège Charles De Gaulle · Fameck', categorie: 'college', epreuve: 'presentation_projet', statut: 'controle_technique_ok' },
  { id: '5e1b0a10-0000-4000-8000-000000000012', edition_id: 'demo', immatriculation: 'PC02', nom_robot: 'Lynx', etablissement: 'Collège Guy Dolmaire · Mirecourt', categorie: 'college', epreuve: 'presentation_projet', statut: 'controle_technique_ok' },
  { id: '5e1b0a10-0000-4000-8000-000000000013', edition_id: 'demo', immatriculation: 'PC03', nom_robot: 'Boréal', etablissement: 'Collège Paul Emile Victor · Corcieux', categorie: 'college', epreuve: 'presentation_projet', statut: 'valide' },
  // Présentation en LV — lycées
  { id: '5e1b0a10-0000-4000-8000-000000000021', edition_id: 'demo', immatriculation: 'PL01', nom_robot: 'RoboZilla', etablissement: 'Lycée La Briquerie · Thionville', categorie: 'lycee', epreuve: 'presentation_projet', statut: 'controle_technique_ok' },
  { id: '5e1b0a10-0000-4000-8000-000000000022', edition_id: 'demo', immatriculation: 'PL02', nom_robot: 'Helios', etablissement: 'Lycée Mermoz · Saint-Louis', categorie: 'lycee', epreuve: 'presentation_projet', statut: 'controle_technique_ok' },
  { id: '5e1b0a10-0000-4000-8000-000000000023', edition_id: 'demo', immatriculation: 'PL03', nom_robot: 'Vortex', etablissement: 'Lycée Julie Daubié · Rombas', categorie: 'lycee', epreuve: 'presentation_projet', statut: 'valide' },
  // Suivi de ligne — collèges
  { id: '5e1b0a10-0000-4000-8000-000000000031', edition_id: 'demo', immatriculation: 'SL01', nom_robot: 'Flash', etablissement: 'Collège Jean Mermoz · Yutz', categorie: 'college', epreuve: 'suivi_ligne', statut: 'controle_technique_ok' },
  { id: '5e1b0a10-0000-4000-8000-000000000032', edition_id: 'demo', immatriculation: 'SL02', nom_robot: 'Comète', etablissement: 'Collège Robert Schuman · Hombourg-Haut', categorie: 'college', epreuve: 'suivi_ligne', statut: 'controle_technique_ok' },
  { id: '5e1b0a10-0000-4000-8000-000000000033', edition_id: 'demo', immatriculation: 'SL03', nom_robot: 'Sprint', etablissement: 'Collège Fulrad · Sarreguemines', categorie: 'college', epreuve: 'suivi_ligne', statut: 'valide' },
];

function mockFor(filter: Filter): Team[] {
  return MOCK_TEAMS.filter(
    (t) =>
      t.epreuve === filter.epreuve &&
      (!filter.categorie || t.categorie === filter.categorie),
  );
}

export function useTeams(filter: Filter | null): TeamsState {
  const [state, setState] = useState<TeamsState>(IDLE);

  const epreuve = filter?.epreuve;
  const categorie = filter?.categorie;

  useEffect(() => {
    if (!filter) {
      setState(IDLE);
      return;
    }

    let cancelled = false;
    setState({ teams: [], loading: true, error: null, usingMock: false });
    const mock = mockFor(filter);

    api.teams
      .list(filter)
      .then((teams) => {
        if (cancelled) return;
        if (teams.length) {
          setState({ teams, loading: false, error: null, usingMock: false });
        } else {
          setState({ teams: mock, loading: false, error: null, usingMock: true });
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setState({
          teams: mock,
          loading: false,
          error: err instanceof Error ? err.message : 'Erreur API',
          usingMock: true,
        });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [epreuve, categorie]);

  return state;
}
