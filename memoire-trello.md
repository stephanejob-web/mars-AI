# Memoire Trello - marsAI

## Workflow quand l utilisateur donne des captures ecran d une page

1. Copier les fichiers vers /tmp avec des noms simples (form1.png, home1.png, etc.)
   - Utiliser : `for f in "/chemin/dossier/"*.png; do cp "$f" "/tmp/prefix${i}.png"; i=$((i+1)); done`
   - Les noms avec apostrophes et accents (Capture d ecran...) ne peuvent pas etre copies directement

2. Lire chaque image avec Read tool pour analyser visuellement le contenu

3. Creer des micro-taches Trello tres granulaires par petite feature UI visible sur les screenshots

4. Exporter en CSV format "Import by Blue Cat" (plugin Trello)

---

## Format CSV obligatoire

- Seulement 2 colonnes : Title,Description
- PAS de colonnes Labels ou Members (cause erreur "missing value" dans le plugin)
- Pas de guillemets autour des valeurs
- Pas de caracteres speciaux : pas de backticks, pas de fleches (->), pas d apostrophes typographiques, pas de tirets longs, pas de tags HTML
- Titre format : #N(section) Nom de la tache
  - Exemples : #1(home), #1(form), #1(admin), #1(jury)

## Exemple ligne valide
```
#1(home) Navbar composant structure de base,Creer le composant Navbar avec nav-inner position fixed fond transparent
```

---

## Fichiers CSV crees

| Fichier | Section | Taches | Numerotation |
|---|---|---|---|
| home.csv | Page Home (index.html) | 130 | #1(home) a #130(home) |
| formulaire.csv | Formulaire depot film | 100 | #1(form) a #100(form) |
| tasks-scrum.json | Toutes sections (JSON) | 150 | #1 a #150 |

---

## Repartition equipe marsAI

| Membre | Domaine |
|---|---|
| Dylan | Panel Jury (admin-jury.html) |
| Jean-Denis | Panel Admin (admin-panel.html) |
| Valerie | Panel Admin + Traductions i18n |
| Mickael | Page Home (index.html) |
| Stephane | Formulaires + Backend Express/MySQL |
| Toute l equipe | Modelisation BDD |

---

## Stack technique du projet

- Frontend : React (Vite) + react-i18next (FR/EN)
- Backend : Express.js + MySQL
- Auth : JWT avec roles admin/jury
- Upload : Multer (video MP4/MOV, sous-titres SRT/VTT)
- Pages HTML existantes a convertir en React :
  - views/index.html (Home)
  - views/admin-panel.html (Admin)
  - views/admin-jury.html (Jury)
  - views/formulaire-depot.html (Depot film)
  - views/login-jury.html (Auth)

---

## Validation CSV avant import

```bash
python3 -c "
import csv
with open('fichier.csv') as f:
    rows = list(csv.reader(f))
print(f'Header: {rows[0]}')
print(f'Total tasks: {len(rows)-1}')
print(f'First: {rows[1][0]}')
print(f'Last: {rows[-1][0]}')
"
```

---

## Procedure complete quand l utilisateur donne un dossier de screenshots

1. `ls "/chemin/dossier/"` pour voir les fichiers
2. Copier vers /tmp avec boucle for
3. Read chaque image (/tmp/img1.png etc.)
4. Analyser toutes les sections visibles (labels, champs, boutons, etapes, composants)
5. Generer 80-130 micro-taches selon la complexite de la page
6. Ecrire le CSV avec Write tool dans le repo marsAI
7. Valider avec python3 csv.reader
8. Confirmer a l utilisateur : nombre de taches, repartition, nom du fichier
