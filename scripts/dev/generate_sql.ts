import * as fs from 'fs';

const prefixMap: Record<string, string> = {
  'edit': '11111111', 'etab': '22222222', 'prof': '33333333', 'epre': '44444444',
  'team': '55555555', 'tmem': '66666666', 'plan': '77777777', 'sdes': '88888888',
  'spco': '99999999', 'ssli': 'aaaaaaaa', 'sply': 'bbbbbbbb', 'msum': 'cccccccc',
  'rsum': 'dddddddd', 'noti': 'eeeeeeee'
};

const getUuid = (prefixStr: string, index: number) => {
  const p = prefixMap[prefixStr] || 'ffffffff';
  const i = index.toString().padStart(12, '0');
  return `${p}-0000-4000-8000-${i}`;
};

function formatValue(val: any): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  return val.toString();
}

function generateInsert(table: string, data: any[]) {
  if (data.length === 0) return '';
  const columns = Object.keys(data[0]);
  const rows = data.map(obj => `(${columns.map(c => formatValue(obj[c])).join(', ')})`);
  return `INSERT INTO ${table} (${columns.join(', ')})\nVALUES\n${rows.join(',\n')}\nON CONFLICT (id) DO NOTHING;\n\n`;
}

let sql = '';

const editions = [{ id: getUuid('edit', 1), annee: 2026, date_finale: '2026-06-05', lieu: 'Gymnase Mermoz de Yutz', statut: 'en_cours', description: 'Édition 2026 du tournoi TechnoBot' }];
sql += generateInsert('editions', editions);

const dataColleges = [
  { nom: 'Collège Robert Schuman', ville: 'Hombourg-Haut' }, { nom: 'Collège Jean Mermoz', ville: 'Yutz' },
  { nom: 'Collège Jean-Baptiste Éblé', ville: 'Puttelange aux Lacs' }, { nom: 'Collège Saint Pierre Chanel', ville: 'Thionville' },
  { nom: 'Collège Charles De Gaulle', ville: 'Fameck' }, { nom: 'Collège Paul Emile Victor', ville: 'Corcieux' },
  { nom: 'Collège Guy Dolmaire', ville: 'Mirecourt' }, { nom: 'Collège Emilie du Châtelet', ville: 'Vaubecourt' },
  { nom: 'Collège Saint Vincent de Paul', ville: 'Algrange' }, { nom: 'Collège Lionel TERRAY', ville: 'Aumetz' },
  { nom: 'Collège Fulrad', ville: 'Sarreguemines' }, { nom: 'Collège Fictif de Lorraine', ville: 'Metz' }
];

const dataLycees = [
  { nom: 'Lycée Mermoz', ville: 'Saint-Louis' }, { nom: 'Lycée La Briquerie', ville: 'Thionville' },
  { nom: 'HTL Innsbrück', ville: 'Innsbrück (Allemagne)' }, { nom: 'Lycée Julie Daubié', ville: 'Rombas' }
];

const etablissements = [
  ...dataColleges.map((c, i) => ({ id: getUuid('etab', i + 1), nom: c.nom, ville: c.ville, type: 'college' })),
  ...dataLycees.map((l, i) => ({ id: getUuid('etab', 100 + i + 1), nom: l.nom, ville: l.ville, type: 'lycee' }))
];
sql += generateInsert('etablissements', etablissements);

const profiles = [];
let profIdx = 1;
profiles.push({ id: getUuid('prof', profIdx++), auth_user_id: null, email: 'admin@technobot.fr', nom: 'Admin', prenom: 'Super', role: 'admin', etablissement_id: null });
profiles.push({ id: getUuid('prof', profIdx++), auth_user_id: null, email: 'organisateur1@technobot.fr', nom: 'Orga', prenom: 'Un', role: 'organisateur', etablissement_id: null });
profiles.push({ id: getUuid('prof', profIdx++), auth_user_id: null, email: 'organisateur2@technobot.fr', nom: 'Orga', prenom: 'Deux', role: 'organisateur', etablissement_id: null });
for(let i=1; i<=4; i++) profiles.push({ id: getUuid('prof', profIdx++), auth_user_id: null, email: `jury${i}@technobot.fr`, nom: `Jury`, prenom: `${i}`, role: 'jury', etablissement_id: null });

const prenomsEleves = ['Lucas', 'Emma', 'Hugo', 'Chloé', 'Arthur', 'Léa', 'Louis', 'Manon', 'Jules', 'Camille', 'Gabriel', 'Sarah', 'Maël', 'Clara', 'Mathis', 'Inès', 'Tom', 'Zoé', 'Raphaël', 'Lola'];
let prenomIdx = 0;
for (const etab of etablissements) {
  for(let e=1; e<=2; e++) profiles.push({ id: getUuid('prof', profIdx++), auth_user_id: null, email: `enseignant${e}.${etab.id.substring(24)}@technobot.fr`, nom: 'Prof', prenom: `${etab.nom.substring(0,3)}${e}`, role: 'enseignant', etablissement_id: etab.id });
  const nbEleves = etab.type === 'college' ? 3 : 5;
  for(let e=1; e<=nbEleves; e++) {
    const prenom = prenomsEleves[prenomIdx % prenomsEleves.length];
    prenomIdx++;
    profiles.push({ id: getUuid('prof', profIdx++), auth_user_id: null, email: `eleve${e}.${etab.id.substring(24)}@technobot.fr`, nom: 'Eleve', prenom: prenom, role: 'eleve', etablissement_id: etab.id });
  }
}
sql += generateInsert('profiles', profiles);

const epreuves = [
  { id: getUuid('epre', 1), edition_id: getUuid('edit', 1), nom: 'Design', type: 'design', categorie: 'college' },
  { id: getUuid('epre', 2), edition_id: getUuid('edit', 1), nom: 'Présentation Projet Collèges', type: 'presentation', categorie: 'college' },
  { id: getUuid('epre', 3), edition_id: getUuid('edit', 1), nom: 'Suivi de Ligne', type: 'suivi_ligne', categorie: 'college' },
  { id: getUuid('epre', 4), edition_id: getUuid('edit', 1), nom: 'Formule Robot', type: 'formule_robot', categorie: 'college' },
  { id: getUuid('epre', 5), edition_id: getUuid('edit', 1), nom: 'Sumo Lycées', type: 'sumo', categorie: 'lycee' },
  { id: getUuid('epre', 6), edition_id: getUuid('edit', 1), nom: 'Présentation Projet Lycées', type: 'presentation', categorie: 'lycee' }
];
sql += generateInsert('epreuves', epreuves);

const teams = [];
const nomsRobots = ['Méga-Bolt', 'RoboZilla', 'Iron Baguette', 'Speedy', 'Titanium', 'AstroBot', 'NinjaGear', 'CyberPunk', 'Optimus', 'Wall-E', 'R2D2', 'Terminator'];
const colls = etablissements.filter(e => e.type === 'college');
for (let i = 1; i <= 12; i++) {
  const etabId = colls[(i - 1) % colls.length].id;
  const num = i.toString().padStart(2, '0');
  teams.push({ id: getUuid('team', i), edition_id: getUuid('edit', 1), etablissement_id: etabId, immatriculation: `DE${num}`, nom_robot: nomsRobots[(i-1)%nomsRobots.length] + ' DE', categorie: 'college', epreuve: 'design', statut: 'controle_technique_ok' });
  teams.push({ id: getUuid('team', 20 + i), edition_id: getUuid('edit', 1), etablissement_id: etabId, immatriculation: `PP${num}`, nom_robot: nomsRobots[(i-1)%nomsRobots.length] + ' PP', categorie: 'college', epreuve: 'presentation_projet', statut: 'controle_technique_ok' });
  teams.push({ id: getUuid('team', 40 + i), edition_id: getUuid('edit', 1), etablissement_id: etabId, immatriculation: `SDL${num}`, nom_robot: nomsRobots[(i-1)%nomsRobots.length] + ' SL', categorie: 'college', epreuve: 'suivi_ligne', statut: 'controle_technique_ok' });
  teams.push({ id: getUuid('team', 60 + i), edition_id: getUuid('edit', 1), etablissement_id: etabId, immatriculation: `FR${num}`, nom_robot: nomsRobots[(i-1)%nomsRobots.length] + ' FR', categorie: 'college', epreuve: 'formule_robot', statut: 'controle_technique_ok' });
}
const lycs = etablissements.filter(e => e.type === 'lycee');
let sumoIdx = 1;
for (const lyc of lycs) {
  for (let r = 1; r <= 5; r++) {
    const num = sumoIdx.toString().padStart(2, '0');
    teams.push({ id: getUuid('team', 100 + sumoIdx), edition_id: getUuid('edit', 1), etablissement_id: lyc.id, immatriculation: `SL${num}`, nom_robot: nomsRobots[sumoIdx % nomsRobots.length] + ' Sumo', categorie: 'lycee', epreuve: 'sumo', statut: 'controle_technique_ok' });
    sumoIdx++;
  }
}
sql += generateInsert('teams', teams);

const teamMembers = [];
let tmIdx = 1;
for (const team of teams) {
  const eleves = profiles.filter(p => p.role === 'eleve' && p.etablissement_id === team.etablissement_id);
  for (const el of eleves.slice(0, 5)) {
    teamMembers.push({ id: getUuid('tmem', tmIdx++), team_id: team.id, profile_id: el.id, role_dans_equipe: 'membre' });
  }
}
sql += generateInsert('team_members', teamMembers);

const planningSlots = [];
let planIdx = 1;
const getTeamIdByImmat = (immat: string, epreuve: string) => teams.find(t => t.immatriculation === immat && t.epreuve === epreuve)?.id;
const poules = [
  { p: 'A', z: 'Sumo 1', rDeb: '12:30', rFin: '13:50', pDeb: '10:30', immats: ['SL01', 'SL04', 'SL08', 'SL12', 'SL17'] },
  { p: 'B', z: 'Sumo 2', rDeb: '12:30', rFin: '13:50', pDeb: '11:00', immats: ['SL02', 'SL05', 'SL09', 'SL13', 'SL18'] },
  { p: 'C', z: 'Sumo 1', rDeb: '10:30', rFin: '11:50', pDeb: '12:50', immats: ['SL03', 'SL06', 'SL10', 'SL14', 'SL19'] },
  { p: 'D', z: 'Sumo 2', rDeb: '10:30', rFin: '11:50', pDeb: '13:10', immats: ['SL07', 'SL11', 'SL15', 'SL16', 'SL20'] },
];
poules.forEach(poule => {
  poule.immats.forEach((immat, index) => {
    const heurePresParts = poule.pDeb.split(':');
    let m = parseInt(heurePresParts[1]) + index * 5;
    let h = parseInt(heurePresParts[0]) + Math.floor(m / 60);
    m = m % 60;
    const hPresStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
    planningSlots.push({ id: getUuid('plan', planIdx++), team_id: getTeamIdByImmat(immat, 'sumo'), epreuve_id: getUuid('epre', 5), poule: poule.p, jury_vestiaire: index % 2 === 0 ? 'Vestiaire 1' : 'Vestiaire 2', heure_presentation: hPresStr, heure_debut_rencontres: poule.rDeb + ':00', heure_fin_rencontres: poule.rFin + ':00', zone_rencontres: poule.z, salle_presentation: 'Salle', observations: '' });
  });
});
teams.filter(t => t.categorie === 'college').forEach((team, index) => {
  const h = 10 + Math.floor(index / 10);
  const m = (index % 10) * 6;
  const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
  planningSlots.push({ id: getUuid('plan', planIdx++), team_id: team.id, epreuve_id: epreuves.find(e => e.type === team.epreuve)?.id, poule: index % 2 === 0 ? 'A' : 'B', jury_vestiaire: index % 2 === 0 ? 'Vestiaire 1' : 'Vestiaire 2', heure_presentation: timeStr, heure_debut_rencontres: timeStr, heure_fin_rencontres: timeStr, zone_rencontres: index % 2 === 0 ? 'Piste 1' : 'Piste 2', salle_presentation: 'Salle' });
});
sql += generateInsert('planning_slots', planningSlots);

const scoresDesign = []; let sdIdx = 1;
const designTeams = teams.filter(t => t.immatriculation.startsWith('DE') && t.epreuve === 'design');
designTeams.forEach((team, index) => {
  const scoreBase = 10 + (index % 5);
  scoresDesign.push({ id: getUuid('sdes', sdIdx++), team_id: team.id, jury_id: profiles.find(p => p.role === 'jury')?.id, access_interrupteur: scoreBase % 3, refroid_carte: scoreBase % 3, acces_cable_prog: scoreBase % 3, facilite_piles: scoreBase % 3, solidite: scoreBase % 3, homogeneite: scoreBase % 3, oeuvre_originale: scoreBase % 3, qualite_visuelle: scoreBase % 3, dissimulation_pieces: scoreBase % 3, qualite_affiche: scoreBase % 3, qualite_echange: scoreBase % 3, bonus_suivi_ovale: index % 4 === 0, bonus_connecte: index % 5 === 0, observations: index % 2 === 0 ? 'Très beau design, bravo !' : 'Un peu fragile mais original.' });
});
sql += generateInsert('scores_design', scoresDesign);

const scoresPresCol = []; let spcIdx = 1;
const presColTeams = teams.filter(t => t.immatriculation.startsWith('PP') && t.epreuve === 'presentation_projet');
presColTeams.forEach((team, index) => {
  const note = 12 + (index % 6);
  scoresPresCol.push({ id: getUuid('spco', spcIdx++), team_id: team.id, jury_id: profiles.find(p => p.role === 'jury')?.id, aisance: note % 4, langues: note % 4, contenu: note % 4, outils: note % 4, bonus_suivi_ovale: index % 3 === 0, bonus_connecte: false, observations: index % 3 === 0 ? 'Excellente présentation, très claire.' : 'Bon effort, mais peut mieux faire sur les outils.' });
});
sql += generateInsert('scores_presentation_colleges', scoresPresCol);

const scoresSuiviLigne = []; let sslIdx = 1;
const suiviTeams = teams.filter(t => t.epreuve === 'suivi_ligne' && t.categorie === 'college');
suiviTeams.forEach((team, index) => {
  const fini = index % 3 !== 0;
  const temps = fini ? 20 + (index * 5) % 100 : null;
  const distance = fini ? 100 : 30 + (index * 10) % 60;
  scoresSuiviLigne.push({ id: getUuid('ssli', sslIdx++), team_id: team.id, jury_id: profiles.find(p => p.role === 'jury')?.id, distance_pct: distance, parcours_fini: fini, temps_secondes: temps, bonus_trace_1: true, bonus_trace_2: fini, bonus_trace_3: fini, bonus_trace_4: index % 2 === 0, bonus_trace_5: false, bonus_trace_6: false, observations: fini ? 'Super temps !' : 'Robot bloqué au virage 2.' });
});
sql += generateInsert('scores_suivi_ligne', scoresSuiviLigne);

const scoresPresLyc = []; let splIdx = 1;
const sumoTeams = teams.filter(t => t.epreuve === 'sumo' && t.categorie === 'lycee');
sumoTeams.forEach((team, index) => {
  const note = 10 + (index % 10);
  scoresPresLyc.push({ id: getUuid('sply', splIdx++), team_id: team.id, jury_id: profiles.find(p => p.role === 'jury')?.id, repartition_temps_parole: note % 5, qualite_visuel_presentation: note % 5, justesse_technique: note % 5, competences_linguistiques: note % 5, vocabulaire_technique: note % 5, dossier_technique_lv: note % 5, echanges_techniques: note % 5, observations: index % 4 === 0 ? 'Impressionnant !' : 'Bonne présentation générale.' });
});
sql += generateInsert('scores_presentation_lycees', scoresPresLyc);

const matchsSumo = []; const rencontresSumo = []; let matchIdx = 1; let rencIdx = 1;
poules.forEach(poule => {
  const tIds = poule.immats.map(immat => getTeamIdByImmat(immat, 'sumo'));
  for (let i = 0; i < tIds.length; i++) {
    for (let j = i + 1; j < tIds.length; j++) {
      const teamA = tIds[i]; const teamB = tIds[j];
      const matchId = getUuid('msum', matchIdx++);
      const vainqueur = (i + j) % 2 === 0 ? teamA : teamB;
      matchsSumo.push({ id: matchId, edition_id: getUuid('edit', 1), epreuve_id: getUuid('epre', 5), team_a_id: teamA, team_b_id: teamB, poule: poule.p, zone: poule.z, heure_debut: poule.rDeb + ':00', statut: 'termine', vainqueur_team_id: vainqueur, observations: 'Match très disputé.' });
      for (let r = 1; r <= 3; r++) {
        const annulee = (r === 3 && (i+j+r)%7 === 0);
        const rVainqueur = annulee ? null : (r % 2 === 0 ? teamA : teamB);
        rencontresSumo.push({ id: getUuid('rsum', rencIdx++), match_id: matchId, numero_rencontre: r, vainqueur_id: rVainqueur, yuko_a: rVainqueur === teamA ? 1 : 0, yuko_b: rVainqueur === teamB ? 1 : 0, yusei_a: 0, yusei_b: 0, configuration_depart: (i+j+r) % 2 === 0 ? 'flanc_droit' : 'dos_a_dos', duree_secondes: annulee ? null : 15 + ((i+j+r) % 45), annulee: annulee, observations: annulee ? 'Problème technique' : null });
      }
    }
  }
});
sql += generateInsert('matchs_sumo', matchsSumo);
sql += generateInsert('rencontres_sumo', rencontresSumo);

const notifications = [
  { id: getUuid('noti', 1), profile_id: profiles.find(p => p.role === 'admin')?.id, titre: 'Bienvenue sur TechnoBot', message: 'Le système est prêt pour l\'édition 2026.', type: 'info', lu: false },
  { id: getUuid('noti', 2), profile_id: profiles.find(p => p.role === 'organisateur')?.id, titre: 'Alerte Planning', message: 'Retard sur la zone Sumo 1.', type: 'alerte', lu: true },
  { id: getUuid('noti', 3), profile_id: profiles.find(p => p.role === 'jury')?.id, titre: 'Nouveaux scores enregistrés', message: 'Les scores de l\'équipe SL04 ont été validés.', type: 'resultat', lu: false }
];
sql += generateInsert('notifications', notifications);

fs.writeFileSync('c:\\dev\\Technobot\\scripts\\dev\\dump.sql', sql);
console.log('Done generating SQL!');
