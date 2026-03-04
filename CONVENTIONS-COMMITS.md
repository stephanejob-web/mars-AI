# Conventions de nommage des commits — marsAI 2026

> Document à destination des développeurs du projet.
> Merci de respecter ces règles à chaque commit, sans exception.

---

## La règle d'or

Un commit = **une seule chose**.
Si tu dois écrire "et" dans ton message, c'est probablement deux commits.

---

## Format d'un commit

```
type(scope): description courte
```

### Exemples

```
feat(jury): add sidebar chat
fix(admin): fix unread badge display
style(index): align hero section cards
docs: update README
```

---

## Les types — à utiliser obligatoirement

| Type | Quand l'utiliser | Exemple |
|------|-----------------|---------|
| `feat` | Nouvelle fonctionnalité | `feat(jury): add discuss button` |
| `fix` | Correction d'un bug | `fix(admin): fix empty country filter` |
| `style` | CSS, mise en page, couleurs (aucun changement de logique) | `style(jury): adjust player size` |
| `refactor` | Réécriture de code sans changer le comportement | `refactor(chat): simplify renderMessages function` |
| `docs` | Documentation, commentaires, README | `docs: add commit conventions` |
| `chore` | Tâches techniques sans impact visible (renommage de fichier, nettoyage) | `chore: remove unused files` |
| `wip` | Travail en cours — ne pas merger sur main | `wip(form): start deposit form` |

---

## Le scope — la partie concernée

Le scope est **facultatif** mais fortement recommandé.
Il indique quelle partie du projet est touchée.

| Scope | Correspond à |
|-------|-------------|
| `jury` | Interface jury (`admin-jury.html`, `admin-jury.js`, `admin-jury.css`) |
| `admin` | Panneau admin (`admin-panel.html`, `admin-panel.js`, `admin-panel.css`) |
| `index` | Page d'accueil (`index.html`) |
| `form` | Formulaire de dépôt |
| `login` | Page de connexion |
| `chat` | Système de chat jury |
| `nav` | Navigation / sidebar |
| `player` | Lecteur vidéo |

---

## La description — les règles

- **Commence par un verbe à l'infinitif** : `add`, `fix`, `remove`, `update`, `rename`
- **En anglais**, minuscules
- **Pas de point** à la fin
- **50 caractères maximum** pour la ligne principale
- **Sois précis** : pas `fix bug` mais `fix badge display when unread count is 0`

---

## Exemples concrets sur ce projet

```bash
# Nouvelle fonctionnalité
feat(jury): add clickable film card in chat

# Correction de bug
fix(admin): fix juror counter in topbar

# CSS uniquement
style(jury): align decision panel on mobile

# Travail en cours (ne pas merger)
wip(admin): start ticket moderation view

# Nettoyage
chore: remove obsolete discuss view

# Plusieurs fichiers liés à une même feature
feat(chat): pre-fill message from discuss button
```

---

## Ce qu'il ne faut PAS faire

```bash
# Trop vague
fix: fixes
update: changes
wip

# Majuscule au début de la description
Fix(jury): Fix the badge

# Mélange de sujets
feat: add chat + fix admin bug + style index

# En français (les commits sont en anglais)
feat(jury): ajouter le bouton discuter
```

---

## Branches — convention associée

Même logique que les commits :

```
type/short-description
```

```bash
feat/jury-chat-sidebar
fix/admin-unread-badge
style/jury-player
wip/deposit-form
```

La branche `main` est **protégée**. On ne pousse jamais directement dessus.
On passe toujours par une Pull Request, relue par un autre développeur.

---

## Récapitulatif rapide (à afficher au bureau)

```
feat      → new feature
fix       → bug fix
style     → CSS / layout only
refactor  → code rewrite, same behavior
docs      → documentation
chore     → technical cleanup
wip       → work in progress (do not merge)
```

```
feat(scope): verb + what changed
```

---

*marsAI 2026 — document interne*
