/**
 * Script pour supprimer facilement toutes les données de test (seed) générées.
 * 
 * Ce script supprime uniquement les enregistrements dont l'ID contient la signature 
 * "-0000-4000-8000-", qui est celle utilisée par notre script de seed.
 * 
 * Comment lancer :
 * npx ts-node -r dotenv/config scripts/dev/clear_seed.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'your-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const tables = [
  'notifications',
  'rencontres_sumo',
  'matchs_sumo',
  'scores_presentation_lycees',
  'scores_suivi_ligne',
  'scores_presentation_colleges',
  'scores_design',
  'planning_slots',
  'team_members',
  'teams',
  'epreuves',
  'profiles',
  'etablissements',
  'editions'
];

export async function clearSeed() {
  console.log("🧹 Début du nettoyage des données de test...");

  for (const table of tables) {
    try {
      console.log(`Suppression dans '${table}'...`);
      const { data, error } = await supabase
        .from(table)
        .delete()
        .like('id', '%-0000-4000-8000-%');
        
      if (error) throw error;
      
      console.log(`✅ Nettoyage réussi pour '${table}'`);
    } catch (err) {
      console.error(`❌ Erreur lors du nettoyage de '${table}':`, err);
    }
  }

  console.log("✨ Toutes les données de test ont été supprimées.");
}

if (require.main === module) {
  clearSeed().catch(console.error);
}
