-- ============================================================
--  marsAI 2026 — Schema de base de donnees (version francaise)
--  Stack      : React · Express.js · MySQL 8.x
--  Charset    : utf8mb4 / utf8mb4_unicode_ci
--  Version    : schema complet avec noms de tables et colonnes en francais
-- ============================================================

CREATE DATABASE IF NOT EXISTS marsai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE marsai;

-- ────────────────────────────────────────────────────────────
-- UTILISATEURS
-- Comptes internes : administrateurs, membres du jury, moderateurs.
-- hash_mot_de_passe NULL  → compte Google OAuth uniquement.
-- google_sub        NULL  → compte email/mot de passe uniquement.
-- Les deux peuvent coexister si l'utilisateur lie son Google.
-- ────────────────────────────────────────────────────────────
CREATE TABLE utilisateurs (
  id                INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  email             VARCHAR(255)    NOT NULL,
  hash_mot_de_passe VARCHAR(255)    NULL,
  google_sub        VARCHAR(255)    NULL,
  prenom            VARCHAR(100)    NOT NULL,
  nom               VARCHAR(100)    NOT NULL,
  role              ENUM('admin','jury','moderateur') NOT NULL,
  est_actif         TINYINT(1)      NOT NULL DEFAULT 1,
  cree_le           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modifie_le        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_utilisateurs_email (email),
  UNIQUE KEY uq_utilisateurs_google_sub (google_sub)
  -- Note : en MySQL 8+, UNIQUE accepte plusieurs lignes NULL,
  --        donc google_sub NULL pour plusieurs utilisateurs est valide.
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- INVITATIONS
-- Jeton unique envoye par mail depuis le panneau administrateur.
-- Parcours : admin invite → jeton genere → mail envoye → jury clique
--            → invite.html valide le jeton → compte cree dans utilisateurs.
-- ────────────────────────────────────────────────────────────
CREATE TABLE invitations (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  email       VARCHAR(255)    NOT NULL,
  role        ENUM('jury','moderateur') NOT NULL,
  jeton       VARCHAR(128)    NOT NULL,
  invite_par  INT UNSIGNED    NOT NULL,
  expire_le   DATETIME        NOT NULL,
  utilise_le  DATETIME        NULL,
  cree_le     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_invitations_jeton (jeton),
  INDEX idx_invitations_email (email),
  FOREIGN KEY (invite_par) REFERENCES utilisateurs(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- REALISATEURS
-- Candidats au festival — ne se connectent pas au backoffice.
-- Un meme realisateur peut soumettre plusieurs films (regle festival).
-- ────────────────────────────────────────────────────────────
CREATE TABLE realisateurs (
  id                    INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  civilite              ENUM('M','Mme') NOT NULL,
  prenom                VARCHAR(100)    NOT NULL,
  nom                   VARCHAR(100)    NOT NULL,
  date_naissance        DATE            NOT NULL,
  profession            VARCHAR(150)    NOT NULL,
  email                 VARCHAR(255)    NOT NULL,
  telephone             VARCHAR(30)     NULL,
  mobile                VARCHAR(30)     NOT NULL,
  source_decouverte     VARCHAR(50)     NULL,
  inscription_newsletter TINYINT(1)     NOT NULL DEFAULT 0,
  cree_le               DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modifie_le            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_realisateurs_email (email)
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- REALISATEUR_ADRESSES
-- Separee de realisateurs pour eviter une table trop large.
-- Relation 1-1 : UNIQUE KEY sur realisateur_id.
-- ────────────────────────────────────────────────────────────
CREATE TABLE realisateur_adresses (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  realisateur_id  INT UNSIGNED    NOT NULL,
  rue             VARCHAR(255)    NOT NULL,
  code_postal     VARCHAR(20)     NOT NULL,
  ville           VARCHAR(100)    NOT NULL,
  code_pays       CHAR(2)         NOT NULL,
  cree_le         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modifie_le      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_realisateur_adresse (realisateur_id),
  FOREIGN KEY (realisateur_id) REFERENCES realisateurs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- REALISATEUR_RESEAUX_SOCIAUX
-- 1 ligne par plateforme. UNIQUE (realisateur_id, plateforme).
-- Extensible sans ALTER TABLE si on ajoute un reseau.
-- ────────────────────────────────────────────────────────────
CREATE TABLE realisateur_reseaux_sociaux (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  realisateur_id  INT UNSIGNED    NOT NULL,
  plateforme      ENUM('youtube','instagram','linkedin','facebook','twitter') NOT NULL,
  identifiant     VARCHAR(255)    NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_realisateur_plateforme (realisateur_id, plateforme),
  FOREIGN KEY (realisateur_id) REFERENCES realisateurs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- FILMS
-- Dossiers de candidature avec sauvegarde auto de brouillon.
-- Les champs des etapes 2 et 3 sont NULL en brouillon (etape 1) :
--   etape 1 → profil realisateur uniquement, film cree vide
--   etape 2 → titres, synopses, video, note d'intention
--   etape 3 → type_ia, outils, sous-titres
--   etape 4 → soumission finale (statut = 'soumis')
-- La validation de NOT NULL est assuree par l'API, pas le schema,
-- car les donnees arrivent progressivement via la sauvegarde auto.
-- ────────────────────────────────────────────────────────────
CREATE TABLE films (
  id                          INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  realisateur_id              INT UNSIGNED     NOT NULL,

  -- Etape 2 — Le Film
  titre_fr                    VARCHAR(100)     NULL,
  titre_en                    VARCHAR(100)     NULL,
  code_langue                 VARCHAR(10)      NULL,
  synopsis_fr                 VARCHAR(300)     NULL,
  synopsis_en                 VARCHAR(300)     NULL,
  note_intention              TEXT             NULL,
  description_outils_creation TEXT             NULL,

  -- Etape 3 — Declaration IA
  type_ia                     ENUM('complet','hybride') NULL,
  outils_ia_image             VARCHAR(255)     NULL,
  outils_ia_son               VARCHAR(255)     NULL,
  outils_ia_scenario          VARCHAR(255)     NULL,
  outils_ia_post_prod         VARCHAR(255)     NULL,

  -- Fichier video (stocke cote serveur / S3)
  chemin_video                VARCHAR(500)     NULL,
  duree_video_sec             DECIMAL(6,2)     NULL,
  format_video                VARCHAR(10)      NULL,
  taille_video_mo             DECIMAL(7,2)     NULL,

  -- Sous-titres (SRT / VTT)
  chemin_sous_titres_fr       VARCHAR(500)     NULL,
  chemin_sous_titres_en       VARCHAR(500)     NULL,

  -- Verification YouTube API
  youtube_video_id            VARCHAR(20)      NULL,
  statut_youtube              ENUM('en_attente','approuve','rejete_droits','rejete_contenu')
                                               NOT NULL DEFAULT 'en_attente',
  droits_ok                   TINYINT(1)       NOT NULL DEFAULT 0,

  -- Consentements RGPD (etape 4 — les 3 cases doivent etre cochees avant soumission)
  -- consentement_droits        : cession de droits de diffusion (5 ans)
  -- consentement_rgpd          : conservation des donnees personnelles (3 ans, RGPD)
  -- consentement_originalite   : certification d'originalite et d'usage sincere des outils IA
  consentement_droits         TINYINT(1)       NOT NULL DEFAULT 0,
  consentement_rgpd           TINYINT(1)       NOT NULL DEFAULT 0,
  consentement_originalite    TINYINT(1)       NOT NULL DEFAULT 0,

  -- Suivi du dossier
  numero_dossier              VARCHAR(20)      NULL,
  statut                      ENUM('brouillon','soumis','verifie','retire')
                                               NOT NULL DEFAULT 'brouillon',
  etape_soumission            TINYINT UNSIGNED NOT NULL DEFAULT 1,

  cree_le                     DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modifie_le                  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_numero_dossier (numero_dossier),
  INDEX idx_films_realisateur (realisateur_id),
  INDEX idx_films_statut (statut),
  FOREIGN KEY (realisateur_id) REFERENCES realisateurs(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- FILM_ETIQUETTES
-- Etiquettes libres (max 5 cote interface) associees a un film.
-- 1 ligne par etiquette — normalise pour permettre la recherche.
-- ────────────────────────────────────────────────────────────
CREATE TABLE film_etiquettes (
  id       INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  film_id  INT UNSIGNED    NOT NULL,
  etiquette VARCHAR(50)    NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_film_etiquette (film_id, etiquette),
  INDEX idx_film_etiquettes (etiquette),
  FOREIGN KEY (film_id) REFERENCES films(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- PHASES
-- Phase 1 : preselection Top 50  (objectif_films = 50)
-- Phase 2 : finale Top 5         (objectif_films = 5)
-- est_active : une seule phase active a la fois (geree par l'API).
-- ────────────────────────────────────────────────────────────
CREATE TABLE phases (
  id              INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  numero_phase    TINYINT UNSIGNED NOT NULL,
  nom             VARCHAR(100)     NOT NULL,
  objectif_films  TINYINT UNSIGNED NOT NULL,
  date_ouverture  DATE             NOT NULL,
  date_cloture    DATE             NOT NULL,
  est_active      TINYINT(1)       NOT NULL DEFAULT 0,
  cree_le         DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modifie_le      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_numero_phase (numero_phase)
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- FILM_ASSIGNATIONS
-- Attribution d'un film a un membre du jury pour une phase donnee.
-- Index (utilisateur_id, phase_id) : "films assignes a ce jure dans cette phase"
--   → requete principale du tableau de bord jury.
-- ────────────────────────────────────────────────────────────
CREATE TABLE film_assignations (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  film_id         INT UNSIGNED    NOT NULL,
  utilisateur_id  INT UNSIGNED    NOT NULL,
  phase_id        INT UNSIGNED    NOT NULL,
  assigne_le      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_assignation (film_id, utilisateur_id, phase_id),
  INDEX idx_assignations_jury_phase (utilisateur_id, phase_id),
  FOREIGN KEY (film_id)        REFERENCES films(id)        ON DELETE CASCADE,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  FOREIGN KEY (phase_id)       REFERENCES phases(id)       ON DELETE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- JURY_NOTATIONS
-- Decision formelle d'un membre du jury sur un film (1 seule par triplet).
-- commentaire = note privee liee a la decision (non publiee).
-- raison : obligatoire pour les decisions 'a_revoir' et 'refuse' (valide par l'API).
-- Index (utilisateur_id, phase_id) : stats de participation par jure.
-- ────────────────────────────────────────────────────────────
CREATE TABLE jury_notations (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  film_id         INT UNSIGNED    NOT NULL,
  utilisateur_id  INT UNSIGNED    NOT NULL,
  phase_id        INT UNSIGNED    NOT NULL,
  decision        ENUM('valide','a_revoir','refuse','discuter') NOT NULL,
  raison          ENUM('droits','qualite','contenu','technique','autre') NULL,
  commentaire     TEXT            NULL,
  cree_le         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modifie_le      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_notation (film_id, utilisateur_id, phase_id),
  INDEX idx_notations_jury_phase (utilisateur_id, phase_id),
  INDEX idx_notations_film (film_id),
  FOREIGN KEY (film_id)        REFERENCES films(id)        ON DELETE CASCADE,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  FOREIGN KEY (phase_id)       REFERENCES phases(id)       ON DELETE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- JURY_COMMENTAIRES
-- Commentaires publics (visibles par tout le jury).
-- Distincts de jury_notations.commentaire (prive).
-- Un membre peut publier plusieurs commentaires sur un meme film.
-- ────────────────────────────────────────────────────────────
CREATE TABLE jury_commentaires (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  film_id         INT UNSIGNED    NOT NULL,
  utilisateur_id  INT UNSIGNED    NOT NULL,
  contenu         TEXT            NOT NULL,
  cree_le         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_jury_commentaires_film (film_id),
  FOREIGN KEY (film_id)        REFERENCES films(id)        ON DELETE CASCADE,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- SELECTIONS_FILMS
-- Decision administrateur : film selectionne / finaliste / rejete.
-- Une seule decision par (film, phase).
-- Index (phase_id, statut) : "Top 50 selectionnes" ou "Top 5 finalistes".
-- ────────────────────────────────────────────────────────────
CREATE TABLE selections_films (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  film_id     INT UNSIGNED    NOT NULL,
  phase_id    INT UNSIGNED    NOT NULL,
  statut      ENUM('selectionne','finaliste','rejete') NOT NULL,
  decide_par  INT UNSIGNED    NOT NULL,
  decide_le   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_selection (film_id, phase_id),
  INDEX idx_selections_phase_statut (phase_id, statut),
  FOREIGN KEY (film_id)    REFERENCES films(id)        ON DELETE CASCADE,
  FOREIGN KEY (phase_id)   REFERENCES phases(id)       ON DELETE CASCADE,
  FOREIGN KEY (decide_par) REFERENCES utilisateurs(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- TICKETS_MODERATION
-- Signalements jury remontes a l'administrateur pour traitement.
-- type   : categorie du signalement (correspond aux chips de la modale jury).
-- statut : en_cours = admin a pris en charge mais pas encore resolu.
-- Index (statut) : comptage rapide des tickets ouverts.
-- ────────────────────────────────────────────────────────────
CREATE TABLE tickets_moderation (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  film_id         INT UNSIGNED    NOT NULL,
  signale_par     INT UNSIGNED    NOT NULL,
  type            ENUM('droits','qualite','contenu','technique','autre') NOT NULL DEFAULT 'autre',
  motif           TEXT            NOT NULL,
  statut          ENUM('ouvert','en_cours','resolu','rejete') NOT NULL DEFAULT 'ouvert',
  resolu_par      INT UNSIGNED    NULL,
  note_resolution TEXT            NULL,
  cree_le         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolu_le       DATETIME        NULL,
  PRIMARY KEY (id),
  INDEX idx_tickets_statut (statut),
  INDEX idx_tickets_film (film_id),
  FOREIGN KEY (film_id)    REFERENCES films(id)        ON DELETE CASCADE,
  FOREIGN KEY (signale_par) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  FOREIGN KEY (resolu_par)  REFERENCES utilisateurs(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- SPONSORS
-- niveau : degre de partenariat (visible dans la vue Prix admin).
-- ────────────────────────────────────────────────────────────
CREATE TABLE sponsors (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  nom         VARCHAR(150)    NOT NULL,
  niveau      ENUM('principal','partenaire','media','institution') NOT NULL DEFAULT 'partenaire',
  url_logo    VARCHAR(500)    NULL,
  url_site    VARCHAR(500)    NULL,
  cree_le     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modifie_le  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- PRIX
-- Prix du festival. sponsor_id et film_gagnant_id sont NULL
-- jusqu'a attribution (ex: "Prix Coup de Coeur" sans dotation
-- en euros → montant_prix_eur NULL, libelle_prix = 'Trophee').
-- ────────────────────────────────────────────────────────────
CREATE TABLE prix (
  id               INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  nom              VARCHAR(150)    NOT NULL,
  description      TEXT            NULL,
  sponsor_id       INT UNSIGNED    NULL,
  montant_prix_eur DECIMAL(10,2)   NULL,
  libelle_prix     VARCHAR(100)    NULL,
  film_gagnant_id  INT UNSIGNED    NULL,
  cree_le          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modifie_le       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (sponsor_id)      REFERENCES sponsors(id) ON DELETE SET NULL,
  FOREIGN KEY (film_gagnant_id) REFERENCES films(id)    ON DELETE SET NULL
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- JURY_LISTES
-- Listes privees d'annotations d'un membre du jury (jamais visibles
-- par les autres membres ni par l'administrateur).
-- ────────────────────────────────────────────────────────────
CREATE TABLE jury_listes (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  utilisateur_id  INT UNSIGNED    NOT NULL,
  nom             VARCHAR(100)    NOT NULL,
  emoji           VARCHAR(10)     NULL,
  notes           TEXT            NULL,
  cree_le         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modifie_le      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_jury_listes_utilisateur (utilisateur_id),
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- JURY_LISTE_FILMS
-- Table pivot jury_listes <-> films (relation N:M).
-- Cle primaire composite : pas d'identifiant auto-increment necessaire.
-- ────────────────────────────────────────────────────────────
CREATE TABLE jury_liste_films (
  liste_id   INT UNSIGNED    NOT NULL,
  film_id    INT UNSIGNED    NOT NULL,
  ajoute_le  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (liste_id, film_id),
  INDEX idx_jury_liste_films_film (film_id),
  FOREIGN KEY (liste_id) REFERENCES jury_listes(id) ON DELETE CASCADE,
  FOREIGN KEY (film_id)  REFERENCES films(id)       ON DELETE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- MESSAGES_CHAT
-- Messages du chat jury (canal unique, pas de salons).
-- Index sur cree_le : tri chronologique des messages.
-- ────────────────────────────────────────────────────────────
CREATE TABLE messages_chat (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  expediteur_id   INT UNSIGNED    NOT NULL,
  contenu         TEXT            NOT NULL,
  cree_le         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_chat_cree_le (cree_le),
  FOREIGN KEY (expediteur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- VERIFICATIONS_EMAIL
-- OTP / jetons pour quatre usages :
--   'depot'        → verification email avant soumission (verification-email.html)
--   'invitation'   → confirmation apres inscription via lien invite.html
--   'inscription'  → confirmation apres inscription libre login-jury.html
--   'resoumission' → lien de re-soumission envoye quand YouTube rejette un film
--                    (lien valable 7 jours, dossier pre-rempli, film_id obligatoire)
-- film_id : rempli uniquement pour type='resoumission'.
-- ────────────────────────────────────────────────────────────
CREATE TABLE verifications_email (
  id               INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  email            VARCHAR(255)     NOT NULL,
  jeton            VARCHAR(128)     NOT NULL,
  type             ENUM('depot','invitation','inscription','resoumission') NOT NULL,
  film_id          INT UNSIGNED     NULL,
  expire_le        DATETIME         NOT NULL,
  utilise_le       DATETIME         NULL,
  compteur_renvoi  TINYINT UNSIGNED NOT NULL DEFAULT 0,
  cree_le          DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_jeton (jeton),
  INDEX idx_email_type (email, type),
  FOREIGN KEY (film_id) REFERENCES films(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- JETONS_REINITIALISATION
-- Via : login-jury.html > "Mot de passe oublie ?"
-- Parcours : POST /auth/mot-de-passe-oublie → jeton genere + envoye par mail
--            POST /auth/reinitialiser-mdp   → jeton verifie → hash mis a jour
-- Expiration recommandee : 15 a 30 minutes.
-- ────────────────────────────────────────────────────────────
CREATE TABLE jetons_reinitialisation (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  utilisateur_id  INT UNSIGNED    NOT NULL,
  jeton           VARCHAR(128)    NOT NULL,
  expire_le       DATETIME        NOT NULL,
  utilise_le      DATETIME        NULL,
  cree_le         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_jeton_reinitialisation (jeton),
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- VOTES_PUBLICS
-- Prix du Public : vote en ligne ouvert pendant le festival.
-- Via : index.html section #palmares > "Prix du Public".
-- hash_email_votant : SHA-256 de l'email (jamais l'email brut).
-- hash_ip_votant    : SHA-256 de l'IP (anonymisation RGPD).
-- UNIQUE (film_id, hash_email_votant) : un vote par email par film.
-- phase_id : rattache le vote a la periode du festival active.
-- ────────────────────────────────────────────────────────────
CREATE TABLE votes_publics (
  id                INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  film_id           INT UNSIGNED    NOT NULL,
  phase_id          INT UNSIGNED    NOT NULL,
  hash_email_votant VARCHAR(64)     NOT NULL,
  hash_ip_votant    VARCHAR(64)     NULL,
  vote_le           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_vote_par_film (film_id, hash_email_votant),
  INDEX idx_votes_film (film_id),
  INDEX idx_votes_phase (phase_id),
  FOREIGN KEY (film_id)  REFERENCES films(id)  ON DELETE CASCADE,
  FOREIGN KEY (phase_id) REFERENCES phases(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- PARAMETRES_SITE
-- Table cle-valeur pour tous les contenus editables du site
-- depuis la vue "Administration site" (admin-panel.html).
--
-- Cles prevues :
--   chemin_video_fond    → chemin S3 de la video de fond
--   nom_festival         → "marsAI 2026"
--   accroche_principale  → texte principal du hero
--   accroche_secondaire  → sous-accroche
--   texte_bouton_cta     → texte du bouton principal
--   tag_hero_1 .. _4     → 4 tags affiches sous le hero
--   email_contact        → email public du festival
--   instagram_contact    → compte Instagram
--   url_site             → URL du site
--   description_festival → description courte (section A propos)
-- ────────────────────────────────────────────────────────────
CREATE TABLE parametres_site (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  cle_parametre   VARCHAR(100)    NOT NULL,
  valeur          TEXT            NULL,
  modifie_par     INT UNSIGNED    NULL,
  modifie_le      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cle_parametre (cle_parametre),
  FOREIGN KEY (modifie_par) REFERENCES utilisateurs(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- EVENEMENTS_CALENDRIER
-- Dates cles affichees publiquement sur le site.
-- Gestion depuis la carte "Calendrier" de la vue administration site.
-- est_visible : activation/desactivation visible dans la maquette.
-- ordre_affichage : ordre d'affichage.
-- ────────────────────────────────────────────────────────────
CREATE TABLE evenements_calendrier (
  id               INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  nom              VARCHAR(150)     NOT NULL,
  description      VARCHAR(255)     NULL,
  date_evenement   DATE             NOT NULL,
  est_visible      TINYINT(1)       NOT NULL DEFAULT 1,
  ordre_affichage  TINYINT UNSIGNED NOT NULL DEFAULT 0,
  modifie_le       DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- MEMBRES_JURY_PUBLIC
-- Membres du jury affiches sur la PAGE D'ACCUEIL publique.
-- Distincts des utilisateurs (backoffice) : un membre public peut
-- etre purement editorial (sans acces au backoffice).
-- utilisateur_id  : lien optionnel vers utilisateurs si le membre a aussi
--                   un acces jury backoffice.
-- est_mis_en_avant : 1 = carte vedette (Presidence du jury),
--                    contrainte applicative : un seul a la fois.
-- ordre_affichage  : ordre de la liste, modifiable par l'admin.
-- ────────────────────────────────────────────────────────────
CREATE TABLE membres_jury_public (
  id               INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  utilisateur_id   INT UNSIGNED     NULL,
  nom              VARCHAR(150)     NOT NULL,
  libelle_role     VARCHAR(100)     NOT NULL,
  url_photo        VARCHAR(500)     NULL,
  est_mis_en_avant TINYINT(1)       NOT NULL DEFAULT 0,
  est_visible      TINYINT(1)       NOT NULL DEFAULT 1,
  ordre_affichage  TINYINT UNSIGNED NOT NULL DEFAULT 0,
  cree_le          DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modifie_le       DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- JOURNAUX_EMAILS
-- Historique des emails envoyes par l'administrateur aux realisateurs.
-- Via : admin-panel.html > modale "Email au realisateur" (depuis un ticket).
-- Egalement utilise pour les emails automatiques (rejet YouTube, etc.).
-- envoye_par NULL → email envoye automatiquement par le systeme (pas un humain).
-- ────────────────────────────────────────────────────────────
CREATE TABLE journaux_emails (
  id                 INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  realisateur_id     INT UNSIGNED    NULL,
  film_id            INT UNSIGNED    NULL,
  ticket_id          INT UNSIGNED    NULL,
  envoye_par         INT UNSIGNED    NULL,
  email_destinataire VARCHAR(255)    NOT NULL,
  objet              VARCHAR(300)    NOT NULL,
  corps              TEXT            NOT NULL,
  envoye_le          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_journaux_emails_realisateur (realisateur_id),
  INDEX idx_journaux_emails_film (film_id),
  INDEX idx_journaux_emails_ticket (ticket_id),
  FOREIGN KEY (realisateur_id) REFERENCES realisateurs(id)        ON DELETE SET NULL,
  FOREIGN KEY (film_id)        REFERENCES films(id)               ON DELETE SET NULL,
  FOREIGN KEY (ticket_id)      REFERENCES tickets_moderation(id)  ON DELETE SET NULL,
  FOREIGN KEY (envoye_par)     REFERENCES utilisateurs(id)        ON DELETE SET NULL
) ENGINE=InnoDB;
