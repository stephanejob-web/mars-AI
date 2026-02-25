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
