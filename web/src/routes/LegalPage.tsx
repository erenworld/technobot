import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Nav } from '../components/Nav';
import { FooterCompact } from '../components/Footer';

const SECTIONS = [
  { id: 'sec-1', label: '1. Présentation de la plateforme' },
  { id: 'sec-2', label: '2. Éditeur et responsable' },
  { id: 'sec-3', label: '3. Hébergement et infrastructure' },
  { id: 'sec-4', label: '4. Données collectées' },
  { id: 'sec-5', label: '5. Base légale' },
  { id: 'sec-6', label: '6. Conservation des données' },
  { id: 'sec-7', label: '7. Vos droits (RGPD)' },
  { id: 'sec-8', label: '8. Sécurité des données' },
  { id: 'sec-9', label: '9. Destinataires' },
  { id: 'sec-10', label: '10. Mineurs et protection' },
  { id: 'sec-11', label: '11. Droit à l\'image' },
  { id: 'sec-12', label: '12. Cookies et traceurs' },
  { id: 'sec-13', label: '13. Conditions d\'utilisation' },
  { id: 'sec-14', label: '14. Modifications' },
  { id: 'sec-15', label: '15. Contact' },
];

export function LegalPage() {
  const [currentId, setCurrentId] = useState<string | null>(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setCurrentId(e.target.id);
          }
        });
      },
      { rootMargin: '-30% 0px -60% 0px' },
    );

    document.querySelectorAll('article.rule').forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, []);

  return (
    <>
      <Nav />

      <header className="page-head">
        <div className="crumbs">
          <Link to="/">TECHNOBOT</Link>
          <span className="sep">/</span>
          <span>CGU &amp; Confidentialité</span>
        </div>
        <h1>
          Conditions <em>Générales</em>,
          <br />
          &amp; Confidentialité.
        </h1>
        <p>
          Plateforme TechnoBot - Tournoi de Robotique Scolaire.
        </p>
        <div className="page-meta">
          <span>
            <strong>Dernière mise à jour</strong> Mai 2026
          </span>
          <span>
            <strong>Éditeur</strong> Association TechTic &amp; Co
          </span>
          <span>
            <strong>Responsable</strong> Arnaud Roesslinger
          </span>
        </div>
      </header>

      <div className="rules-layout">
        <aside className="toc">
          <div className="toc-label">// Sommaire</div>
          <ul>
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className={currentId === section.id ? 'current' : ''}
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        <main className="rules-content">
          <div className="rules-panel active">
            
            <article className="rule" id="sec-1">
              <div className="rule-num">ARTICLE 1</div>
              <h2>Présentation de la plateforme</h2>
              <p>
                La plateforme TechnoBot est un outil numérique mis à disposition dans le cadre du tournoi de robotique scolaire <strong>TECHNOBOT</strong>, organisé par l'association <strong>TechTic &amp; Co</strong>, en partenariat avec l'Académie de Nancy-Metz, la Région Grand Est, la Ville de Yutz, le Crédit Mutuel, l'UIMM Lorraine et le Lycée La Briquerie.
              </p>
              <p>
                La finale du tournoi se déroule chaque année au <strong>Gymnase Jean Mermoz, Place de l'Arc en Ciel, 57970 Yutz</strong>.
              </p>
              <p>
                La plateforme permet :
              </p>
              <ul>
                <li>La gestion des inscriptions des équipes participantes (collèges et lycées)</li>
                <li>La consultation des plannings de passage</li>
                <li>La saisie et la consultation des notes d'évaluation par les jurys</li>
                <li>Le suivi des matchs Sumo et des résultats</li>
                <li>L'affichage des classements en temps réel le jour de la finale</li>
              </ul>
            </article>

            <article className="rule" id="sec-2">
              <div className="rule-num">ARTICLE 2</div>
              <h2>Éditeur et responsable du traitement</h2>
              <p>
                <strong>Responsable du traitement des données :</strong>
              </p>
              <p>
                Association <strong>TechTic &amp; Co</strong><br />
                Représentée par <strong>Arnaud ROESSLINGER</strong><br />
                Contact : <a href="mailto:arnaud.roesslinger@ac-nancy-metz.fr" style={{ textDecoration: 'underline', color: 'var(--red)' }}>arnaud.roesslinger@ac-nancy-metz.fr</a>
              </p>
              <p>
                L'association TechTic &amp; Co n'étant pas légalement tenue de désigner un Délégué à la Protection des Données (DPO), Arnaud ROESSLINGER assure directement la gestion de toutes les requêtes liées à la protection de vos données.
              </p>
              <p>
                <strong>Pour toute demande relative à vos données personnelles</strong>, y compris les demandes de suppression, de modification ou d'accès, vous devez contacter <strong>Arnaud ROESSLINGER</strong> directement à l'adresse e-mail ci-dessus.
              </p>
            </article>

            <article className="rule" id="sec-3">
              <div className="rule-num">ARTICLE 3</div>
              <h2>Hébergement et infrastructure</h2>
              
              <h3>Serveur applicatif</h3>
              <p>
                La plateforme TechnoBot est hébergée sur les infrastructures <strong>OVH SAS</strong>.
              </p>
              <p>
                <strong>OVH SAS</strong><br />
                2 rue Kellermann<br />
                59100 Roubaix - France<br />
                <a href="https://www.ovhcloud.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'var(--red)' }}>https://www.ovhcloud.com</a>
              </p>
              <p>
                OVH est un hébergeur français dont les datacenters sont situés en Europe, garantissant que vos données restent sur le territoire européen conformément au RGPD.
              </p>

              <h3>Base de données</h3>
              <p>
                Les données de la plateforme sont stockées sur <strong>Supabase</strong>, service de base de données PostgreSQL managé.
              </p>
              <p>
                <strong>Supabase Inc.</strong><br />
                970 Trestle Glen Rd<br />
                Oakland, CA 94610 - États-Unis<br />
                <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'var(--red)' }}>https://supabase.com</a>
              </p>
              <p>
                L'instance Supabase utilisée par TechnoBot est hébergée sur <strong>Amazon Web Services (AWS), région Europe (eu-west-1 - Irlande)</strong>, garantissant que les données sont physiquement stockées en Europe.
              </p>
              <p>
                Les transferts de données hors de l'Union européenne vers la société Supabase Inc. (États-Unis) sont juridiquement encadrés par des Clauses Contractuelles Types (CCT) adoptées par la Commission européenne, garantissant un niveau de protection équivalent au RGPD. Pour plus d'informations :{' '}
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'var(--red)' }}>https://supabase.com/privacy</a>
              </p>
            </article>

            <article className="rule" id="sec-4">
              <div className="rule-num">ARTICLE 4</div>
              <h2>Données personnelles collectées</h2>
              <p>
                Dans le cadre de l'utilisation de la plateforme TechnoBot, les données suivantes sont susceptibles d'être collectées :
              </p>

              <h3>4.1 Données des comptes utilisateurs</h3>
              <table className="spec-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Donnée</th>
                    <th style={{ textAlign: 'left' }}>Finalité</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: 'left' }}><strong>Nom et prénom</strong></td>
                    <td style={{ textAlign: 'left' }}>Identification de l'utilisateur</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'left' }}><strong>Adresse email</strong></td>
                    <td style={{ textAlign: 'left' }}>Connexion et communication</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'left' }}><strong>Rôle (admin, organisateur, jury, enseignant, élève)</strong></td>
                    <td style={{ textAlign: 'left' }}>Gestion des droits d'accès</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'left' }}><strong>Établissement scolaire de rattachement</strong></td>
                    <td style={{ textAlign: 'left' }}>Organisation du tournoi</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'left' }}><strong>Photo de profil (optionnelle)</strong></td>
                    <td style={{ textAlign: 'left' }}>Personnalisation du compte</td>
                  </tr>
                </tbody>
              </table>

              <h3>4.2 Données des équipes et robots</h3>
              <table className="spec-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Donnée</th>
                    <th style={{ textAlign: 'left' }}>Finalité</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: 'left' }}><strong>Nom du robot</strong></td>
                    <td style={{ textAlign: 'left' }}>Identification de l'équipe</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'left' }}><strong>Immatriculation de l'équipe</strong></td>
                    <td style={{ textAlign: 'left' }}>Gestion du planning et des classements</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'left' }}><strong>Poids et dimensions du robot</strong></td>
                    <td style={{ textAlign: 'left' }}>Contrôle technique réglementaire</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'left' }}><strong>Coût estimé du robot (HT)</strong></td>
                    <td style={{ textAlign: 'left' }}>Vérification de conformité (max. 100€ HT par le règlement)</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'left' }}><strong>Notes du contrôle technique</strong></td>
                    <td style={{ textAlign: 'left' }}>Traçabilité de la validation</td>
                  </tr>
                </tbody>
              </table>

              <h3>4.3 Données d'évaluation</h3>
              <table className="spec-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Donnée</th>
                    <th style={{ textAlign: 'left' }}>Finalité</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: 'left' }}><strong>Notes attribuées par le jury (design, présentation, suivi de ligne)</strong></td>
                    <td style={{ textAlign: 'left' }}>Calcul des classements</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'left' }}><strong>Observations des jurés</strong></td>
                    <td style={{ textAlign: 'left' }}>Retour pédagogique aux équipes</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'left' }}><strong>Résultats des matchs Sumo (points Yuko, Yusei)</strong></td>
                    <td style={{ textAlign: 'left' }}>Classement du tournoi</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'left' }}><strong>Temps de parcours (suivi de ligne)</strong></td>
                    <td style={{ textAlign: 'left' }}>Calcul du score selon la formule 500/temps</td>
                  </tr>
                </tbody>
              </table>

              <h3>4.4 Données de journalisation</h3>
              <p>
                La plateforme enregistre automatiquement les actions sensibles (modifications de scores, validations techniques) dans un journal d'audit à des fins de traçabilité et de sécurité.
              </p>
            </article>

            <article className="rule" id="sec-5">
              <div className="rule-num">ARTICLE 5</div>
              <h2>Base légale des traitements</h2>
              <p>
                Conformément au Règlement Général sur la Protection des Données (RGPD - Règlement UE 2016/679), les traitements effectués reposent sur les bases légales suivantes :
              </p>
              <ul>
                <li><strong>Exécution d'une mission d'intérêt public / mission éducative</strong> : les données des élèves et enseignants sont traitées dans le cadre d'un projet pédagogique officiel inscrit dans le programme de technologie de l'Éducation Nationale.</li>
                <li><strong>Intérêt légitime</strong> : gestion organisationnelle du tournoi, sécurité de la plateforme, calcul des classements.</li>
                <li><strong>Consentement</strong> : pour les données optionnelles (photo de profil, observations libres).</li>
              </ul>
            </article>

            <article className="rule" id="sec-6">
              <div className="rule-num">ARTICLE 6</div>
              <h2>Durée de conservation des données</h2>
              <table className="spec-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Catégorie de données</th>
                    <th style={{ textAlign: 'left' }}>Durée de conservation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: 'left' }}><strong>Comptes utilisateurs actifs</strong></td>
                    <td style={{ textAlign: 'left' }}>Durée de participation au tournoi + 1 an</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'left' }}><strong>Données des équipes et résultats</strong></td>
                    <td style={{ textAlign: 'left' }}>3 ans (archivage des palmarès)</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'left' }}><strong>Journal d'audit</strong></td>
                    <td style={{ textAlign: 'left' }}>1 an</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'left' }}><strong>Données de connexion</strong></td>
                    <td style={{ textAlign: 'left' }}>6 mois</td>
                  </tr>
                </tbody>
              </table>
              <p>
                À l'issue de ces délais, les données sont supprimées ou anonymisées de façon irréversible.
              </p>
            </article>

            <article className="rule" id="sec-7">
              <div className="rule-num">ARTICLE 7</div>
              <h2>Vos droits (RGPD)</h2>
              <p>
                Conformément aux articles 15 à 22 du RGPD, vous disposez des droits suivants concernant vos données personnelles :
              </p>
              <ul>
                <li><strong>Droit d'accès</strong> : obtenir une copie de vos données personnelles traitées</li>
                <li><strong>Droit de rectification</strong> : corriger des données inexactes ou incomplètes</li>
                <li><strong>Droit à l'effacement</strong> ("droit à l'oubli") : demander la suppression de vos données</li>
                <li><strong>Droit à la limitation du traitement</strong> : restreindre l'utilisation de vos données</li>
                <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré et lisible</li>
                <li><strong>Droit d'opposition</strong> : vous opposer à certains traitements</li>
              </ul>

              <h3>Comment exercer vos droits ?</h3>
              <p>
                <strong>Toute demande relative à vos données personnelles doit être adressée directement à Arnaud ROESSLINGER</strong>, responsable du traitement, par e-mail à l'adresse suivante :{' '}
                <a href="mailto:arnaud.roesslinger@ac-nancy-metz.fr" style={{ textDecoration: 'underline', color: 'var(--red)' }}>arnaud.roesslinger@ac-nancy-metz.fr</a>.
              </p>
              <p>
                Un délai de réponse d'un mois maximum s'applique à compter de la réception de votre demande (article 12 du RGPD).
              </p>
              <p>
                Si vous estimez que vos droits ne sont pas respectés, vous avez le droit d'introduire une réclamation auprès de la <strong>CNIL</strong> :<br /><br />
                <strong>Commission Nationale de l'Informatique et des Libertés</strong><br />
                3 Place de Fontenoy - TSA 80715 - 75334 Paris Cedex 07<br />
                <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'var(--red)' }}>https://www.cnil.fr</a>
              </p>
            </article>

            <article className="rule" id="sec-8">
              <div className="rule-num">ARTICLE 8</div>
              <h2>Sécurité des données</h2>
              <p>
                La plateforme TechnoBot met en œuvre les mesures techniques et organisationnelles suivantes pour protéger vos données :
              </p>
              <ul>
                <li><strong>Authentification sécurisée</strong> via Supabase Auth avec tokens JWT</li>
                <li><strong>Chiffrement des communications</strong> via HTTPS (TLS)</li>
                <li><strong>Contrôle d'accès basé sur les rôles et permissions</strong> : chaque utilisateur n'accède qu'aux données nécessaires à sa fonction (principe du moindre privilège)</li>
                <li><strong>Row Level Security (RLS)</strong> activé sur toutes les tables de la base de données : les données sont isolées au niveau de la base elle-même</li>
                <li><strong>Journal d'audit</strong> de toutes les actions sensibles</li>
                <li><strong>Rate limiting</strong> sur les routes critiques pour prévenir les abus</li>
                <li><strong>Protection contre les attaques courantes</strong> (injection, XSS, CSRF) via les en-têtes de sécurité HTTP</li>
              </ul>
            </article>

            <article className="rule" id="sec-9">
              <div className="rule-num">ARTICLE 9</div>
              <h2>Destinataires des données</h2>
              <p>
                Les données collectées sont accessibles uniquement aux personnes suivantes, selon leur rôle :
              </p>
              <table className="spec-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Rôle</th>
                    <th style={{ textAlign: 'left' }}>Données accessibles</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: 'left' }}><strong>Administrateurs</strong></td>
                    <td style={{ textAlign: 'left' }}>Toutes les données</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'left' }}><strong>Organisateurs (TechTic &amp; Co)</strong></td>
                    <td style={{ textAlign: 'left' }}>Toutes les données de gestion du tournoi</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'left' }}><strong>Jurés</strong></td>
                    <td style={{ textAlign: 'left' }}>Planning, scores qu'ils ont eux-mêmes saisis</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'left' }}><strong>Enseignants</strong></td>
                    <td style={{ textAlign: 'left' }}>Données des équipes de leur établissement uniquement</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'left' }}><strong>Élèves</strong></td>
                    <td style={{ textAlign: 'left' }}>Leurs propres données d'équipe et scores</td>
                  </tr>
                </tbody>
              </table>
              <p>
                Les données ne sont <strong>jamais vendues, louées ou cédées à des tiers</strong> à des fins commerciales.
              </p>
            </article>

            <article className="rule" id="sec-10">
              <div className="rule-num">ARTICLE 10</div>
              <h2>Mineurs et protection des données</h2>
              <p>
                Le tournoi TechnoBot s'adresse notamment à des élèves de collège et de lycée, dont une partie sont des mineurs de moins de 15 ans.
              </p>
              <p>
                Conformément à l'article 8 du RGPD et à la loi Informatique et Libertés, le traitement des données de mineurs de moins de 15 ans nécessite le consentement conjoint du mineur et de son représentant légal.
              </p>
              <p>
                Les établissements scolaires participants s'engagent à :
              </p>
              <ul>
                <li>Informer les parents/tuteurs légaux de la participation de leurs enfants</li>
                <li>Recueillir les autorisations nécessaires (le double consentement écrit de l'élève et de son représentant légal pour les moins de 15 ans) avant d'inscrire un élève mineur sur la plateforme</li>
                <li>Conserver ces autorisations écrites et les tenir à disposition de l'organisation du tournoi en cas de besoin ou de contrôle</li>
                <li>Ne saisir que les données strictement nécessaires à l'organisation du tournoi</li>
              </ul>
            </article>

            <article className="rule" id="sec-11">
              <div className="rule-num">ARTICLE 11</div>
              <h2>Droit à l'image</h2>
              <p>
                Des photographes et caméramans peuvent être présents lors de la finale du tournoi. Conformément au règlement officiel de TechnoBot, <strong>les participants acceptent l'utilisation des images prises lors de l'événement</strong> dans le cadre de la communication du tournoi (site web, réseaux sociaux, presse).
              </p>
              <p>
                Toute opposition au droit à l'image doit être signalée à <strong>Arnaud ROESSLINGER</strong> (par e-mail à{' '}
                <a href="mailto:arnaud.roesslinger@ac-nancy-metz.fr" style={{ textDecoration: 'underline', color: 'var(--red)' }}>arnaud.roesslinger@ac-nancy-metz.fr</a>) avant le début de l'événement.
              </p>
            </article>

            <article className="rule" id="sec-12">
              <div className="rule-num">ARTICLE 12</div>
              <h2>Cookies et technologies de suivi</h2>
              <p>
                La plateforme TechnoBot utilise uniquement des cookies <strong>strictement nécessaires</strong> au fonctionnement du service :
              </p>
              <ul>
                <li><strong>Cookie de session</strong> : maintien de la connexion de l'utilisateur (token JWT)</li>
                <li><strong>Cookie de préférences</strong> : mémorisation des préférences d'affichage</li>
              </ul>
              <p>
                Aucun cookie publicitaire ou de tracking tiers n'est utilisé. La plateforme ne contient aucune publicité.
              </p>
            </article>

            <article className="rule" id="sec-13">
              <div className="rule-num">ARTICLE 13</div>
              <h2>Conditions d'utilisation de la plateforme</h2>
              
              <h3>13.1 Accès à la plateforme</h3>
              <p>
                L'accès à la plateforme est réservé aux personnes dûment inscrites dans le cadre du tournoi TechnoBot : élèves participants, enseignants accompagnateurs, membres du jury, et organisateurs.
              </p>
              <p>
                Tout accès non autorisé, tentative de contournement des mesures de sécurité, ou utilisation malveillante de la plateforme est strictement interdit et peut constituer une infraction pénale au titre de la loi Godfrain (articles 323-1 et suivants du Code Pénal).
              </p>

              <h3>13.2 Obligations des utilisateurs</h3>
              <p>
                Les utilisateurs s'engagent à :
              </p>
              <ul>
                <li>Fournir des informations exactes lors de leur inscription</li>
                <li>Ne pas partager leurs identifiants de connexion</li>
                <li>Utiliser la plateforme exclusivement dans le cadre du tournoi TechnoBot</li>
                <li>Ne pas tenter d'accéder aux données d'autres utilisateurs ou équipes</li>
                <li>Signaler tout dysfonctionnement ou faille de sécurité à <strong>Arnaud ROESSLINGER</strong> (par e-mail à{' '}
                <a href="mailto:arnaud.roesslinger@ac-nancy-metz.fr" style={{ textDecoration: 'underline', color: 'var(--red)' }}>arnaud.roesslinger@ac-nancy-metz.fr</a>)</li>
              </ul>

              <h3>13.3 Règlement du tournoi</h3>
              <p>
                L'utilisation de la plateforme est soumise au respect du règlement officiel du tournoi TechnoBot 2026, notamment :
              </p>
              <ul>
                <li>Les robots doivent être conformes aux caractéristiques définies (dimensions max. 27×34×34 cm, poids max. 1,5 kg pour les collèges / 160×160 mm, 750 g pour les lycées)</li>
                <li>La programmation et la conception doivent être réalisées exclusivement par les élèves</li>
                <li>Tout comportement non sportif peut entraîner la disqualification</li>
                <li>Les décisions des arbitres et de l'organisation sont sans appel</li>
              </ul>

              <h3>13.4 Responsabilité</h3>
              <p>
                TechTic &amp; Co s'efforce d'assurer la disponibilité de la plateforme, notamment le jour de la finale. Cependant, aucune garantie de disponibilité continue n'est offerte. TechTic &amp; Co ne saurait être tenu responsable en cas d'interruption de service, de perte de données due à un incident technique, ou de tout dommage indirect lié à l'utilisation de la plateforme.
              </p>
            </article>

            <article className="rule" id="sec-14">
              <div className="rule-num">ARTICLE 14</div>
              <h2>Modifications de la présente politique</h2>
              <p>
                La présente politique de confidentialité et conditions d'utilisation peut être modifiée à tout moment. Les utilisateurs seront informés de toute modification substantielle via la plateforme. La date de dernière mise à jour est indiquée en haut de ce document.
              </p>
            </article>

            <article className="rule" id="sec-15">
              <div className="rule-num">ARTICLE 15</div>
              <h2>Contact</h2>
              <p>
                Pour toute question relative à ce document, à vos données personnelles, ou au fonctionnement de la plateforme :
              </p>
              <p>
                <strong>Arnaud ROESSLINGER</strong><br />
                Organisateur principal - Tournoi TechnoBot<br />
                Association TechTic &amp; Co<br />
                E-mail : <a href="mailto:arnaud.roesslinger@ac-nancy-metz.fr" style={{ textDecoration: 'underline', color: 'var(--red)' }}>arnaud.roesslinger@ac-nancy-metz.fr</a>
              </p>
              <p style={{ marginTop: 24, fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>
                Ce document a été rédigé conformément au Règlement (UE) 2016/679 du Parlement Européen et du Conseil du 27 avril 2016 (RGPD) et à la loi n°78-17 du 6 janvier 1978 relative à l'informatique, aux fichiers et aux libertés, modifiée.
              </p>
            </article>

          </div>
        </main>
      </div>

      <FooterCompact />
    </>
  );
}
