# Session de travail — marsAI
**Date** : 24 février 2026
**Branche** : Mickael

---

## Problème initial
Depuis l'intégration d'un arrière-plan UnicornStudio WebGL dans la section Manifeste, tout le site buggait (freeze / lag).

---

## Diagnostic
- **2 contextes WebGL simultanés** : Three.js (sphère hero, fixed full-page) + UnicornStudio (manifeste) = surcharge GPU
- **25 `backdrop-filter: blur()`** sur la page, dont 6 ajoutés par le dernier commit sur des éléments répétés (film-cards, jury-cards, nav-btns...)
- **UnicornStudio** chargé immédiatement au démarrage sans lazy-loading ni gestion d'erreur
- **Boucle Three.js** tournait à 60fps même quand la sphère était invisible (opacity: 0)
- **Overlay SVG grain** (`body::before`) avec filtre SVG en `position: fixed` z-index 9999

---

## Corrections appliquées

### 1. Suppression de UnicornStudio
- Supprimé le div `#manifeste-us-bg` + `data-us-project`
- Supprimé le div `.manifeste-overlay` (lié à UnicornStudio)
- Supprimé le script loader UnicornStudio (CDN jsdelivr)
- Supprimé le CSS associé (`#manifeste-us-bg`, `#manifeste-us-bg canvas`)

### 2. Optimisation des backdrop-filter (25 → 9)
Supprimé les `backdrop-filter: blur()` sur :
- `.film-card` (x9 cards) — remplacé par `background: rgba(10,15,46,0.85)`
- `.film-nav-btn` — remplacé par `background: rgba(10,15,46,0.85)`
- `.counters-section` — remplacé par `background: rgba(10,15,46,0.95)`
- `.marsnight-detail` — supprimé
- `.jury-featured` — supprimé
- `.jury-card` (x6 cards) — remplacé par `background: rgba(10,15,46,0.9)`
- `.concept` — remplacé par `background: rgba(10,15,46,0.92)`
- `.about` — remplacé par `background: rgba(10,15,46,0.92)`
- `.gallery-section` — remplacé par `background: rgba(10,15,46,0.95)`
- `.how-section` — remplacé par `background: rgba(10,15,46,0.92)`
- `.player-section` — remplacé par `background: rgba(6,9,30,0.95)`
- `.palmares-section` — remplacé par `background: rgba(10,15,46,0.95)`
- `.jury-section` — remplacé par `background: rgba(8,12,38,0.95)`
- `footer` — remplacé par `background: rgba(10,15,46,0.97)`
- `.featured-play` — supprimé
- `.film-thumb-play` — supprimé

### 3. Optimisation de la boucle Three.js
- `requestAnimationFrame` s'arrête complètement quand la sphère est invisible (`animFrameId = null`)
- Fonction `window._restartSphereAnim()` exposée pour relancer la boucle
- Le scroll handler redémarre l'animation quand `sphereOpacity > 0`

### 4. Optimisation du grain overlay
- Ajout de `background-size: 256px 256px` pour éviter le re-calcul du filtre SVG
- Ajout de `transform: translateZ(0)` pour forcer le compositing GPU

### 5. Nouveau fond Manifeste — Shader WebGL custom
Remplacement de UnicornStudio par un shader WebGL léger :
- **Image de fond** : visage futuriste (`manifeste-bg-img`, opacity 0.5)
- **Canvas shader** : lignes animées violet/bleu (`#manifeste-shader-canvas`, mix-blend-mode: screen, opacity 0.7)
- **Overlay gradient** : `.manifeste-overlay` pour la lisibilité du texte
- **Lazy-loading** via `IntersectionObserver` : le shader ne démarre que quand la section est visible
- **Auto-pause** : `cancelAnimationFrame` quand la section sort du viewport
- **`powerPreference: 'low-power'`** + `precision mediump` pour réduire la charge GPU
- Couleurs adaptées au thème marsAI (bg1: deep blue, bg2: deep purple, lineColor: violet)

### 6. Refonte visuelle du texte Manifeste
- **Lignes dim** : taille réduite (`clamp(1.3rem, 2.8vw, 3.2rem)`), italic, plus translucides
- **Lignes principales** : `text-shadow` renforcé pour se détacher du fond
- **Mots clés `.hl-aurora`** : glow vert (`text-shadow: 0 0 20px rgba(78,255,206,0.5)`)
- **Mots clés `.hl-solar`** : glow jaune (`text-shadow: 0 0 20px rgba(245,230,66,0.5)`)
- **Séparateur** : plus large (80px) avec glow aurora
- **Sous-texte** : taille réduite (0.88rem), couleur plus douce
- **Outils** : centrés, hover interactif

---

## Fichiers modifiés
- `index.html` — toutes les modifications ci-dessus

---

## Statut
Site fluide, plus de freeze/lag. Fond shader manifeste fonctionnel avec lazy-loading.

---

## Session 2 — Amélioration du design de la page d'accueil
**Date** : 25 février 2026

### 1. Suppression du lecteur vidéo HUD
- **HTML** (`views/index.html`) : supprimé le bloc `.hud-frame` (coins HUD, cinema-wrap, vidéo, overlay, hud-bar)
- **CSS** (`css/index.css`) : supprimé ~165 lignes de styles (`.hud-frame`, `.hud-corner`, `.hud-bar`, `.cinema-wrap`, `.cinema-scan`, `.cinema-overlay`, `.cinema-play`, `.cinema-ia-badge`, `@keyframes hud-scan`)
- **JS** (`js/index-main.js`) : supprimé `fmtTime()`, `startDemo()`, timecode IIFE, `@keyframes pulse-dot` inline (~46 lignes)

### 2. Bouton Démo rouge avec effet laser
- Ajout d'un bloc `.hero-right-cta` dans la colonne droite du hero (bouton "Soumettre un film" + bouton "Démo")
- Bouton `.btn-demo` : bordure rouge (coral), fond transparent, `border-radius: 9999px`
- Effet laser au survol : barre lumineuse `.btn-demo-laser` traversant le bouton via `@keyframes laser-sweep`
- Hover : `box-shadow` rouge, couleur texte blanche
- Responsive : taille réduite à 480px, centrage à 1024px

### 3. Améliorations de design mineures
- **Espacement sections** : `.section-inner` padding augmenté de `100px 60px` à `120px 60px`
- **Countdown mobile** : gap 12px, label taille et espacement améliorés (480px)
- **Galerie films** : overlay semi-transparent aurora au survol des `.film-thumb` (pseudo-élément `::after`)

### Fichiers modifiés
- `views/index.html` — suppression HUD, ajout bouton Démo
- `css/index.css` — suppression styles HUD, ajout `.btn-demo` + laser, améliorations design
- `js/index-main.js` — suppression code cinéma player
- `SESSION.md` — mise à jour

---

## Session 3 — Refonte hero, animations reveal, harmonisation sections
**Date** : 25 février 2026 (suite)

### 1. Explosion sphère 3D au scroll
- **JS** (`js/index-sphere.js`) : extraction de `triggerExplosion()` en fonction réutilisable
- Clic sur la sphère → explosion (inchangé)
- Scroll vers le bas depuis le haut de page → explosion automatique (`scrollY > 30`)
- Reset du déclencheur quand l'utilisateur revient en haut (`scrollY <= 5`)
- Scroll handler avec `{ passive: true }`

### 2. Restructuration du hero
- **Suppression** du sous-texte "Aucune caméra. Aucun acteur..." (`.hero-accroche-sub`)
- **Déplacement** des boutons CTA ("Soumettre un film" + "Démo") dans `.hero-accroche` sous le texte d'accroche
- **Countdown** déplacé dans la colonne droite du hero (`.hero-right`), aligné en bas à droite
- **Suppression** de `.hero-bottom-bar` (plus nécessaire)
- **Boutons agrandis** : padding `16px 34px`, font-size `1rem`
- **Laser continu** : animation `laser-sweep` en boucle infinie (2.5s), plus intense au hover (0.5s)

### 3. Texte "Marseille" en haut à droite du hero
- Police display, uppercase, `letter-spacing: 0.08em`
- Effet shimmer : dégradé aurora/blanc/lavande glissant (animation 8s)
- Style watermark subtil : texte transparent + stroke léger
- Étiré verticalement (`scaleY(1.3)`) et compressé horizontalement (`scaleX(0.65)`)
- Ancré en haut à droite (`transform-origin: right top`)

### 4. Navbar — effet shrink au scroll
- Classe `.nav-scrolled` ajoutée via JS quand `scrollY > 60`
- Réduction du padding, tailles de police, logo, boutons via transitions CSS
- Fond renforcé + `box-shadow` au scroll

### 5. Harmonisation section Concept
- **Titre section** : réduit à `clamp(1.4rem, 2.5vw, 2.2rem)` (était 4.5rem max)
- **Label "Le Concept"** : agrandi à `1rem`, poids 700
- **Description** : `1rem`, max-width `580px`
- **Cartes concept** : padding `28px 24px`, gap `20px`, chiffres réduits (`clamp(1.5rem, 2.5vw, 2.2rem)`)
- **Hover** plus subtil (`translateY(-4px)`)

### 6. Alignement gauche sections corrigé
- Padding horizontal déplacé de `.section-inner` vers les `<section>` parentes
- `.section-inner` ne gère plus que le padding vertical + `max-width: 1400px`
- Alignement cohérent entre hero-content et toutes les sections

### 7. Agrandissement partenaires et badge
- **Bandeau partenaires** : padding `10px 24px`, logo `30px`, textes agrandis
- **Badge festival** : padding `8px 20px`, font `0.8rem`, point vert `8px`

### 8. Suppression dev-nav
- Supprimé le HTML des boutons MAQUETTE/Accueil/Espace Admin/Espace Jury
- Supprimé le lien `dev-nav.css` du HTML
- Supprimé les styles `.dev-nav`, `.dev-btn` de `index.css` (~40 lignes)

### 9. Animations reveal en cascade au scroll
- **Nouveau système** : observer sur les `<section>`, classe `.section-visible` déclenchée
- Les `.reveal` enfants apparaissent en cascade via `data-delay="1"` à `"5"` (150ms entre chaque)
- Animation : `translateY(50px)` → `0` + fade, courbe `cubic-bezier(0.16, 1, 0.3, 1)`
- **Dividers** animés : `scaleX(0)` → `scaleX(1)` quand ils entrent dans le viewport
- **`::before` concept** : ligne verte animée avec `@keyframes line-reveal`
- Sections couvertes : Concept, À propos, Appel à projets, Comment ça marche, Galerie films, Jury, Palmarès
- **Accessibilité** : `prefers-reduced-motion` désactive toutes les animations

### 10. Nettoyage CSS
- Supprimé styles orphelins : `.countdown-inner`, `.countdown-top-line`, `.hero-accroche-sub`
- Supprimé responsive orphelins pour éléments supprimés
- Supprimé les styles dev-nav (~40 lignes)

### Fichiers modifiés
- `views/index.html` — restructuration hero, ajout reveal/data-delay sur toutes les sections, ajout "Marseille"
- `css/index.css` — refonte hero, harmonisation tailles, animations reveal/divider/shimmer, nettoyage
- `js/index-main.js` — observer cascade par section, suppression code cinéma player
- `js/index-sphere.js` — triggerExplosion(), explosion au scroll avec reset
- `SESSION.md` — mise à jour

---

## Session 4 — Robot IA détouré dans la section Concept
**Date** : 25 février 2026 (suite)

### 1. Ajout d'un robot IA dans la section Concept
- **Objectif** : image de robot IA en haut à droite de la section Concept pour renforcer l'identité visuelle
- **Tentatives** : SVG animé → vidéo MP4 (`ia1.mp4`, blend mode) → image JPG (`Robot2.jpg`, blend mode) → **PNG détouré**
- **Problème** : les formats JPG/MP4 avec fond sombre ne s'intègrent pas proprement malgré `mix-blend-mode: screen` et masques CSS

### 2. Suppression du fond avec rembg (IA)
- **Outil** : `rembg` (Python, modèle U2Net) — équivalent local de remove.bg
- **Entrée** : `assets/Robot2.jpg` (1280×960, fond sombre avec circuits)
- **Sortie** : `assets/Robot2.png` (1280×960, RGBA, fond 100% transparent)
- Détourage propre du buste du robot

### 3. Intégration CSS propre
- **Avant** : `mix-blend-mode: screen`, `opacity: 0.9`, `mask-image: radial-gradient(...)` — résultat approximatif
- **Après** : fond transparent natif, `opacity: 0.88`, `filter: drop-shadow(0 0 30px rgba(78,255,206,0.15))` — intégration naturelle
- Plus besoin de hacks CSS pour cacher le fond

### Fichiers modifiés
- `views/index.html` — source image changée (`.jpg` → `.png`)
- `css/index.css` — suppression blend-mode/mask, ajout drop-shadow aurora
- `assets/Robot2.png` — nouveau fichier (PNG détouré)
- `assets/Robot2.jpg` — fichier source original ajouté
- `SESSION.md` — mise à jour

---

## Session 5 — Carousel Evervault + Optimisation GPU massive
**Date** : 26 février 2026

### 1. Carousel Evervault — correction chemins vidéo
- **Bug critique** : les vidéos du carousel ne s'affichaient jamais (cartes vides à droite du scanner)
- **Cause** : chemins `../assets/videos/ia2.mp4` au lieu de `../assets/ia2.mp4` (dossier `videos/` inexistant)
- **Fix** : correction des 4 chemins vidéo dans le tableau `VIDEOS`

### 2. Correction clip-path inline
- **Problème** : le clipping CSS via variables custom (`--clip-right`, `--clip-left`) ne fonctionnait pas sur les vidéos
- **Fix** : suppression des `clip-path` CSS sur `.ev-card-normal` et `.ev-card-ascii`, remplacement par `style.clipPath` inline dans le JS (`_updateClipping()`)

### 3. Optimisation GPU — Shader WebGL (`index-shader.js`)
Le GPU Intel UHD 620 était saturé à 100%. Optimisations appliquées :
- **Résolution rendu ÷2** : canvas à 50% de la taille réelle (CSS upscale) → 4x moins de pixels
- **Lignes shader réduites** : `linesPerGroup` de 16 à 8 → 2x moins de calculs/pixel
- **Throttle 30fps** au lieu de 60fps → 2x moins de frames
- **Gain estimé** : ~16x moins de charge GPU

### 4. Optimisation GPU — Carousel (`manifeste-carousel.js`)
- **Cartes réduites** : 12 → 6 (moins de vidéos à décoder)
- **Vidéos simultanées** : max 3 en lecture (les plus proches du scanner), reste en pause
- **ia.mp4 (53Mo) exclu** : rotation sur 3 vidéos légères uniquement
- **Particules** : 400 → 60
- **Canvas particules** : résolution ÷2
- **Throttle particules** : 30fps
- **DOM queries cachées** : `querySelector` remplacé par refs `wrapper._normal`, `wrapper._ascii`
- **Gestion vidéos throttlée** : toutes les 500ms au lieu de chaque frame
- **ASCII refresh** : 800ms (1 carte aléatoire) au lieu de 250ms (toutes les cartes)
- `preload="metadata"` au lieu de `"auto"`

### 5. Optimisation GPU — Sphère Three.js (`index-sphere.js`)
- **UnrealBloomPass SUPPRIMÉ** : élimine 5-8 passes GPU supplémentaires par frame → rendu direct `renderer.render()`
- **Lumière violette → verte** : `secondary` changé de `0xC084FC` à `0x4EFFCE` (uniforme avec primary)
- **pixelRatio plafonné à 1** (au lieu de 2) → 4x moins de pixels sur écran hi-DPI
- **Throttle 30fps**
- **Géométrie sphère** : detail 10 → 6 (~10K → ~2.5K vertices)
- **MeshPhysicalMaterial → MeshStandardMaterial** (clearcoat supprimé)
- **Explosion** : 5000 → 2000 particules
- **Lumières** : intensité 400 → 150
- **Émissivité renforcée** (0.05 → 0.15) et wireframe opacity (0.15 → 0.25) pour compenser l'absence de bloom
- **powerPreference** : `"high-performance"` → `"low-power"`
- Imports postprocessing (EffectComposer, RenderPass, UnrealBloomPass) supprimés

### Résultat performance
- **GPU** : de 100% → ~25-30% (Intel UHD Graphics 620)
- **RAM** : de 75% → ~56%
- **CPU** : de 48% → ~35%
- Site fluide, pas de freeze/lag

### Fichiers modifiés
- `js/index-shader.js` — résolution ÷2, 8 lignes, 30fps
- `js/index-sphere.js` — bloom supprimé, rendu direct, violet → vert, 30fps, géométrie allégée
- `js/manifeste-carousel.js` — chemins vidéo corrigés, 6 cartes, 60 particules, clip-path inline, DOM caché
- `css/index.css` — suppression clip-path CSS sur `.ev-card-normal` et `.ev-card-ascii`
- `SESSION.md` — mise à jour

---

## Session 6 — Amélioration robot IA + fond manifeste
**Date** : 27 février 2026

### 1. Nettoyage image Robot2.png
- **Problème** : contours de découpe visibles (halo blanc/gris du fond original), rectangle de l'image apparent sur fond sombre
- **Script Python (Pillow)** : érosion 2px de la frange alpha, suppression des pixels blancs de bordure, blur doux (0.8px) pour lisser les bords
- **Backup** conservé dans `assets/Robot2_backup.png`

### 2. Suppression du contour rectangulaire
- **Cause** : `mask-image: linear-gradient(to bottom)` ne masquait que le bas → contour rectangulaire visible sur les côtés et le haut
- **Fix** : masque double combiné avec `mask-composite: intersect` :
  - `radial-gradient(ellipse 80% 100% at 50% 30%)` — fondu sur les côtés et le haut
  - `linear-gradient(to bottom, #000 55%, transparent 100%)` — fondu progressif en bas
- `drop-shadow` déplacé de `.robot-img` vers `.robot-wrap` (parent) pour éviter le halo rectangulaire
- `opacity: 1` + `background: transparent; border: none; outline: none;` pour supprimer tout rendu parasite

### 3. Animation robot plus vivante
- **Vitesse** : `6s` → `4s` (plus rapide)
- **Amplitude** : `22px` → `20px`
- **Résultat** : mouvement flottant bien visible et vivant

### 4. Lumière bleue au-dessus de la tête renforcée
- **Taille** : `40x40px` → `90x90px`
- **Position** remontée (`top: 30px` → `top: 10px`)
- **Couleur** plus bleue intense (`rgba(80,160,255,0.9)`)
- **Opacité min** : `0` → `0.3` (toujours visible, ne disparaît plus)
- **Pulsation** plus ample (`scale 0.8→1.1`)

### 5. Luminosité du robot
- Ajout `filter: brightness(1.23)` sur `.robot-img` pour éclaircir le visage trop sombre

### 6. Image de fond section Manifeste
- **Opacité** augmentée : `0.5` → `0.7`
- **Luminosité** : ajout `filter: brightness(1.2)`
- Image de fond (visage futuriste) plus visible et colorée

### Fichiers modifiés
- `assets/Robot2.png` — image re-nettoyée (frange supprimée, bords lissés)
- `assets/Robot2_backup.png` — backup de l'original
- `css/index.css` — masque radial+linéaire, animation 4s, lumière bleue renforcée, brightness robot et manifeste
- `SESSION.md` — mise à jour

---

## Session 7 — Refonte section "L'Événement" + Globe 3D wikiglobe
**Date** : 27 février 2026

### 1. Globe 3D interactif (style wikiglobe)
- **Nouveau fichier** `js/index-globe.js` — ES module Three.js (~280 lignes)
- **Basé sur** [vrandezo/wikiglobe](https://github.com/vrandezo/wikiglobe) (dat.globe), porté vers Three.js 0.160
- **Shaders GLSL identiques** au wikiglobe original :
  - Shader Terre : texture `world.jpg` + lueur blanche Fresnel sur les bords
  - Shader Atmosphère : halo bleu `vec4(0.1, 0.2, 0.5, 0.7)` avec `pow(..., 12.0)` (backside)
- **Données Wikipedia FR** : `assets/globe-data.json` (265 Ko, ~26 000 points) chargées en async
- **Fonction couleur** fidèle au wikiglobe : HSV `hue = 0.6 - val * 0.25` (bleu → cyan → vert)
- **Points lumineux** : `PointsMaterial`, `AdditiveBlending`, `vertexColors`
- **Marqueur Marseille** : dot coral pulsant + anneau animé (43.2964°N, 5.3736°E)
- **Drag souris** : rotation orbitale avec easing 0.1 (identique wikiglobe) + support tactile mobile
- **Auto-rotation** lente (0.003 rad/frame), reprend après 3s d'inactivité
- **Performance** : throttle 20fps, `IntersectionObserver` pause/resume, `pixelRatio: 1`, `powerPreference: low-power`
- **Texture placeholder** : canvas 1x1 sombre au démarrage pour éviter le noir avant chargement
- **Fallback** : si WebGL indisponible, canvas masqué

### 2. Restructuration HTML section #programme
- **Supprimé** : timeline longue (4 items + speakers), iframe OpenStreetMap, overlay carte, stat-chips gros
- **Colonne gauche** : description raccourcie, programme compact 3 lignes (Ven/Sam/Dim avec dots colorés), stats mini en ligne (50 films / 120+ pays / Gratuit)
- **Colonne droite** : `<canvas id="globe-canvas">` + carte venue compacte superposée (nom, adresse, coordonnées, bouton itinéraire)

### 3. Refonte CSS section
- **Supprimé** (~160 lignes) : `.venue-map`, `.venue-map iframe`, `.venue-map-overlay`, `.venue-pin`, `@keyframes bounce`, `.venue-coords-badge`, `.venue-info`, `.venue-name`, `.venue-address`, `.venue-tags`, `.venue-tag`, `.venue-btn`, `.venue-card`, `.about-stats`, `.event-programme`, `.prog-item`, `.prog-dot`, `.prog-day`, `.prog-desc`, `.stat-chip`, `.stat-value`, `.stat-label`
- **Ajouté** : `.globe-container`, `.globe-wrap` (aspect-ratio 1, max-width 460px), `.venue-overlay` compact (glassmorphism, 10px padding), `.prog-compact`, `.prog-line`, `.prog-dot-mini`, `.stat-row`, `.stat-chip-mini`
- **Layout** : grid gap réduit 80→40px, `align-items: center`, colonne globe centrée en flexbox
- **Responsive** : globe max-width 380px (1024px), 280px (480px)

### 4. Image de fond Friches Belle de Mai
- **Image** : `assets/friche-belle-mai-toit-terrasse.jpg` — photo toit-terrasse des Friches
- **Intégration** : `div.about-bg` en position absolue, déborde ±60px en haut/bas pour couvrir les transitions
- **Filtre** : `brightness(0.65)`, `saturate(0.4)` — image visible mais intégrée au thème sombre
- **Masque CSS double** (`mask-composite: intersect`) :
  - Vertical : fondu transparent en haut/bas → pas de cassure de couleur au scroll
  - Horizontal : transparent à gauche (texte lisible) → visible à droite (zone globe)
- **Voile bleu** (`::after`) : dégradé gauche→droite `rgba(10,15,46,0.75)` → transparent pour garantir la lisibilité du texte
- **Dividers** : `z-index: 3` pour rester visibles au-dessus du fond

### 5. Assets ajoutés
- `assets/world.jpg` — texture Terre (94 Ko, du repo wikiglobe)
- `assets/globe-data.json` — données Wikipedia FR résolution 3 (265 Ko)
- `assets/friche-belle-mai-toit-terrasse.jpg` — photo Friches Belle de Mai

### Fichiers modifiés
- `js/index-globe.js` — **CRÉÉ** (globe 3D wikiglobe, ~280 lignes)
- `views/index.html` — section #programme restructurée, ajout canvas globe + about-bg
- `css/index.css` — suppression anciens styles venue/programme, ajout globe/compact/fond image
- `SESSION.md` — mise à jour
