# Session de travail — marsAI
**Date** : 24 février 2026
**Branche** : Mickael

---

## Résumé des sessions 1–9

Sessions précédentes documentées : correction performances GPU, suppression UnicornStudio, optimisation Three.js/shader/carousel, refonte hero vidéo, harmonisation couleurs, robot IA détouré, globe 3D wikiglobe, section Événement avec Friches Belle de Mai.

---

## Session 10 — Refonte visuelle majeure de la page d'accueil
**Date** : 2 mars 2026

### 1. Section Concept — cartes glassmorphism + animations
- **Orbes décoratives** animées (3 gradients) — désactivées par l'utilisateur
- **Cartes concept** : glassmorphism (`backdrop-filter: blur(12px)`), bordure colorée en haut (aurora/lavande/solar), halo diffus au hover
- **Chiffres néon** : `text-shadow` lumineux par carte (vert, violet, jaune)
- **Particules flottantes** : 20 spans positionnées aléatoirement, animation `particle-rise`
- **Label décoratif** : ligne dégradée aurora après "Le Concept"

### 2. Section Manifeste — texte reécrit + police Inter
- Texte du manifeste réécrit : 4 lignes + sous-texte plus punchy
- Police changée de `var(--font-display)` (Syne) à `var(--font-body)` (Inter)
- Taille texte augmentée pour équilibrer avec le carousel YouTube
- Fond manifeste : opacité 0.85, brightness 1.3, saturate 1.2, overlay réduit

### 3. Fonds éclaircis + gradients par section
- `--deep-sky` : `#0D1232` → `#141A42`
- Toutes les sections : fonds convertis en `linear-gradient` opaques (angles variés 135–180°)
- Tons : `#141A42` → `#1E255A` selon les sections

### 4. Section Événement
- Image Friches : `saturate(0.85) brightness(0.82)` (plus colorée)
- Globe 3D : curseur `grab` / `grabbing` (CSS + fix JS)

### 5. Section "Comment ça marche" — refonte complète
- Cartes glassmorphism avec `backdrop-filter: blur(8px)`
- Hover coloré par carte (aurora, lavande, solar, coral)
- Cercles numérotés plus grands, colorés
- 3 animations combinées : `how-float` + pulse glow + shimmer
- Police Inter pour les titres

### 6. Appel à Projets fusionné dans Concept
- Section "Appel à Projets" supprimée entièrement
- Infos redistribuées dans les 4 cards concept :
  - Card 1' : 60s pile, MP4/MOV, 200-300 Mo, Ratio 16:9
  - Card IA : IA entière/hybride, documentée, multi-films, groupes
  - Card 50 : 120+ pays, gratuit, sous-titres FR/EN
  - Card 30.09 : date limite 30 septembre 2026 (couleur coral)
- Grille concept : 3 → 4 colonnes

### 7. Galerie films — carousel infini double rangée
- Grille films convertie en 2 carousels horizontaux (`.films-row-1`, `.films-row-2`)
- Défilement automatique sens opposés (0.6px/frame)
- Boucle infinie : clonage des cartes, reset à `halfScroll`
- Drag-to-scroll : curseur grab/grabbing, events mouse + touch
- Fix : `fade-in` retiré des cartes carousel (opacity 0 bloquait les clones)
- Fix : `halfScroll` calculé après un frame (layout correct après clonage)
- Compteur "50 films · 20 par page" supprimé

### 8. Vidéo robot IA (Pinterest)
- Image `Robot2.png` remplacée par vidéo `robot-ia.mp4` (2.3 Mo)
- Vidéo extraite depuis Pinterest (pin 1115626138963790195) via curl
- `<video autoplay muted loop playsinline>` — lecture auto en boucle
- Fondu bas : `mask-image: linear-gradient(to bottom, #000 65%, transparent 100%)`
- Positionnement : aligné avec la 4ème card concept (`right: 80px`)

### 9. Bloc Gala unifié (Night + Palmarès + Sponsors)
- Jury déplacé avant Mars.AI Night
- 3 sections fusionnées dans un `<section class="gala">` unique
- Un seul fond dégradé (coral/violet → doré → vert)
- Un conteneur centré `.gala-inner` (max-width 760px)
- Séparateurs subtils `.gala-sep` entre sous-parties
- Sous-titres partagés `.gala-subtitle` (Inter, 1.2–1.6rem)
- CTA commun en bas du bloc
- Typographie harmonisée (0.78–0.95rem corps)

### Fichiers modifiés
- `css/tokens.css` — `--deep-sky` éclairci
- `css/index.css` — refonte massive (~400 lignes modifiées)
- `views/index.html` — restructuration sections, carousel, gala, vidéo robot
- `js/index-main.js` — carousel infini, fix fade-in, globe cursor
- `js/index-globe.js` — fix cursor grab/grabbing
- `assets/robot-ia.mp4` — vidéo robot IA (nouveau)
- `SESSION.md` — mise à jour

---

## Session 11 — Améliorations visuelles : Concept, Événement, Comment ça marche, Galerie Films
**Date** : 3 mars 2026

### 1. Section Concept — vidéo robot remplacée par image femme-robot IA
- Vidéo `robot-ia.mp4` remplacée par image `femme-robot2.jpg`
- Conversion JPG → PNG avec fond blanc supprimé (Python/Pillow)
- Masque radial + linear-gradient pour fondu harmonieux sur tous les bords (gauche, bas)
- Image agrandie (370px), positionnée bord droit (`right: -20px`)
- Particules : plus visibles (opacité 0.8, taille 4px), montent plus haut (-900px)
- Cards concept : `padding-top: 46px` pour espacement avec l'image

### 2. Section Événement — image de fond plus lumineuse + texte agrandi
- Image Friches : `brightness` 0.82 → 0.95, `saturate` 0.85 → 0.95
- Overlay bleu réduit (0.65 → 0.55, 0.30 → 0.20)
- Description section : blanc pur `#fff`, taille 1.25rem, `text-shadow`
- Programme (Ven/Sam/Dim) : texte blanc, 0.95rem, ombre portée
- Stats : valeurs 1.15rem, labels 0.82rem

### 3. Section "Comment ça marche" — simplification + visage IA en fond
- Animations supprimées : `how-float`, `how-pulse`, `how-shimmer` retirés
- Cards : padding réduit (28/32px → 22/24px) pour voir le CTA en bas
- Image `visage-couleur-sans.png` en fond à gauche (fond blanc supprimé)
- Image couvre toute la hauteur de la section, opacité 40%

### 4. Section Galerie Films — séparation en 2 sections + image cinéma
- Section scindée en deux :
  - `gallery-section` : titre "Sélection Officielle" + filtres (Tous/IA Pure/Hybride)
  - `films-cinema-section` : carousel double rangée + image cinéma en fond
- Image `view-3d-cinema-theatre-room.jpg` en fond du carousel (salle de cinéma)
- Overlay semi-transparent (40%), image centrée à 40% vertical
- Titre et filtres centrés (`text-align: center`, `justify-content: center`)
- Pellicule de cinéma `bande-pellicule.png` en décoration autour du titre (en cours)

### Fichiers modifiés
- `css/index.css` — refonte styles sections Concept, Événement, Comment ça marche, Galerie
- `views/index.html` — image robot, séparation galerie en 2 sections, pellicule
- `assets/femme-robot2.jpg` — image femme-robot IA (nouveau)
- `assets/femme-robot2.png` — version PNG fond transparent (nouveau)
- `assets/visage-couleur-sans.jpg` — visage IA lignes néon (nouveau)
- `assets/visage-couleur-sans.png` — version PNG fond transparent (nouveau)
- `assets/view-3d-cinema-theatre-room.jpg` — salle de cinéma (nouveau)
- `assets/bande-pellicule.png` — pellicule cinéma décoration (nouveau)
- `SESSION.md` — mise à jour session 11

---

## Session 12 — Galerie pellicule, Gala refonte, Jury uniforme, Footer noir
**Date** : 4 mars 2026

### 1. Section Galerie Films — pellicule cinéma + décorations
- Fond pellicule `bande-pellicule-droite.jpg` en `::after` (`background-size: 100% 200%`, `filter: brightness(0.65)`)
- Filtres (Tous/France/International) redesignés : fond sombre semi-transparent, état actif aurora
- Images décoratives : popcorn (gauche) et caméra cinéma (droite) en PNG fond transparent
- Conversion JPG → PNG via Python/Pillow + scipy (suppression fond blanc/checkered)
- Pellicule éclaircie avec dégradé plus doux

### 2. Section Gala — fusion Night + Prix + Sponsors + feux d'artifice
- 3 sous-sections (Mars.AI Night, Les Prix, Sponsors) fusionnées en une seule `<section class="gala">`
- Layout 2 colonnes : Prix à gauche (Grand Prix + 3 cards), Sponsors à droite
- **Feux d'artifice** : animation canvas déclenchée au scroll (IntersectionObserver), particules colorées avec gravité
- Trophée SVG remplace l'étoile dans la card Grand Prix
- Cards éclairées : backgrounds `rgba(255,255,255,0.08)`, bordures `0.15–0.35` opacité
- Textes éclaircis : `rgba(240,244,255,0.7–0.85)` au lieu de `var(--mist)`
- Polices harmonisées : tout en `var(--font-body)` (Inter)
- Bouton "Soumettre mon film" supprimé de la section
- Sponsors en grille `repeat(3, 1fr)` alignés avec les cards prix

### 3. Section Jury — 6 membres, cards uniformes verticales
- Jury réduit de 10 à 6 membres (Marie, Pierre, Kenji, Sofia, Amara, Carlos)
- Layout vedette supprimé : tous les membres en cards verticales uniformes
- Badges (`Présidence du Jury` / `Membre du Jury`) et citations ajoutés à chaque membre
- Grille 3 colonnes (`repeat(3, 1fr)`)
- Header centré (`text-align: center`)
- Photos proportionnelles : `aspect-ratio: 3/2`, `object-position: center top`
- Texte agrandi et éclairci : nom `1.15rem #fff`, rôle `0.88rem aurora`, citation `0.82rem rgba(220,225,240,0.85)`
- Padding section réduit : `120px 0` → `40px 0 60px`, inner `10px 0 20px`

### 4. Footer — refonte fond noir + texte blanc
- Fond changé : gradient bleu → `#000` noir pur
- Texte en blanc avec hiérarchie d'opacité (0.8 titres, 0.55 liens, 0.3 copyright)
- Bloc partenaires (Co-organisé par La Plateforme × Mobile Film Festival) déplacé au-dessus du logo marsAI
- Tailles réduites : partenaires `0.62–0.72rem`, logo partenaire `22px`
- Grille rééquilibrée : `1.4fr 1fr 1fr 1fr` (avant `2fr 1fr 1fr 1fr`), gap `32px`
- Tous les textes réduits : description `0.75rem`, titres colonnes `0.7rem`, liens `0.78rem`, copyright `0.68rem`

### Fichiers modifiés
- `css/index.css` — refonte galerie, gala, jury, footer (~300 lignes modifiées)
- `views/index.html` — restructuration gala, jury header centré, footer avec partenaires déplacés
- `js/index-main.js` — jury 6 membres avec badges/citations, rendu cards uniformes, animation feux d'artifice
- `assets/bande-pellicule-droite.jpg` — pellicule droite (nouveau)
- `assets/pop-corn.png` — popcorn fond transparent (nouveau)
- `assets/camera-cinema.png` — caméra cinéma fond transparent (nouveau)
- `SESSION.md` — mise à jour session 12

---

## Session 13 — Galerie & Carousel : refonte visuelle cinéma
**Date** : 5 mars 2026

### 1. Section Galerie — popcorn x2 + couleurs chaudes
- Caméra cinéma (droite) remplacée par un 2e popcorn en miroir (`scaleX(-1)`)
- Couleur verte aurora remplacée par doré chaud (`#FFB347` → `#FF8C42`) :
  - Label "Sélection Officielle" en doré avec halo chaud
  - Bouton filtre actif en dégradé orangé
- Police changée en `var(--font-display)` (Syne) pour le label et le titre
- Titre "50 Films · Imaginez des futurs souhaitables" limité à `max-width: 600px`

### 2. Carousel — cards réduites + caméras projecteurs
- Cards vidéo réduites : `min-width: 200px, max-width: 230px` (avant 260/300)
- Caméras cinéma ajoutées dans chaque rangée du carousel :
  - Rangée 1 : caméra à droite, pointe vers la gauche
  - Rangée 2 : caméra à gauche, pointe vers la droite
- Caméras agrandies à `220px`
- Carousel décalé (`margin-right/left: 210px`) pour que les vidéos commencent après la caméra
- Masques de fondu bleus supprimés (`display: none`)

### 3. Effet lumière projecteur — boule lumineuse sur l'objectif
- Boule de lumière blanche/dorée devant l'objectif de chaque caméra
- Dégradé radial : blanc au centre → doré → transparent
- Triple `box-shadow` pour halo lumineux diffus
- Animation `beam-glow` pulsante (scale + opacity)
- Positionnement ajusté sur l'objectif de chaque caméra

### Fichiers modifiés
- `css/index.css` — refonte galerie, carousel, caméras, effet lumière
- `views/index.html` — popcorn miroir, caméras dans chaque rangée du carousel
- `SESSION.md` — mise à jour session 13
