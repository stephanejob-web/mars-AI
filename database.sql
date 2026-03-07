-- ============================================================
--  marsAI 2026 — Schema de base de donnees
--  Stack      : React · Express.js · MySQL 8.x
--  Charset    : utf8mb4 / utf8mb4_unicode_ci
--  Genere depuis l'analyse de la maquette HTML
-- ============================================================

CREATE DATABASE IF NOT EXISTS marsai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE marsai;

-- ────────────────────────────────────────────────────────────
-- USERS
-- Comptes internes : admin, jury, moderateurs.
-- password_hash NULL  → compte Google OAuth uniquement.
-- google_sub    NULL  → compte email/password uniquement.
-- Les deux peuvent coexister si l'utilisateur lie son Google.
-- ────────────────────────────────────────────────────────────
CREATE TABLE users (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  email         VARCHAR(255)    NOT NULL,
  password_hash VARCHAR(255)    NULL,
  google_sub    VARCHAR(255)    NULL,
  first_name    VARCHAR(100)    NOT NULL,
  last_name     VARCHAR(100)    NOT NULL,
  role          ENUM('admin','jury','moderator') NOT NULL,
  is_active     TINYINT(1)      NOT NULL DEFAULT 1,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_google_sub (google_sub)
  -- Note : en MySQL 8+, UNIQUE accepte plusieurs lignes NULL,
  --        donc google_sub NULL pour plusieurs users est valide.
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- INVITATIONS
-- Token unique envoye par mail depuis le panneau admin.
-- Flow : admin invite → token genere → mail envoye → jury clique
--        → invite.html valide le token → compte cree dans users.
-- ────────────────────────────────────────────────────────────
CREATE TABLE invitations (
  id           INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  email        VARCHAR(255)    NOT NULL,
  role         ENUM('jury','moderator') NOT NULL,
  token        VARCHAR(128)    NOT NULL,
  invited_by   INT UNSIGNED    NOT NULL,
  expires_at   DATETIME        NOT NULL,
  used_at      DATETIME        NULL,
  created_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_invitations_token (token),
  INDEX idx_invitations_email (email),
  FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- DIRECTORS
-- Realisateurs candidats — ne se connectent pas au backoffice.
-- Un meme director peut soumettre plusieurs films (regle festival).
-- ────────────────────────────────────────────────────────────
CREATE TABLE directors (
  id                INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  salutation        ENUM('M','Mme') NOT NULL,
  first_name        VARCHAR(100)    NOT NULL,
  last_name         VARCHAR(100)    NOT NULL,
  birth_date        DATE            NOT NULL,
  profession        VARCHAR(150)    NOT NULL,
  email             VARCHAR(255)    NOT NULL,
  phone             VARCHAR(30)     NULL,
  mobile            VARCHAR(30)     NOT NULL,
  discovery_source  VARCHAR(50)     NULL,
  newsletter_opt_in TINYINT(1)      NOT NULL DEFAULT 0,
  created_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_directors_email (email)
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- DIRECTOR_ADDRESSES
-- Separee de directors pour eviter une table trop large.
-- Relation 1-1 : UNIQUE KEY sur director_id.
-- ────────────────────────────────────────────────────────────
CREATE TABLE director_addresses (
  id           INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  director_id  INT UNSIGNED    NOT NULL,
  street       VARCHAR(255)    NOT NULL,
  postal_code  VARCHAR(20)     NOT NULL,
  city         VARCHAR(100)    NOT NULL,
  country_code CHAR(2)         NOT NULL,
  created_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_director_address (director_id),
  FOREIGN KEY (director_id) REFERENCES directors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- DIRECTOR_SOCIAL_LINKS
-- 1 ligne par plateforme. UNIQUE (director_id, platform).
-- Extensible sans ALTER TABLE si on ajoute un reseau.
-- ────────────────────────────────────────────────────────────
CREATE TABLE director_social_links (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  director_id INT UNSIGNED    NOT NULL,
  platform    ENUM('youtube','instagram','linkedin','facebook','twitter') NOT NULL,
  handle      VARCHAR(255)    NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_director_platform (director_id, platform),
  FOREIGN KEY (director_id) REFERENCES directors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- FILMS
-- Dossiers de candidature avec sauvegarde auto de brouillon.
-- Les champs des etapes 2 et 3 sont NULL en draft (step 1) :
--   step 1 → profil director uniquement, film cree vide
--   step 2 → titres, synopses, video, note d'intention
--   step 3 → ia_type, outils, sous-titres
--   step 4 → soumission finale (status = 'submitted')
-- La validation de NOT NULL est assuree par l'API, pas le schema,
-- car les donnees arrivent progressivement via auto-save.
-- ────────────────────────────────────────────────────────────
CREATE TABLE films (
  id                   INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  director_id          INT UNSIGNED     NOT NULL,

  -- Etape 2 — Le Film
  title_fr             VARCHAR(100)     NULL,
  title_en             VARCHAR(100)     NULL,
  language_code        VARCHAR(10)      NULL,
  synopsis_fr          VARCHAR(300)     NULL,
  synopsis_en          VARCHAR(300)     NULL,
  intention_note       TEXT             NULL,
  creation_tools_desc  TEXT             NULL,

  -- Etape 3 — Declaration IA
  ia_type              ENUM('full','hybrid') NULL,
  ai_tools_image       VARCHAR(255)     NULL,
  ai_tools_sound       VARCHAR(255)     NULL,
  ai_tools_script      VARCHAR(255)     NULL,
  ai_tools_post_prod   VARCHAR(255)     NULL,

  -- Fichier video (stocke cote serveur / S3)
  video_path           VARCHAR(500)     NULL,
  video_duration_sec   DECIMAL(6,2)     NULL,
  video_format         VARCHAR(10)      NULL,
  video_size_mb        DECIMAL(7,2)     NULL,

  -- Sous-titres (SRT / VTT)
  subtitle_fr_path     VARCHAR(500)     NULL,
  subtitle_en_path     VARCHAR(500)     NULL,

  -- Verification YouTube API
  youtube_video_id     VARCHAR(20)      NULL,
  youtube_status       ENUM('pending','approved','rejected_copyright','rejected_content')
                                        NOT NULL DEFAULT 'pending',
  copyright_ok         TINYINT(1)       NOT NULL DEFAULT 0,

  -- Consentements RGPD (step 4 — les 3 cases doivent etre cochees avant soumission)
  -- consent_rights      : cession de droits de diffusion (5 ans)
  -- consent_rgpd        : conservation des donnees personnelles (3 ans, RGPD)
  -- consent_originality : certification d'originalite et d'usage sincere des outils IA
  consent_rights       TINYINT(1)       NOT NULL DEFAULT 0,
  consent_rgpd         TINYINT(1)       NOT NULL DEFAULT 0,
  consent_originality  TINYINT(1)       NOT NULL DEFAULT 0,

  -- Suivi du dossier
  submission_number    VARCHAR(20)      NULL,
  status               ENUM('draft','submitted','verified','withdrawn')
                                        NOT NULL DEFAULT 'draft',
  submission_step      TINYINT UNSIGNED NOT NULL DEFAULT 1,

  created_at           DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_submission_number (submission_number),
  INDEX idx_films_director (director_id),
  INDEX idx_films_status (status),
  FOREIGN KEY (director_id) REFERENCES directors(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- FILM_TAGS
-- Tags libres (max 5 cote UI) associes a un film.
-- 1 ligne par tag — normalise pour permettre la recherche par tag.
-- ────────────────────────────────────────────────────────────
CREATE TABLE film_tags (
  id      INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  film_id INT UNSIGNED    NOT NULL,
  tag     VARCHAR(50)     NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_film_tag (film_id, tag),
  INDEX idx_film_tags_tag (tag),
  FOREIGN KEY (film_id) REFERENCES films(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- PHASES
-- Phase 1 : preselecton Top 50  (target_count = 50)
-- Phase 2 : finale Top 5        (target_count = 5)
-- is_active : une seule phase active a la fois (gere par l'API).
-- ────────────────────────────────────────────────────────────
CREATE TABLE phases (
  id            INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  phase_number  TINYINT UNSIGNED NOT NULL,
  name          VARCHAR(100)     NOT NULL,
  target_count  TINYINT UNSIGNED NOT NULL,
  open_date     DATE             NOT NULL,
  close_date    DATE             NOT NULL,
  is_active     TINYINT(1)       NOT NULL DEFAULT 0,
  created_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_phase_number (phase_number)
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- FILM_ASSIGNMENTS
-- Attribution d'un film a un jure pour une phase donnee.
-- Index (user_id, phase_id) : "films assignes a ce jure dans cette phase"
--   → requete principale du dashboard jury.
-- ────────────────────────────────────────────────────────────
CREATE TABLE film_assignments (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  film_id     INT UNSIGNED    NOT NULL,
  user_id     INT UNSIGNED    NOT NULL,
  phase_id    INT UNSIGNED    NOT NULL,
  assigned_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_assignment (film_id, user_id, phase_id),
  INDEX idx_assignments_jury_phase (user_id, phase_id),
  FOREIGN KEY (film_id)  REFERENCES films(id)  ON DELETE CASCADE,
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (phase_id) REFERENCES phases(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- JURY_EVALUATIONS
-- Decision formelle d'un jure sur un film (1 seule par triplet).
-- comment = note privee liee a la decision (pas publiee).
-- Index (user_id, phase_id) : stats de participation par jure.
-- ────────────────────────────────────────────────────────────
CREATE TABLE jury_evaluations (
  id         INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  film_id    INT UNSIGNED    NOT NULL,
  user_id    INT UNSIGNED    NOT NULL,
  phase_id   INT UNSIGNED    NOT NULL,
  decision   ENUM('valide','arevoir','refuse','discuter') NOT NULL,
  reason     ENUM('rights','quality','content','tech','other') NULL,
  -- reason est obligatoire pour les decisions 'arevoir' et 'refuse' (valide cote API).
  -- Valeurs : rights=droits musicaux, quality=qualite, content=contenu, tech=YouTube/tech, other=autre
  comment    TEXT            NULL,
  created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_evaluation (film_id, user_id, phase_id),
  INDEX idx_evaluations_jury_phase (user_id, phase_id),
  INDEX idx_evaluations_film (film_id),
  FOREIGN KEY (film_id)  REFERENCES films(id)  ON DELETE CASCADE,
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (phase_id) REFERENCES phases(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- JURY_COMMENTS
-- Commentaires publics (visibles par tout le jury).
-- Distincts de jury_evaluations.comment (prive).
-- Un jure peut publier plusieurs commentaires sur un meme film.
-- ────────────────────────────────────────────────────────────
CREATE TABLE jury_comments (
  id         INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  film_id    INT UNSIGNED    NOT NULL,
  user_id    INT UNSIGNED    NOT NULL,
  content    TEXT            NOT NULL,
  created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_jury_comments_film (film_id),
  FOREIGN KEY (film_id) REFERENCES films(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- FILM_SELECTIONS
-- Decision admin : film selectionne / finaliste / rejete.
-- Une seule decision par (film, phase).
-- Index (phase_id, status) : "Top 50 selectionnes" ou "Top 5 finalistes".
-- ────────────────────────────────────────────────────────────
CREATE TABLE film_selections (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  film_id     INT UNSIGNED    NOT NULL,
  phase_id    INT UNSIGNED    NOT NULL,
  status      ENUM('selected','finalist','rejected') NOT NULL,
  decided_by  INT UNSIGNED    NOT NULL,
  decided_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_selection (film_id, phase_id),
  INDEX idx_selections_phase_status (phase_id, status),
  FOREIGN KEY (film_id)    REFERENCES films(id)  ON DELETE CASCADE,
  FOREIGN KEY (phase_id)   REFERENCES phases(id) ON DELETE CASCADE,
  FOREIGN KEY (decided_by) REFERENCES users(id)  ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- MODERATION_TICKETS
-- Signalements jury remonte a l'admin pour traitement.
-- Index (status) : comptage rapide des tickets ouverts.
-- ────────────────────────────────────────────────────────────
CREATE TABLE moderation_tickets (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  film_id         INT UNSIGNED    NOT NULL,
  reported_by     INT UNSIGNED    NOT NULL,
  type            ENUM('rights','quality','content','tech','other') NOT NULL DEFAULT 'other',
  -- type : categorie du signalement (correspond aux chips de la modale admin-jury)
  reason          TEXT            NOT NULL,
  status          ENUM('open','in_progress','resolved','dismissed') NOT NULL DEFAULT 'open',
  -- in_progress : admin a clique "Prendre en charge" mais pas encore resolu
  resolved_by     INT UNSIGNED    NULL,
  resolution_note TEXT            NULL,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at     DATETIME        NULL,
  PRIMARY KEY (id),
  INDEX idx_tickets_status (status),
  INDEX idx_tickets_film (film_id),
  FOREIGN KEY (film_id)     REFERENCES films(id) ON DELETE CASCADE,
  FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- SPONSORS
-- tier : niveau du partenariat (visible dans la vue Awards admin).
-- ────────────────────────────────────────────────────────────
CREATE TABLE sponsors (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  name        VARCHAR(150)    NOT NULL,
  tier        ENUM('principal','partenaire','media','institution') NOT NULL DEFAULT 'partenaire',
  logo_url    VARCHAR(500)    NULL,
  website_url VARCHAR(500)    NULL,
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- AWARDS
-- Prix du festival. sponsor_id et winner_film_id sont NULL
-- jusqu'a attribution (ex: "Prix Coup de Coeur Jury" sans dotation
-- en euros → prize_amount_eur NULL, prize_label = "Trophe").
-- ────────────────────────────────────────────────────────────
CREATE TABLE awards (
  id               INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  name             VARCHAR(150)    NOT NULL,
  description      TEXT            NULL,
  sponsor_id       INT UNSIGNED    NULL,
  prize_amount_eur DECIMAL(10,2)   NULL,
  prize_label      VARCHAR(100)    NULL,
  winner_film_id   INT UNSIGNED    NULL,
  created_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (sponsor_id)     REFERENCES sponsors(id) ON DELETE SET NULL,
  FOREIGN KEY (winner_film_id) REFERENCES films(id)    ON DELETE SET NULL
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- JURY_LISTS
-- Listes privees d'annotations d'un jure (jamais visibles
-- par les autres membres du jury ni par l'admin).
-- ────────────────────────────────────────────────────────────
CREATE TABLE jury_lists (
  id         INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  user_id    INT UNSIGNED    NOT NULL,
  name       VARCHAR(100)    NOT NULL,
  emoji      VARCHAR(10)     NULL,
  notes      TEXT            NULL,
  created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_jury_lists_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- JURY_LIST_FILMS
-- Table pivot jury_lists <-> films (relation N:M).
-- PK composite : pas d'id auto-increment necessaire ici.
-- ────────────────────────────────────────────────────────────
CREATE TABLE jury_list_films (
  list_id  INT UNSIGNED    NOT NULL,
  film_id  INT UNSIGNED    NOT NULL,
  added_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (list_id, film_id),
  INDEX idx_jury_list_films_film (film_id),
  FOREIGN KEY (list_id) REFERENCES jury_lists(id) ON DELETE CASCADE,
  FOREIGN KEY (film_id) REFERENCES films(id)      ON DELETE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- CHAT_MESSAGES
-- Messages du chat jury (canal unique, pas de rooms).
-- Index sur created_at : tri chronologique des messages.
-- ────────────────────────────────────────────────────────────
CREATE TABLE chat_messages (
  id         INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  sender_id  INT UNSIGNED    NOT NULL,
  content    TEXT            NOT NULL,
  created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_chat_created_at (created_at),
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- EMAIL_VERIFICATIONS
-- OTP / tokens pour quatre usages :
--   'depot'        → verification email avant soumission (verification-email.html)
--   'invite'       → confirmation apres inscription via lien invite.html
--   'register'     → confirmation apres inscription libre login-jury.html
--   'resubmission' → lien de re-soumission envoye quand YouTube rejette un film
--                    (lien valable 7 jours, dossier pre-rempli, film_id obligatoire)
-- film_id : rempli uniquement pour type='resubmission'.
-- ────────────────────────────────────────────────────────────
CREATE TABLE email_verifications (
  id           INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  email        VARCHAR(255)    NOT NULL,
  token        VARCHAR(128)    NOT NULL,
  type         ENUM('depot','invite','register','resubmission') NOT NULL,
  film_id      INT UNSIGNED    NULL,
  expires_at   DATETIME        NOT NULL,
  used_at      DATETIME        NULL,
  resend_count TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_token (token),
  INDEX idx_email_type (email, type),
  FOREIGN KEY (film_id) REFERENCES films(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- PASSWORD_RESET_TOKENS
-- Via : login-jury.html > "Mot de passe oublie ?"
-- Flow : POST /auth/forgot-password → token genere + envoye par mail
--        POST /auth/reset-password  → token verifie → hash mis a jour
-- Expiration recommandee : 15 a 30 minutes.
-- ────────────────────────────────────────────────────────────
CREATE TABLE password_reset_tokens (
  id         INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  user_id    INT UNSIGNED    NOT NULL,
  token      VARCHAR(128)    NOT NULL,
  expires_at DATETIME        NOT NULL,
  used_at    DATETIME        NULL,
  created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_reset_token (token),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- PUBLIC_VOTES
-- Prix du Public : vote en ligne ouvert pendant le festival.
-- Via : index.html section #palmares > "Prix du Public".
-- voter_email_hash : SHA-256 de l'email (jamais l'email brut).
-- voter_ip_hash    : SHA-256 de l'IP (anonymisation RGPD).
-- UNIQUE (film_id, voter_email_hash) : un vote par email par film.
-- phase_id : rattache le vote a la periode du festival active.
-- ────────────────────────────────────────────────────────────
CREATE TABLE public_votes (
  id               INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  film_id          INT UNSIGNED    NOT NULL,
  phase_id         INT UNSIGNED    NOT NULL,
  voter_email_hash VARCHAR(64)     NOT NULL,
  voter_ip_hash    VARCHAR(64)     NULL,
  voted_at         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_vote_per_film (film_id, voter_email_hash),
  INDEX idx_votes_film (film_id),
  INDEX idx_votes_phase (phase_id),
  FOREIGN KEY (film_id)  REFERENCES films(id)  ON DELETE CASCADE,
  FOREIGN KEY (phase_id) REFERENCES phases(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- SITE_SETTINGS
-- Table cle-valeur pour tous les contenus editables du site
-- depuis la vue "Administration site" (admin-panel.html).
--
-- Cles prevues :
--   hero_video_path      → chemin S3 de la video de fond
--   festival_name        → "marsAI 2026"
--   hero_tagline         → accroche principale
--   hero_subline         → sous-accroche
--   hero_cta_text        → texte du bouton principal
--   hero_tag_1 .. _4     → 4 tags affiches sous le hero
--   contact_email        → email public du festival
--   contact_instagram    → compte Instagram
--   contact_website      → URL du site
--   festival_description → description courte (section About)
-- ────────────────────────────────────────────────────────────
CREATE TABLE site_settings (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  setting_key VARCHAR(100)    NOT NULL,
  value       TEXT            NULL,
  updated_by  INT UNSIGNED    NULL,
  updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_setting_key (setting_key),
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- CALENDAR_EVENTS
-- Dates cles affichees publiquement sur le site.
-- Gestion depuis la carte "Calendrier" de la vue site admin.
-- is_visible : toggle on/off visible dans la maquette.
-- sort_order : ordre d'affichage.
-- ────────────────────────────────────────────────────────────
CREATE TABLE calendar_events (
  id          INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  name        VARCHAR(150)     NOT NULL,
  description VARCHAR(255)     NULL,
  event_date  DATE             NOT NULL,
  is_visible  TINYINT(1)       NOT NULL DEFAULT 1,
  sort_order  TINYINT UNSIGNED NOT NULL DEFAULT 0,
  updated_at  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- PUBLIC_JURY_MEMBERS
-- Membres du jury affiches sur la PAGE D'ACCUEIL publique.
-- Distincts des users (backoffice) : un membre public peut
-- etre purement editorial (sans acces au backoffice).
-- user_id    : lien optionnel vers users si le membre a aussi
--              un acces jury backoffice.
-- is_featured : 1 = carte vedette (Presidence du jury),
--               contrainte applicative : un seul a la fois.
-- sort_order  : ordre de la liste, modifiable par l'admin.
-- ────────────────────────────────────────────────────────────
CREATE TABLE public_jury_members (
  id          INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED     NULL,
  name        VARCHAR(150)     NOT NULL,
  role_label  VARCHAR(100)     NOT NULL,
  photo_url   VARCHAR(500)     NULL,
  is_featured TINYINT(1)       NOT NULL DEFAULT 0,
  is_visible  TINYINT(1)       NOT NULL DEFAULT 1,
  sort_order  TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- EMAIL_LOGS
-- Historique des emails manuels envoyes par l'admin aux realisateurs.
-- Via : admin-panel.html > modale "Email au realisateur" (depuis un ticket).
-- Egalement utilise pour les emails automatiques (rejet YouTube, etc.).
-- sent_by NULL → email envoye automatiquement par le systeme (pas un humain).
-- ────────────────────────────────────────────────────────────
CREATE TABLE email_logs (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  director_id INT UNSIGNED    NULL,
  film_id     INT UNSIGNED    NULL,
  ticket_id   INT UNSIGNED    NULL,
  sent_by     INT UNSIGNED    NULL,
  to_email    VARCHAR(255)    NOT NULL,
  subject     VARCHAR(300)    NOT NULL,
  body        TEXT            NOT NULL,
  sent_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_email_logs_director (director_id),
  INDEX idx_email_logs_film (film_id),
  INDEX idx_email_logs_ticket (ticket_id),
  FOREIGN KEY (director_id) REFERENCES directors(id)           ON DELETE SET NULL,
  FOREIGN KEY (film_id)     REFERENCES films(id)               ON DELETE SET NULL,
  FOREIGN KEY (ticket_id)   REFERENCES moderation_tickets(id)  ON DELETE SET NULL,
  FOREIGN KEY (sent_by)     REFERENCES users(id)               ON DELETE SET NULL
) ENGINE=InnoDB;
