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
