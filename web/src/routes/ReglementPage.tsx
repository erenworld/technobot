import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Nav } from '../components/Nav';
import { FooterCompact } from '../components/Footer';

type Panel = 'college' | 'lycee';

const TOC: Record<Panel, { title: string; items: { id: string; label: string }[] }[]> = {
  college: [
    {
      title: '// Règlement général',
      items: [
        { id: 'c-intro', label: 'Présentation' },
        { id: 'c-robot', label: 'Caractéristiques robot' },
        { id: 'c-inscriptions', label: 'Inscriptions' },
        { id: 'c-prog', label: 'Programmation' },
        { id: 'c-classement', label: 'Classement' },
        { id: 'c-ct', label: 'Contrôle technique' },
      ],
    },
    {
      title: '// Épreuves',
      items: [
        { id: 'c-ligne', label: 'Suivi de ligne' },
        { id: 'c-formule', label: 'Formule robot' },
        { id: 'c-design', label: 'Design' },
        { id: 'c-presentation', label: 'Présentation de projet' },
      ],
    },
  ],
  lycee: [
    {
      title: '// Règlement général',
      items: [
        { id: 'l-intro', label: 'Public concerné' },
        { id: 'l-dohyo', label: 'Caractéristiques du Dohyo' },
        { id: 'l-robot', label: 'Caractéristiques robot' },
        { id: 'l-classement', label: 'Classement général' },
      ],
    },
    {
      title: '// Épreuves',
      items: [
        { id: 'l-combat', label: 'Déroulement des combats' },
        { id: 'l-points', label: 'Points Yuko & Yusei' },
        { id: 'l-penalites', label: 'Violations & pénalités' },
        { id: 'l-lv', label: 'Présentation en LV' },
      ],
    },
  ],
};

const COLLEGE_RANKING = [
  { rank: '1ER', pts: 275, top: true },
  { rank: '2E', pts: 198 },
  { rank: '3E', pts: 165 },
  { rank: '4E', pts: 132 },
  { rank: '5E', pts: 110 },
  { rank: '6E', pts: 88 },
  { rank: '7E', pts: 66 },
  { rank: '8E', pts: 44 },
  { rank: '9E', pts: 22 },
  { rank: '10E', pts: 11 },
];

const LYCEE_RANKING = [
  { rank: '1ER', pts: 150, top: true },
  { rank: '2E', pts: 130 },
  { rank: '3E', pts: 115 },
  { rank: '4E', pts: 100 },
  { rank: '5E', pts: 90 },
  { rank: '6E', pts: 80 },
  { rank: '7E', pts: 70 },
  { rank: '8E', pts: 60 },
  { rank: '9E', pts: 50 },
  { rank: '10E', pts: 45 },
];

export function ReglementPage() {
  const [panel, setPanel] = useState<Panel>('college');
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
  }, [panel]);

  const switchPanel = (next: Panel) => {
    setPanel(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Nav active="reglement" />

      <header className="page-head">
        <div className="crumbs">
          <Link to="/">TECHNOBOT</Link>
          <span className="sep">/</span>
          <span>Règlement officiel</span>
        </div>
        <h1>
          Le <em>règlement</em>,
          <br />
          en clair.
        </h1>
        <p>
          Règles générales, caractéristiques techniques des robots, épreuves et
          barèmes. Version 2026 - reprise du règlement 2025 avec mises à jour
          du comité de pilotage.
        </p>
        <div className="page-meta">
          <span>
            <strong>Version</strong> 09.12.2023 / MAJ 2026
          </span>
          <span>
            <strong>Organisateur</strong> Tech Tic &amp; Co
          </span>
          <span>
            <strong>Finale</strong> 05.06.2026 · Yutz
          </span>
        </div>
      </header>

      <div className="rules-layout">
        <aside className="toc">
          <div className="toc-tabs" role="tablist">
            <button
              type="button"
              className={panel === 'college' ? 'active' : ''}
              onClick={() => switchPanel('college')}
            >
              Collèges
            </button>
            <button
              type="button"
              className={panel === 'lycee' ? 'active' : ''}
              onClick={() => switchPanel('lycee')}
            >
              Lycées
            </button>
          </div>

          <div className="toc-panel active">
            {TOC[panel].map((section) => (
              <div key={section.title}>
                <div className="toc-label">{section.title}</div>
                <ul>
                  {section.items.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className={currentId === item.id ? 'current' : ''}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        <main className="rules-content">
          {panel === 'college' ? <CollegePanel /> : <LyceePanel />}
        </main>
      </div>

      <FooterCompact />
    </>
  );
}

function CollegePanel() {
  return (
    <div className="rules-panel active">
      <div className="section-head-lg">
        <div>
          <div className="section-eyebrow">// Règlement · Collèges</div>
          <h2
            style={{
              fontFamily: 'var(--ff-display)',
              fontSize: 44,
              margin: '12px 0 0',
              fontWeight: 700,
              letterSpacing: '-0.025em',
            }}
          >
            Épreuves collèges 2026
          </h2>
        </div>
        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 12, color: 'var(--muted)' }}>
          12 pages · 8 articles
        </div>
      </div>

      <article className="rule" id="c-intro">
        <div className="rule-num">ART. 0</div>
        <h2>Présentation générale</h2>
        <p>
          Le tournoi <strong>TECHNOBOT</strong> est ouvert aux collèges et
          lycées qui feront parvenir une fiche d'inscription auprès d'
          <strong>Arnaud Roesslinger</strong>. Des qualifications pourront être
          organisées sur tout le territoire de l'Académie en fonction des
          inscriptions et des établissements organisateurs.
        </p>
        <p>
          La finale se déroule le <strong>vendredi 5 juin 2026</strong> au
          gymnase Mermoz de Yutz.
        </p>
      </article>

      <article className="rule" id="c-robot">
        <div className="rule-num">ART. 1</div>
        <h2>Caractéristiques des robots</h2>
        <table className="spec-table">
          <tbody>
            <tr>
              <th>Critère</th>
              <th>Limite</th>
            </tr>
            <tr>
              <td>Dimensions max (L × l × h)</td>
              <td><strong>27 × 34 × 34 cm</strong></td>
            </tr>
            <tr>
              <td>Masse</td>
              <td><strong>&lt; 1,5 kg</strong></td>
            </tr>
            <tr>
              <td>Coût max (hors dérogation)</td>
              <td><strong>100,00 € HT</strong></td>
            </tr>
            <tr>
              <td>Équipe par robot</td>
              <td><strong>5 élèves max</strong></td>
            </tr>
            <tr>
              <td>Robots par établissement</td>
              <td><strong>1 par épreuve</strong></td>
            </tr>
          </tbody>
        </table>
        <h3>Contraintes obligatoires</h3>
        <ul>
          <li>
            Le robot doit être <strong>entièrement réalisé par les élèves</strong>,
            à l'exception d'une éventuelle carte électronique.
          </li>
          <li>
            Il doit disposer d'un{' '}
            <strong>interrupteur marche/arrêt facile d'accès</strong>.
          </li>
          <li>
            Il doit être <strong>autonome</strong> - aucune liaison électrique,
            radioélectrique, mécanique ni manuelle.
          </li>
          <li>
            Il doit rester <strong>en contact avec le sol</strong> pendant
            l'épreuve.
          </li>
          <li>
            La <strong>carrosserie est obligatoire</strong> et doit être une
            création originale (pas de commerce).
          </li>
        </ul>
        <h3>Interdits absolus</h3>
        <ul className="tight">
          <li>Dispositifs à allumage, moteurs thermiques ou chimiques</li>
          <li>Propulsion animale, dispositifs de lancement</li>
          <li>Dépôt ou fixation de quoi que ce soit sur la piste</li>
          <li>Intervention d'un professeur pendant les épreuves</li>
        </ul>
        <div className="callout">
          <div className="callout-label">→ Justificatif coût</div>
          Un justificatif du coût du robot pourra être demandé lors du contrôle
          technique. Les élèves doivent pouvoir justifier les{' '}
          <strong>choix de composants</strong> et le{' '}
          <strong>fonctionnement</strong>.
        </div>
      </article>

      <article className="rule" id="c-inscriptions">
        <div className="rule-num">ART. 2</div>
        <h2>Inscriptions &amp; nombre d'équipes</h2>
        <p>
          Date limite : <strong>12 décembre 2025</strong>. Pour la finale au
          collège de Yutz, une participation financière de <strong>50 €</strong>{' '}
          est à régler à l'association TechTic&amp;Co. Cette participation
          couvre une partie des frais d'organisation.
        </p>
        <div className="callout new">
          <div className="callout-label">→ NOUVEAU 2026</div>
          Un seul robot par équipe, et pour une seule épreuve. Les
          établissements organisent eux-mêmes leurs qualifications internes en
          amont si besoin.
        </div>
      </article>

      <article className="rule" id="c-prog">
        <div className="rule-num">ART. 3</div>
        <h2>Programmation</h2>
        <p>
          La programmation doit être{' '}
          <strong>réalisée exclusivement par les élèves</strong>. Les élèves
          peuvent être amenés à donner des explications sur leur programme,
          voire à le reprogrammer.
        </p>
        <p>
          Au vu du nouveau programme de technologie en collège, la{' '}
          <strong>variation de vitesse</strong> et l'
          <strong>utilisation de variables</strong> sont autorisées.
        </p>
        <div className="callout warn">
          <div className="callout-label">→ Parc fermé</div>
          Les finalistes des épreuves <strong>Suivi de ligne</strong> et{' '}
          <strong>Formule robot</strong> devront reprogrammer leur robot{' '}
          <strong>sur site, en parc fermé</strong> (2 élèves max, rotation
          possible).
        </div>
      </article>

      <article className="rule" id="c-classement">
        <div className="rule-num">ART. 6</div>
        <h2>Classement général &amp; récompenses</h2>
        <p>
          Chaque épreuve fait l'objet d'un classement. Les{' '}
          <strong>3 premières équipes</strong> de chaque épreuve sont
          récompensées. Les <strong>3 premiers établissements</strong> gagnent
          un trophée TECHNOBOT qu'ils remettront en jeu l'année suivante.
        </p>
        <div className="ranking-grid">
          {COLLEGE_RANKING.map((row) => (
            <div key={row.rank} className={`ranking-cell${row.top ? ' top1' : ''}`}>
              <div className="rank">{row.rank}</div>
              <div className="pts">{row.pts}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>
          Du 11e au 20e rang, un point chacun de 10 → 1 pt.
        </p>
      </article>

      <article className="rule" id="c-ct">
        <div className="rule-num">ART. 7</div>
        <h2>Contrôle technique</h2>
        <p>
          Un contrôle technique sera organisé{' '}
          <strong>avant le début des épreuves</strong>. La conformité des
          robots sera vérifiée. Les élèves devront être capables de justifier
          le coût de leur robot et les solutions techniques choisies.
        </p>
        <div className="callout warn">
          <div className="callout-label">→ Inopiné</div>
          Des opérations de contrôles techniques pourront avoir lieu de manière{' '}
          <strong>inopinée</strong> pendant le tournoi.
        </div>
      </article>

      <article className="rule" id="c-ligne">
        <div className="rule-num">ÉPREUVE B</div>
        <h2>Suivi de ligne</h2>
        <p>
          Un robot suiveur de ligne doit parcourir plusieurs tracés de
          complexité croissante. Les points sont attribués en fonction de la
          distance parcourue et du temps mis pour chaque parcours.
        </p>
        <h3>Caractéristiques d'un parcours</h3>
        <ul className="tight">
          <li>Virage large · Virage serré · Angle droit</li>
          <li>Angle obtus (&gt;90°) · Angle aigu (&lt;90°)</li>
          <li>Croisement · Disparition du tracé (quelques cm)</li>
        </ul>
        <p>
          Longueur approximative des tracés : <strong>9 mètres maximum</strong>.
          Pistes en bâche imprimée, lignes noires sur fond blanc. Une seule
          tentative est autorisée.
        </p>
        <h3>Barème</h3>
        <table className="spec-table">
          <tbody>
            <tr>
              <th>Item</th>
              <th>Points</th>
            </tr>
            <tr>
              <td>Pourcentage de la distance parcourue</td>
              <td><strong>/ 100</strong></td>
            </tr>
            <tr>
              <td>Bonus parcours fini sans interruption</td>
              <td><strong>+ 50</strong></td>
            </tr>
            <tr>
              <td>Calcul de vitesse</td>
              <td><strong>500 / temps</strong></td>
            </tr>
            <tr>
              <td>6 pistes bonus (angles, intersection, interruptions)</td>
              <td><strong>+ 5 chacune</strong></td>
            </tr>
          </tbody>
        </table>
        <div className="callout new">
          <div className="callout-label">→ NOUVEAU</div>
          Le robot doit avoir <strong>au moins une roue entièrement opaque</strong>{' '}
          pour permettre au système de chronométrage de fonctionner correctement.
        </div>
      </article>

      <article className="rule" id="c-formule">
        <div className="rule-num">ÉPREUVE C</div>
        <h2>Formule robot</h2>
        <p>
          Course de vitesse entre deux robots autonomes sur une piste fermée.
          Une marque à l'avant et à l'arrière du robot matérialise le milieu
          de la largeur hors tout.{' '}
          <strong>Un seul passage autorisé à la finale.</strong>
        </p>
        <h3>Piste</h3>
        <ul className="tight">
          <li>Forme d'un ovale, rayon &gt; 40 cm</li>
          <li>Une seule voie de <strong>27 cm (±5)</strong> de largeur</li>
          <li>Lignes noires, limites extérieures en rouge (±20 cm)</li>
        </ul>
        <h3>Déroulement</h3>
        <ul>
          <li>
            Les deux robots sont positionnés à l'opposé sur la piste,
            perpendiculairement à la ligne de départ.
          </li>
          <li>
            Ils avancent dans le <strong>sens trigonométrique</strong>.
          </li>
          <li>
            Le gagnant effectue <strong>3 tours</strong> le plus rapidement
            possible.
          </li>
          <li>
            Un robot peut être déclaré vainqueur s'il rattrape son adversaire en
            moins de 3 tours.
          </li>
          <li>
            Après 3 minutes sans résultat, les juges décident en tenant compte
            des distances.
          </li>
        </ul>
        <div className="callout warn">
          <div className="callout-label">→ Lignes rouges</div>
          Si un robot atteint les limites de la piste (lignes rouges), il{' '}
          <strong>perd la course</strong>. Mais il n'est pas éliminé de la
          rencontre.
        </div>
      </article>

      <article className="rule" id="c-design">
        <div className="rule-num">ÉPREUVE D</div>
        <h2>Design</h2>
        <p>
          L'épreuve se déroule en <strong>3 phases</strong> : contrôle
          technique, classement, puis présentation au public pour les 3
          premiers. Des professionnels en design ou en arts plastiques notent
          le robot à l'aide du barème.
        </p>
        <table className="spec-table">
          <tbody>
            <tr>
              <th>Catégorie</th>
              <th>Points</th>
            </tr>
            <tr>
              <td>
                <span className="cat">Caractéristiques fonctionnelles</span>
                <br />
                <small>Interrupteur, refroidissement, câble prog, piles, solidité</small>
              </td>
              <td><strong>/ 25</strong></td>
            </tr>
            <tr>
              <td>
                <span className="cat">Caractéristiques formelles</span>
                <br />
                <small>Homogénéité, œuvre originale, qualité visuelle, dissimulation</small>
              </td>
              <td><strong>/ 60</strong></td>
            </tr>
            <tr>
              <td>
                <span className="cat">Présentation, démarche</span>
                <br />
                <small>Affiche A3, qualité de l'échange (3 min max)</small>
              </td>
              <td><strong>/ 35</strong></td>
            </tr>
            <tr className="total">
              <td>TOTAL</td>
              <td>/ 120</td>
            </tr>
          </tbody>
        </table>
        <p style={{ marginTop: 20 }}>
          <strong>Bonus 1 ·</strong> Suivi de piste ovale (R 53,5 cm) :{' '}
          <strong>+10 pts</strong>. Attention, si le robot ne se déplace pas, il
          est éliminé.
        </p>
        <div className="callout new">
          <div className="callout-label">→ NOUVEAU</div>
          <strong>Bonus 2 ·</strong> Robot connecté avec interaction avec le
          jury : jusqu'à <strong>+10 pts</strong>. Le design de l'application
          est pris en compte. Les concurrents ne peuvent pas changer de
          programme pour la démonstration.
        </div>
      </article>

      <article className="rule" id="c-presentation">
        <div className="rule-num">ÉPREUVE E</div>
        <h2>Présentation de projet</h2>
        <p>
          Les élèves présentent en <strong>3 minutes</strong> leur projet. Un
          support multimédia est possible (diaporama, vidéos) sur clé USB. Au
          bout des 3 minutes, la présentation sera <strong>coupée</strong>.
        </p>
        <table className="spec-table">
          <tbody>
            <tr>
              <th>Critère</th>
              <th>Points</th>
            </tr>
            <tr>
              <td>
                <span className="cat">Aisance</span>
                <br />
                <small>Attitude, travail de groupe, durée, originalité</small>
              </td>
              <td><strong>/ 20</strong></td>
            </tr>
            <tr>
              <td>
                <span className="cat">Langue(s)</span>
                <br />
                <small>Prise de risque, qualité linguistique</small>
              </td>
              <td><strong>/ 20</strong></td>
            </tr>
            <tr>
              <td>
                <span className="cat">Contenu</span>
                <br />
                <small>Cohérence démarche, justification choix techniques</small>
              </td>
              <td><strong>/ 30</strong></td>
            </tr>
            <tr>
              <td>
                <span className="cat">Outils</span>
                <br />
                <small>Schémas, tableaux, bête à cornes, SysML</small>
              </td>
              <td><strong>/ 20</strong></td>
            </tr>
            <tr className="total">
              <td>TOTAL</td>
              <td>/ 90</td>
            </tr>
          </tbody>
        </table>
        <p style={{ marginTop: 20, fontSize: 14, color: 'var(--muted)' }}>
          Bonus suivi piste ovale : +10 pts · Bonus robot connecté : +10 pts max.
        </p>
      </article>
    </div>
  );
}

function LyceePanel() {
  return (
    <div className="rules-panel active">
      <div className="section-head-lg">
        <div>
          <div className="section-eyebrow">// Règlement · Lycées</div>
          <h2
            style={{
              fontFamily: 'var(--ff-display)',
              fontSize: 44,
              margin: '12px 0 0',
              fontWeight: 700,
              letterSpacing: '-0.025em',
            }}
          >
            Sumo lycées 2026
          </h2>
        </div>
        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 12, color: 'var(--muted)' }}>
          Adapté de l'IUT GEII Nîmes
        </div>
      </div>

      <article className="rule" id="l-intro">
        <div className="rule-num">CHAP. 0</div>
        <h2>Public concerné</h2>
        <p>
          Le règlement 2026 reprend l'édition 2025. Les règles suivies
          correspondent à celles des concours de robots Mini-Sumo en vigueur au{' '}
          <strong>Japon</strong> et aux <strong>États-Unis</strong>, avec
          quelques modifications. <strong>Seuls les robots autonomes</strong>{' '}
          sont acceptés.
        </p>
        <div className="callout">
          <div className="callout-label">→ Limites</div>
          Les élèves sont les <strong>seuls acteurs</strong> de l'étude, la
          conception, la réalisation, la mise au point et la programmation. Les
          professeurs signent la charte : l'utilisation de kits peut entraîner
          la disqualification. Volume horaire élèves attendu :{' '}
          <strong>30 à 70h</strong>.
        </div>
        <h3>Deux épreuves complémentaires</h3>
        <ul>
          <li>
            <strong>Concours sumos</strong> - combats sur Dohyo.
          </li>
          <li>
            <strong>Présentation en LV</strong> - projet en anglais devant jury.
          </li>
        </ul>
      </article>

      <article className="rule" id="l-dohyo">
        <div className="rule-num">CHAP. 2</div>
        <h2>Caractéristiques du Dohyo</h2>
        <table className="spec-table">
          <tbody>
            <tr>
              <th>Élément</th>
              <th>Valeur</th>
            </tr>
            <tr>
              <td>Diamètre</td>
              <td><strong>92 cm</strong></td>
            </tr>
            <tr>
              <td>Épaisseur minimum</td>
              <td><strong>22 mm</strong></td>
            </tr>
            <tr>
              <td>Surface</td>
              <td>Bois, lisse, peinte noir mat</td>
            </tr>
            <tr>
              <td>Couronne extérieure</td>
              <td><strong>4 cm blanc brillant</strong> (incluse)</td>
            </tr>
            <tr>
              <td>Lignes de départ (Shikiri-sen)</td>
              <td>16 × 1,9 cm, à 15 cm du centre</td>
            </tr>
            <tr>
              <td>Zone autour du Dohyo</td>
              <td>92 cm minimum</td>
            </tr>
          </tbody>
        </table>
        <p style={{ marginTop: 20 }}>
          Chaque lycée apportera sa piste le jour du concours ; certaines
          pourront servir aux qualifications par poule.
        </p>
      </article>

      <article className="rule" id="l-robot">
        <div className="rule-num">CHAP. 3</div>
        <h2>Caractéristiques des robots</h2>
        <p>
          <strong>Une seule catégorie</strong> est ouverte : dimensions
          initiales <strong>160 × 160 mm</strong>, hauteur sans limite.
        </p>
        <table className="spec-table">
          <tbody>
            <tr>
              <th>Critère</th>
              <th>Limite</th>
            </tr>
            <tr>
              <td>Dimensions initiales</td>
              <td><strong>160 × 160 mm</strong></td>
            </tr>
            <tr>
              <td>Masse</td>
              <td><strong>&lt; 750 g</strong> (tolérance 10 g)</td>
            </tr>
            <tr>
              <td>Actionneurs max</td>
              <td><strong>4</strong></td>
            </tr>
            <tr>
              <td>Source d'énergie</td>
              <td>Électrique uniquement</td>
            </tr>
            <tr>
              <td>Délai de démarrage</td>
              <td><strong>5 secondes</strong> après signal</td>
            </tr>
          </tbody>
        </table>
        <div className="callout warn">
          <div className="callout-label">→ Exclusions 2026</div>
          Les structures modulaires type <strong>LEGO®</strong>,{' '}
          <strong>Meccano®</strong> et dérivés ne sont plus acceptées (depuis
          2017). Seules les productions des élèves pourront concourir. Aucune
          version commerciale ne sera validée au contrôle technique.
        </div>
        <h3>Interdits sur le robot</h3>
        <ul className="tight">
          <li>Systèmes qui bloquent sur place (aspirateurs, ventouses, colle)</li>
          <li>Projection de liquide, poudre, feu</li>
          <li>Lumière ou fumée gênant l'adversaire</li>
          <li>Dégradation du Dohyo</li>
        </ul>
      </article>

      <article className="rule" id="l-combat">
        <div className="rule-num">CHAP. 4-5</div>
        <h2>Déroulement des combats</h2>
        <p>
          Un combat consiste en <strong>3 rencontres de 3 minutes</strong>. Le
          premier à remporter <strong>2 points Yuko</strong> est déclaré
          vainqueur du combat.
        </p>
        <h3>Configurations de départ (aléatoires)</h3>
        <ul className="tight">
          <li>Flanc droit contre flanc droit</li>
          <li>Flanc gauche contre flanc gauche</li>
          <li>Dos à dos</li>
        </ul>
        <div className="callout">
          <div className="callout-label">→ Sécurité</div>
          Depuis 2019, le port de{' '}
          <strong>gants et lunettes de protection</strong> est obligatoire pour
          les participants. Avant la rencontre, les participants se saluent
          avant de poser leur robot.
        </div>
        <h3>Annulation &amp; rencontre rejouée</h3>
        <ul>
          <li>Robots bloqués ensemble ou tournant en cercle sans évolution.</li>
          <li>Les deux robots touchent l'extérieur du Dohyo simultanément.</li>
          <li>L'arbitre ne peut désigner de vainqueur pour d'autres raisons.</li>
        </ul>
      </article>

      <article className="rule" id="l-points">
        <div className="rule-num">CHAP. 6</div>
        <h2>Points - Yuko &amp; Yusei</h2>
        <h3>Yuko (point de décision)</h3>
        <ul>
          <li>Éjection de l'adversaire hors du Dohyo par une action légale.</li>
          <li>L'adversaire sort du Dohyo de lui-même.</li>
          <li>L'adversaire est disqualifié ou a plus d'une violation.</li>
          <li>2 points Yusei accumulés.</li>
          <li>1 Yusei + un avertissement adversaire.</li>
        </ul>
        <h3>Yusei (avantage)</h3>
        <p>
          L'adversaire reste bloqué en bordure du Dohyo et ne peut se déplacer
          de lui-même.
        </p>
      </article>

      <article className="rule" id="l-penalites">
        <div className="rule-num">CHAP. 7</div>
        <h2>Violations &amp; pénalités</h2>
        <h3>Avertissements</h3>
        <ul className="tight">
          <li>Participant entre sur le Dohyo avant la fin de la rencontre.</li>
          <li>Préparation pour une nouvelle rencontre dure &gt; 30 s.</li>
          <li>Robot autonome bouge avant les 5 s après signal départ.</li>
        </ul>
        <h3>Violations - Yuko adverse</h3>
        <ul className="tight">
          <li>Le robot "lâche" volontairement un élément sur la piste.</li>
          <li>L'un des robots ne se déplace plus &gt; 5 s.</li>
          <li>Les deux robots avancent sans jamais se rencontrer.</li>
          <li>De la fumée s'échappe d'un robot.</li>
        </ul>
        <h3>Disqualification</h3>
        <ul className="tight">
          <li>Robot ne respectant pas les caractéristiques.</li>
          <li>Comportement non sportif, langage calomnieux.</li>
          <li>Blessure volontaire d'un adversaire.</li>
        </ul>
        <div className="callout warn">
          <div className="callout-label">→ Contrôle technique inopiné</div>
          Si un écart est constaté par rapport au contrôle technique initial
          (délai de démarrage, masse, dimensions), le robot est{' '}
          <strong>disqualifié</strong>. Un contrôle technique complet du podium
          provisoire validera les résultats.
        </div>
      </article>

      <article className="rule" id="l-lv">
        <div className="rule-num">ART. 23</div>
        <h2>Présentation en langue vivante</h2>
        <p>
          Chaque équipe (5 élèves max) présente le développement de son robot
          sumo à un jury de spécialistes en utilisant un support numérique au
          choix. Depuis 2023, la présentation se déroule{' '}
          <strong>en anglais</strong>.
        </p>
        <p>
          Temps d'intervention : <strong>5 minutes</strong>. Une interrogation
          de <strong>3 minutes</strong> peut suivre pour vérifier les savoirs.
        </p>
        <div className="callout new">
          <div className="callout-label">→ À préparer</div>
          L'équipe propose un <strong>résumé écrit (pitch)</strong> de 5 lignes
          maximum à présenter au pôle "inscription" à l'arrivée au gymnase.
        </div>
        <table className="spec-table">
          <tbody>
            <tr>
              <th>Critère</th>
              <th>Points</th>
            </tr>
            <tr>
              <td>Répartition du temps de parole</td>
              <td><strong>/ 20</strong></td>
            </tr>
            <tr>
              <td>Qualité du visuel de présentation</td>
              <td><strong>/ 30</strong></td>
            </tr>
            <tr>
              <td>Justesse technique</td>
              <td><strong>/ 15</strong></td>
            </tr>
            <tr>
              <td>Compétences linguistiques collectives</td>
              <td><strong>/ 20</strong></td>
            </tr>
            <tr>
              <td>Vocabulaire technique adapté</td>
              <td><strong>/ 15</strong></td>
            </tr>
            <tr>
              <td>Dossier technique en LV (5-10 pages)</td>
              <td><strong>/ 20</strong></td>
            </tr>
            <tr>
              <td>Échanges techniques avec le jury</td>
              <td><strong>/ 30</strong></td>
            </tr>
            <tr className="total">
              <td>TOTAL</td>
              <td>/ 150</td>
            </tr>
          </tbody>
        </table>
      </article>

      <article className="rule" id="l-classement">
        <div className="rule-num">ART. 24</div>
        <h2>Classement général</h2>
        <p>
          Le classement général est établi en additionnant la note de
          présentation de projet et les résultats obtenus à l'épreuve
          "Rencontres".
        </p>
        <div className="ranking-grid">
          {LYCEE_RANKING.map((row) => (
            <div key={row.rank} className={`ranking-cell${row.top ? ' top1' : ''}`}>
              <div className="rank">{row.rank}</div>
              <div className="pts">{row.pts}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>
          Du 11e au 19e rang : 40, 35, 30, 30, 25, 20, 15, 10, 5 pts. Au-delà :
          0 pt.
        </p>
      </article>
    </div>
  );
}
