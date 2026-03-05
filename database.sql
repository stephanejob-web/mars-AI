-- ============================================================
--  marsAI 2026 — Schéma de base de données
--  Stack      : React · Express.js · MySQL 8.x
--  Charset    : utf8mb4 / utf8mb4_unicode_ci
--  Stockage   : Scaleway S3 (vidéos) · YouTube API (diffusion)
--
--  17 tables · 3NF · indexes stratégiques · FK contraintes
-- ============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
--  DROP — ordre inverse des dépendances
-- ============================================================
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS jury_liste_films;
DROP TABLE IF EXISTS jury_listes;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS evaluations;
DROP TABLE IF EXISTS assignations;
DROP TABLE IF EXISTS awards;
DROP TABLE IF EXISTS sponsors;
DROP TABLE IF EXISTS moderation_presets;
DROP TABLE IF EXISTS film_collaborateurs;
DROP TABLE IF EXISTS film_ia;
DROP TABLE IF EXISTS films;
DROP TABLE IF EXISTS email_tokens;
DROP TABLE IF EXISTS phases;
DROP TABLE IF EXISTS realisateurs;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS site_config;

SET FOREIGN_KEY_CHECKS = 1;


-- ============================================================
--  1. USERS — Jury · Modérateurs · Administrateurs
--     Hors réalisateurs — pas de compte requis pour soumettre
-- ============================================================
CREATE TABLE users (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  nom           VARCHAR(150)    NOT NULL,
  email         VARCHAR(255)    NOT NULL,
  password_hash VARCHAR(255)    NULL     COMMENT 'NULL si auth Google uniquement',
  google_id     VARCHAR(100)    NULL     COMMENT 'sub OAuth2 Google',
  role          ENUM('admin','jury','moderateur') NOT NULL DEFAULT 'jury',
  actif         TINYINT(1)      NOT NULL DEFAULT 1,
  last_login_at TIMESTAMP       NULL,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email  (email),
  UNIQUE KEY uq_users_google (google_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Comptes jury, modérateurs et administrateurs (hors réalisateurs)';


-- ============================================================
--  2. RÉALISATEURS — Participants (dépôt sans inscription)
--     RGPD : conservation 3 ans après festival, puis anonymisation
-- ============================================================
CREATE TABLE realisateurs (
  id                INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  civilite          ENUM('M','Mme') NOT NULL,
  prenom            VARCHAR(100)    NOT NULL,
  nom               VARCHAR(100)    NOT NULL,
  date_naissance    DATE            NOT NULL,
  metier            VARCHAR(150)    NOT NULL,
  email             VARCHAR(255)    NOT NULL,
  email_verifie     TINYINT(1)      NOT NULL DEFAULT 0,
  mobile            VARCHAR(30)     NOT NULL,
  telephone         VARCHAR(30)     NULL,

  -- Adresse postale
  rue               VARCHAR(255)    NOT NULL,
  code_postal       VARCHAR(20)     NOT NULL,
  ville             VARCHAR(100)    NOT NULL,
  pays              CHAR(2)         NOT NULL COMMENT 'ISO 3166-1 alpha-2',

  -- Réseaux sociaux (facultatifs)
  social_youtube    VARCHAR(255)    NULL,
  social_instagram  VARCHAR(255)    NULL,
  social_linkedin   VARCHAR(255)    NULL,
  social_facebook   VARCHAR(255)    NULL,
  social_xtwitter   VARCHAR(255)    NULL,

  source_decouverte ENUM('rs','presse','bouche','ecole','partenaire','newsletter','autre') NULL,
  newsletter        TINYINT(1)      NOT NULL DEFAULT 0,
  created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_realisateurs_email (email),
  INDEX      idx_realisateurs_pays (pays)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Réalisateurs — données conservées 3 ans (RGPD art. 5)';


-- ============================================================
--  3. EMAIL_TOKENS — Vérification OTP avant dépôt de film
--     Code à 6 chiffres · expiration 15 min · usage unique
-- ============================================================
CREATE TABLE email_tokens (
  id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  email      VARCHAR(255)  NOT NULL,
  token      CHAR(64)      NOT NULL COMMENT 'HMAC-SHA256 ou UUID v4 hex',
  expires_at TIMESTAMP     NOT NULL,
  used_at    TIMESTAMP     NULL     COMMENT 'NULL = token encore valide',
  created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_email_tokens_token (token),
  INDEX      idx_email_tokens_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Tokens OTP de vérification email — expiration 15 min, usage unique';


-- ============================================================
--  4. FILMS — Identité · Médias · Cycle de vie  [Étape 2]
--     Stockage : Scaleway S3 (archive) + YouTube API (diffusion)
--     La déclaration IA + RGPD est dans film_ia  [Étapes 3 & 4]
-- ============================================================
CREATE TABLE films (
  id               INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  realisateur_id   INT UNSIGNED    NOT NULL,
  numero_dossier   VARCHAR(20)     NOT NULL COMMENT 'Format : MAI-2026-XXXXX',

  -- Identité du film
  titre_fr         VARCHAR(100)    NOT NULL,
  titre_en         VARCHAR(100)    NOT NULL,
  langue           VARCHAR(10)     NOT NULL DEFAULT 'fr' COMMENT 'ISO 639-1',
  tags             VARCHAR(300)    NULL     COMMENT 'Max 5 tags libres, séparés par virgule',
  synopsis_fr      VARCHAR(500)    NOT NULL,
  synopsis_en      VARCHAR(500)    NOT NULL,
  intention        TEXT            NOT NULL COMMENT 'Note créative — max 1 000 caractères',

  -- Médias vidéo (double stockage CDC §4)
  video_s3_key     VARCHAR(500)    NULL COMMENT 'Clé S3 · ex: Reves_Fontaine_Lea_20260301_France.mp4',
  video_youtube_id VARCHAR(20)     NULL COMMENT 'ID YouTube après upload API · ex: dQw4w9WgXcQ',
  video_duree      DECIMAL(5,2)    NULL COMMENT 'Durée en secondes (ex : 59.80)',

  -- Médias complémentaires
  poster_path      VARCHAR(500)    NULL COMMENT 'Affiche JPG/PNG/GIF — max 2 Mo',
  subtitle_fr_path VARCHAR(500)    NULL COMMENT 'Fichier SRT/VTT français',
  subtitle_en_path VARCHAR(500)    NULL COMMENT 'Fichier SRT/VTT anglais',

  -- Modération admin / modérateur (CDC §5)
  moderation_tag     VARCHAR(100)  NULL COMMENT 'Tag preset sélectionné (ex: hors_theme)',
  moderation_message TEXT          NULL COMMENT 'Message final envoyé au réalisateur',
  moderation_par     INT UNSIGNED  NULL COMMENT 'Admin ou modérateur ayant statué',
  moderation_le      TIMESTAMP     NULL,

  -- Cycle de vie
  statut           ENUM('brouillon','soumis','verifie','assigne','selectionne','finaliste','rejete','gagnant')
                                   NOT NULL DEFAULT 'brouillon',
  youtube_status   ENUM('pending','approved','rejected_copyright','rejected_content')
                                   NOT NULL DEFAULT 'pending',
  admin_selection  TINYINT(1)      NOT NULL DEFAULT 0 COMMENT 'Étoile admin — vue Sélection',

  soumis_le        TIMESTAMP       NULL,
  created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY  uq_films_dossier       (numero_dossier),
  UNIQUE KEY  uq_films_youtube       (video_youtube_id),
  CONSTRAINT  fk_films_realisateur   FOREIGN KEY (realisateur_id) REFERENCES realisateurs (id) ON DELETE RESTRICT,
  CONSTRAINT  fk_films_moderation    FOREIGN KEY (moderation_par) REFERENCES users (id) ON DELETE SET NULL,
  INDEX       idx_films_realisateur  (realisateur_id),
  INDEX       idx_films_statut       (statut),
  INDEX       idx_films_yt_status    (youtube_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Films soumis — identité, médias, statuts (un réalisateur peut déposer N films)';


-- ============================================================
--  5. FILM_IA — Déclaration IA + consentements RGPD  [Étapes 3 & 4]
--     Relation 1-to-1 avec films · créée à la soumission finale
-- ============================================================
CREATE TABLE film_ia (
  film_id            INT UNSIGNED  NOT NULL COMMENT 'PK + FK — 1-to-1 avec films',

  -- Déclaration d'usage IA
  ia_classification  ENUM('full','hybrid') NOT NULL COMMENT 'full = 100% IA · hybrid = IA + humain',
  ia_outils_image    TEXT          NOT NULL COMMENT 'Requis (ex : Runway ML, Sora)',
  ia_outils_son      TEXT          NULL,
  ia_outils_scenario TEXT          NULL,
  ia_outils_postprod TEXT          NULL,

  -- Consentements RGPD obligatoires (3 cases — étape 4)
  rgpd_diffusion     TINYINT(1)    NOT NULL DEFAULT 0 COMMENT 'Cession droits diffusion 5 ans',
  rgpd_donnees       TINYINT(1)    NOT NULL DEFAULT 0 COMMENT 'Conservation données 3 ans',
  rgpd_originalite   TINYINT(1)    NOT NULL DEFAULT 0 COMMENT 'Certification auteur + usage IA déclaré exact',

  PRIMARY KEY (film_id),
  CONSTRAINT fk_filmia_film FOREIGN KEY (film_id) REFERENCES films (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Déclaration IA obligatoire + consentements RGPD — 1-to-1 avec films';


-- ============================================================
--  6. FILM_COLLABORATEURS — Co-auteurs et équipe du film
--     CDC §3 : collaborateurs avec rôle et profession
-- ============================================================
CREATE TABLE film_collaborateurs (
  film_id    INT UNSIGNED  NOT NULL,
  nom        VARCHAR(150)  NOT NULL,
  profession VARCHAR(150)  NOT NULL COMMENT 'ex : Compositeur, Voix off, Motion designer',
  role_film  VARCHAR(150)  NULL     COMMENT 'ex : Co-réalisateur, Coordinateur IA',

  PRIMARY KEY (film_id, nom),
  CONSTRAINT fk_collab_film FOREIGN KEY (film_id) REFERENCES films (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Collaborateurs déclarés par le réalisateur (équipe projet)';


-- ============================================================
--  7. MODERATION_PRESETS — Templates d'email de modération
--     Gérés par l'admin · CDC §5 : bibliothèque de tags
-- ============================================================
CREATE TABLE moderation_presets (
  id       SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  tag      VARCHAR(100)      NOT NULL UNIQUE COMMENT 'Identifiant machine (ex: hors_theme)',
  titre    VARCHAR(200)      NOT NULL          COMMENT 'Libellé affiché dans l''interface',
  template TEXT              NOT NULL          COMMENT 'Corps du message — variables : {{prenom}}, {{titre}}',
  actif    TINYINT(1)        NOT NULL DEFAULT 1,

  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Templates email de modération — admin peut ajouter / modifier / désactiver';


-- ============================================================
--  8. PHASES — Phases d'évaluation jury + phases publiques
-- ============================================================
CREATE TABLE phases (
  id           TINYINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  nom          VARCHAR(100)      NOT NULL COMMENT 'ex : Présélection Top 50',
  description  VARCHAR(500)      NULL,
  nb_films_max SMALLINT UNSIGNED NOT NULL DEFAULT 50 COMMENT 'Nb films max sélectionnés (configurable)',
  ouverture_le DATE              NOT NULL,
  fermeture_le DATE              NOT NULL,
  statut       ENUM('a_venir','en_cours','terminee') NOT NULL DEFAULT 'a_venir',

  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Phases jury — Phase 1 (Top 50) · Phase 2 (Top 5 finale, configurable)';


-- ============================================================
--  9. ASSIGNATIONS — Films attribués aux jurés par phase
--     PK composite : garantit unicité sans colonne id superflue
-- ============================================================
CREATE TABLE assignations (
  film_id     INT UNSIGNED      NOT NULL,
  user_id     INT UNSIGNED      NOT NULL COMMENT 'Juré assigné',
  phase_id    TINYINT UNSIGNED  NOT NULL,
  assigned_at TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (film_id, user_id, phase_id),
  CONSTRAINT fk_assign_film  FOREIGN KEY (film_id)  REFERENCES films  (id) ON DELETE CASCADE,
  CONSTRAINT fk_assign_user  FOREIGN KEY (user_id)  REFERENCES users  (id) ON DELETE CASCADE,
  CONSTRAINT fk_assign_phase FOREIGN KEY (phase_id) REFERENCES phases (id) ON DELETE RESTRICT,
  INDEX idx_assign_user  (user_id),
  INDEX idx_assign_phase (phase_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Pivot film ↔ juré par phase — 1 film assigné à N jurés';


-- ============================================================
-- 10. EVALUATIONS — Votes individuels du jury
--     1 évaluation par juré · par film · par phase (UNIQUE)
--     note_privee  : visible uniquement par le juré
--     commentaire  : visible par tout le jury (si toggle actif)
-- ============================================================
CREATE TABLE evaluations (
  id          INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  film_id     INT UNSIGNED      NOT NULL,
  user_id     INT UNSIGNED      NOT NULL COMMENT 'Juré évaluateur',
  phase_id    TINYINT UNSIGNED  NOT NULL,
  decision    ENUM('valide','refuse','arevoir','discuss')
                                NULL     COMMENT 'NULL = pas encore évalué',
  note_privee TEXT              NULL     COMMENT 'Note personnelle — visible uniquement par le juré',
  commentaire TEXT              NULL     COMMENT 'Commentaire public — visible par tout le jury',
  created_at  TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY  uq_eval_film_user_phase (film_id, user_id, phase_id),
  CONSTRAINT  fk_eval_film  FOREIGN KEY (film_id)  REFERENCES films  (id) ON DELETE CASCADE,
  CONSTRAINT  fk_eval_user  FOREIGN KEY (user_id)  REFERENCES users  (id) ON DELETE CASCADE,
  CONSTRAINT  fk_eval_phase FOREIGN KEY (phase_id) REFERENCES phases (id) ON DELETE RESTRICT,
  INDEX       idx_eval_film (film_id),
  INDEX       idx_eval_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Évaluations jury — 1 vote + note privée + commentaire public par film/phase';


-- ============================================================
-- 11. TICKETS — Signalements jury → administration
-- ============================================================
CREATE TABLE tickets (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  film_id     INT UNSIGNED  NOT NULL,
  emis_par    INT UNSIGNED  NOT NULL COMMENT 'Juré ou modérateur',
  motif       ENUM('copyright','contenu_inapproprie','technique','autre') NOT NULL,
  description TEXT          NOT NULL,
  statut      ENUM('ouvert','en_traitement','resolu') NOT NULL DEFAULT 'ouvert',
  resolu_par  INT UNSIGNED  NULL COMMENT 'Admin ayant clos le ticket',
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_ticket_film   FOREIGN KEY (film_id)    REFERENCES films (id) ON DELETE CASCADE,
  CONSTRAINT fk_ticket_emis   FOREIGN KEY (emis_par)   REFERENCES users (id) ON DELETE RESTRICT,
  CONSTRAINT fk_ticket_resolu FOREIGN KEY (resolu_par) REFERENCES users (id) ON DELETE SET NULL,
  INDEX idx_ticket_film   (film_id),
  INDEX idx_ticket_statut (statut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Signalements jury → admin : copyright, contenu, technique';


-- ============================================================
-- 12. SPONSORS — Partenaires et sponsors du festival
-- ============================================================
CREATE TABLE sponsors (
  id        TINYINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  nom       VARCHAR(150)      NOT NULL,
  niveau    ENUM('principal','partenaire','media','institutionnel') NOT NULL DEFAULT 'partenaire',
  logo_path VARCHAR(255)      NULL,
  lien_url  VARCHAR(255)      NULL,

  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Sponsors et partenaires — affichés sur accueil + liés aux awards';


-- ============================================================
-- 13. AWARDS — Prix du festival
-- ============================================================
CREATE TABLE awards (
  id          TINYINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  nom         VARCHAR(150)      NOT NULL,
  description VARCHAR(500)      NULL,
  montant_eur DECIMAL(8,2)      NULL     COMMENT 'NULL = prix non monétaire (trophée)',
  sponsor_id  TINYINT UNSIGNED  NULL,
  film_id     INT UNSIGNED      NULL     COMMENT 'Lauréat — NULL avant délibération finale',

  PRIMARY KEY (id),
  CONSTRAINT fk_award_sponsor FOREIGN KEY (sponsor_id) REFERENCES sponsors (id) ON DELETE SET NULL,
  CONSTRAINT fk_award_film    FOREIGN KEY (film_id)    REFERENCES films    (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Awards festival : Grand Prix, Meilleure Réalisation, Prix du Public…';


-- ============================================================
-- 14. JURY_LISTES — Listes personnelles privées des jurés
-- ============================================================
CREATE TABLE jury_listes (
  id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id    INT UNSIGNED  NOT NULL,
  nom        VARCHAR(150)  NOT NULL,
  created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_jl_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  INDEX      idx_jl_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Listes privées jury — visibles uniquement par leur auteur';


-- ============================================================
-- 15. JURY_LISTE_FILMS — Films dans une liste privée
-- ============================================================
CREATE TABLE jury_liste_films (
  liste_id    INT UNSIGNED     NOT NULL,
  film_id     INT UNSIGNED     NOT NULL,
  note_privee TEXT             NULL COMMENT 'Annotation personnelle sur ce film dans cette liste',
  position    TINYINT UNSIGNED NULL COMMENT 'Ordre dans la liste',

  PRIMARY KEY (liste_id, film_id),
  CONSTRAINT fk_jlf_liste FOREIGN KEY (liste_id) REFERENCES jury_listes (id) ON DELETE CASCADE,
  CONSTRAINT fk_jlf_film  FOREIGN KEY (film_id)  REFERENCES films       (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Pivot : films appartenant aux listes privées des jurés';


-- ============================================================
-- 16. CHAT_MESSAGES — Messagerie interne jury
-- ============================================================
CREATE TABLE chat_messages (
  id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  expediteur_id   INT UNSIGNED  NOT NULL,
  destinataire_id INT UNSIGNED  NULL     COMMENT 'NULL = broadcast groupe',
  contenu         TEXT          NOT NULL,
  lu_le           TIMESTAMP     NULL     COMMENT 'NULL = non lu',
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_chat_exp  FOREIGN KEY (expediteur_id)   REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_dest FOREIGN KEY (destinataire_id) REFERENCES users (id) ON DELETE SET NULL,
  INDEX idx_chat_exp  (expediteur_id),
  INDEX idx_chat_dest (destinataire_id),
  INDEX idx_chat_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Messagerie interne jury et admin — broadcast si destinataire_id IS NULL';


-- ============================================================
-- 17. SITE_CONFIG — CMS · Paramètres éditoriaux administrables
--     Clé-valeur typé : évite toute migration pour un paramètre
--     CDC §8 : hero vidéo, textes, phases publiques, jury_peer_visibility…
-- ============================================================
CREATE TABLE site_config (
  cle        VARCHAR(100)  NOT NULL COMMENT 'ex: hero_video_url, jury_peer_visibility',
  valeur     TEXT          NULL,
  type       ENUM('text','url','html','json','boolean','date') NOT NULL DEFAULT 'text',
  updated_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (cle)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='CMS admin — paramètres éditoriaux et toggles de configuration';


-- ============================================================
--  DONNÉES INITIALES
-- ============================================================

-- Configuration site + toggles privacy jury (CDC §6)
INSERT INTO site_config (cle, type, valeur) VALUES
  ('festival_annee',          'text',    '2026'),
  ('festival_theme',          'text',    'Imaginez des futurs souhaitables'),
  ('festival_lieu',           'text',    'Friche Belle de Mai, Marseille'),
  ('depot_ouvert',            'boolean', '1'),
  ('depot_date_debut',        'date',    '2026-04-01'),
  ('depot_date_fin',          'date',    '2026-09-30'),
  ('jury_peer_visibility',    'boolean', '0'),  -- CDC §6 : désactivé par défaut
  ('admin_comment_access',    'boolean', '0'),  -- CDC §6 : désactivé par défaut
  ('phase1_active',           'boolean', '0'),
  ('phase2_active',           'boolean', '0'),
  ('phase3_active',           'boolean', '0'); -- Palmarès

-- Phases d'évaluation jury
INSERT INTO phases (nom, description, nb_films_max, ouverture_le, fermeture_le, statut) VALUES
  ('Présélection Top 50',
   'Chaque juré évalue les films assignés. Sélection des 50 meilleurs.',
   50, '2026-12-12', '2026-12-19', 'a_venir'),
  ('Finale',
   'Délibération collégiale sur les finalistes issus de la Phase 1.',
   5,  '2026-12-22', '2026-12-28', 'a_venir');

-- Awards
INSERT INTO awards (nom, description, montant_eur) VALUES
  ('Grand Prix marsAI',          'Meilleur film de la compétition officielle',          5000.00),
  ('Prix Meilleure Réalisation', 'Excellence dans la direction artistique',             2000.00),
  ('Prix du Public',             'Film le plus apprécié via vote en ligne',             1000.00),
  ('Prix Coup de Cœur Jury',    'Mention spéciale décernée librement par le jury',       NULL);

-- Templates modération (CDC §5 — bibliothèque presets)
INSERT INTO moderation_presets (tag, titre, template) VALUES
  ('hors_theme',
   'Film hors thème',
   'Bonjour {{prenom}},\n\nAprès examen de votre film "{{titre}}", le jury considère qu''il ne s''inscrit pas suffisamment dans le thème "Imaginez des futurs souhaitables".\n\nCordialement,\nL''équipe marsAI'),
  ('duree_non_conforme',
   'Durée non conforme',
   'Bonjour {{prenom}},\n\nLa durée de votre film "{{titre}}" ne respecte pas les 60 secondes réglementaires (+/-2s). Nous ne pouvons pas le retenir en l''état.\n\nCordialement,\nL''équipe marsAI'),
  ('sous_titres_insuffisants',
   'Sous-titres insuffisants',
   'Bonjour {{prenom}},\n\nLes sous-titres de votre film "{{titre}}" sont absents ou non conformes. Les sous-titres FR sont obligatoires.\n\nCordialement,\nL''équipe marsAI'),
  ('qualite_insuffisante',
   'Qualité insuffisante',
   'Bonjour {{prenom}},\n\nAprès visionnage, le jury estime que la qualité technique ou artistique de "{{titre}}" ne remplit pas les critères de sélection.\n\nCordialement,\nL''équipe marsAI'),
  ('contenu_inapproprie',
   'Contenu inapproprié',
   'Bonjour {{prenom}},\n\nVotre film "{{titre}}" contient des éléments qui ne respectent pas le règlement du festival.\n\nCordialement,\nL''équipe marsAI');

-- Compte administrateur par défaut
-- IMPORTANT : remplacer password_hash avant déploiement
INSERT INTO users (nom, email, password_hash, role) VALUES
  ('Admin marsAI', 'admin@marsai.fr',
   '$2b$12$PLACEHOLDER_HASH_A_REMPLACER_AVANT_PROD',
   'admin');
