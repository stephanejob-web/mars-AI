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
