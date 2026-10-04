# Multiplex : plan de réalisation et journal des évolutions

Ce document retrace le plan validé au démarrage du projet, puis les modifications apportées au fil des itérations. Le comportement attendu de l'application est décrit dans la [spécification](SPEC.md).

## 1. Contexte

Le besoin est une application de bureau Windows nommée **Multiplex**, qui affiche simultanément plusieurs directs de chaînes d'information francophones du monde entier. Les flux sont en 16/9, démarrés et muets par défaut, et réordonnables par glisser-déposer. Un clic sur un flux l'affiche en grand avec le son. L'application propose un thème clair et un thème sombre.

Le projet est parti d'un dossier vide.

## 2. Décisions prises avant le développement

| Sujet | Décision |
|---|---|
| Technologie | **Electron + React** (TypeScript, Vite via `electron-vite`). Installeur `.exe` produit par `electron-builder` (NSIS). |
| Sources vidéo | **Mixtes** : un flux HLS officiel quand il existe, sinon un direct embarqué, avec bascule automatique vers la source suivante en cas d'échec. |
| Persistance | **Tout est mémorisé** : disposition, chaînes, ordre et thème. |
| Passage à une disposition plus petite | Les **N premières chaînes** sont conservées, dans l'ordre courant. |

## 3. Plan initial (tel que validé)

### Architecture prévue

```
Multiplex/
  package.json, electron.vite.config.ts, electron-builder.yml, tsconfig.json
  build/icon.*
  scripts/check-streams.mjs          vérifie chaque source
  src/main/index.ts                  fenêtre, protocole, en-têtes réseau
  src/preload/index.ts               pont minimal vers le renderer
  src/renderer/
    data/channels.*                  catalogue des chaînes
    assets/logos/                    logos stockés en local
    store/useAppStore.ts             état global persistant (zustand)
    layout/computeRects.ts           calcul pur des positions des tuiles
    components/                      Rail, SidePanel, pickers, Stage, Tile, players/
    styles/theme.css                 variables de thème clair/sombre
```

### Principe central : les lecteurs ne se remontent jamais

Changer de disposition, réordonner ou passer en grand ne doit pas relancer les flux. Toutes les tuiles sont donc des enfants stables de la scène, positionnés en absolu. Une fonction pure, `computeRects()`, calcule le rectangle de chaque tuile, et Framer Motion anime la position et la taille.

### Étapes prévues

1. Initialiser le projet Electron + React + TypeScript.
2. Processus principal : fenêtre, protocole, en-têtes CORS, User-Agent et Referer, politique d'autoplay.
3. Catalogue : vérifier les flux, confirmer les chaînes YouTube, télécharger les logos.
4. Store persistant, avec la règle de limite et de troncature.
5. `computeRects` et ses tests unitaires.
6. Lecteurs : HLS, YouTube, et un lecteur générique qui gère le repli.
7. Scène et tuiles : animations, mode grand, croix, Échap, son.
8. Glisser-déposer sur appui long (dnd-kit).
9. Barre latérale, panneaux, sélecteurs de disposition et de chaînes.
10. Thèmes clair et sombre.
11. Packaging Windows.

### Vérification prévue

- Tests unitaires (Vitest) sur la géométrie et les règles de sélection.
- Script de vérification des flux.
- Essais manuels de chaque interaction, puis de l'installeur.

## 4. Écarts par rapport au plan initial

Ces écarts sont apparus pendant le développement de la première version.

| Prévu | Réalisé | Raison |
|---|---|---|
| Deux types de source (HLS, YouTube) | Trois types : **HLS, YouTube, Dailymotion** | franceinfo interdit l'intégration de son direct YouTube (erreur 150), et CNews ne diffuse officiellement que sur Dailymotion. Le flux HLS signé de Dailymotion est résolu par le processus principal, puis lu par hls.js. |
| franceinfo sur YouTube | franceinfo sur **Dailymotion** (compte officiel) | Voir ci-dessus. |
| Piloter YouTube par son API IFrame | Pilotage direct par **postMessage** | L'API IFrame exige une origine http(s), ce que n'est pas l'application packagée. |
| Servir l'application en interceptant `https://` | Protocole dédié **`app://multiplex`** | Intercepter tout le https aurait fait transiter chaque segment vidéo par le processus principal. Le Referer exigé par YouTube est injecté par le processus principal. |
| LCN, RTS Info, CRTV News au catalogue | **Retirées** | Géo-bloquées depuis la France (HTTP 403). |
| LCI au catalogue | **Absente** | Aucun direct public officiel n'existe. |
| — | Logos clairs sur **pastille sombre** (`logoBg: "dark"`) | Plusieurs logos sont blancs sur fond transparent. |
| — | **Reprise automatique** de la lecture et retour au direct | Chromium met en pause les vidéos muettes quand la fenêtre est masquée. |
| — | **Mesure immédiate** de la scène au montage | Le ResizeObserver ne se déclenche pas tant que la fenêtre est masquée, ce qui laissait la scène vide. |
| — | **Chien de garde** sur les flux HLS figés, et **un seul** signalement d'échec par lecteur | Une erreur de manifest laissait le lecteur bloqué sans passer à la source suivante. Un double signalement aurait fait sauter une source. |

## 5. Journal des évolutions demandées

### Itération 2 : franceinfo, fond et thème sombre

- **franceinfo ne fonctionnait pas en mode développement.** En dev, l'application tourne sur `http://localhost:5173`, et le CDN de Dailymotion refuse ce `Origin`/`Referer` (HTTP 403). Le processus principal retire désormais ces en-têtes sur toutes les requêtes vers Dailymotion. CNews profite du même correctif.
- **Fond décoratif « chaîne d'info internationale ».** Globe filaire, orbites en pointillés, trame de points et halos, à environ 9 % d'opacité (`Backdrop.tsx`).
- **Thème sombre bleu nuit** (`#0a1122`). Le thème clair passe en gris-bleu léger (`#f1f4f9`). La barre de titre Windows suit le thème.

### Itération 3 : LCI, chaînes parlementaires, 6 flux, bouton de thème

- **LCI : refusée.** L'URL proposée provenait d'un dépôt tiers et contenait un jeton d'accès au CDN de TF1, lié à l'adresse IP de ce tiers et valable environ 4 heures. Il s'agit d'une redistribution d'un flux protégé, et l'URL ne répondait d'ailleurs pas.
- **LCP : ajoutée**, via son direct officiel sur Dailymotion (« Canal 100% », celui intégré sur lcp.fr). Ce direct n'est diffusé qu'aux heures d'antenne.
- **Public Sénat : non ajoutée.** Son direct Dailymotion est restreint à ses propres sites (code DM016), et la chaîne n'a pas de direct YouTube.
- **Nouvelle disposition à 6 flux** (3 × 2).
- **Bouton de thème déplacé dans la barre de titre**, sans texte : un soleil pour passer au thème clair, une lune pour passer au sombre.

### Itération 4 : fenêtre, fondu, clavier

- **Fenêtre maximisée** à l'ouverture.
- **Fondu enchaîné** de 0,45 s au changement de thème, via l'API View Transitions.
- **Raccourcis clavier** : aide, chaînes, disposition, flux 1 à 6, Échap. Les panneaux se parcourent aux flèches.
- **Numéro de position affiché sur chaque flux.**

### Itération 5 : simplification

- **Bouton Aide retiré** de la barre latérale. L'aide reste accessible au clavier (`H`).
- **Indications clavier retirées** des panneaux, car l'usage est implicite.
- **« Layout » renommé « Disposition »**, avec le raccourci `D` au lieu de `L`.
- **Bouton Chaînes placé en premier**, avant Disposition. La barre latérale est légèrement élargie.
- **Le numéro de touche figure dans l'infobulle de chaque flux.**

### Itération 6 : épuration du panneau Disposition

- **Libellés retirés sous les vignettes** des dispositions : le schéma suffit. Le nom reste disponible pour les lecteurs d'écran (`aria-label`).

### Itération 7 : centrage en plein écran

- **Problème** : en plein écran (`F11`), la grille n'était pas centrée verticalement. La scène était décalée vers le bas par la barre de titre (36 px) et par des marges inégales (4 px en haut, 14 px en bas). Le décalage devenait visible dès que la grille ne remplissait pas toute la hauteur, par exemple avec 6 flux.
- **Correctif** :
  - en plein écran, la barre de titre est masquée (événement envoyé par le processus principal) ;
  - les marges de la scène sont égales en haut et en bas ;
  - le panneau latéral et la barre de gauche sont alignés sur la nouvelle marge.

### Itération 8 : plein écran

- **Le bas de la grille restait coupé en plein écran.** La vraie cause : la hauteur minimale de la fenêtre (640 px). Sur un écran 1080p à 175 %, l'écran ne fait qu'environ 590 px de haut, et Windows gardait donc une fenêtre plus haute que l'écran. Le minimum passe à 800 × 480.
- **`F11`** est ajouté à l'aide. Il est géré par l'interface, et le menu d'application par défaut est supprimé.
- **Nouveau bouton plein écran** à côté du bouton de thème.
- **En plein écran** :
  - la barre de gauche est masquée ;
  - une barre flottante (thème, quitter le plein écran) apparaît au mouvement de la souris ;
  - `Échap` quitte aussi le plein écran, en dernier recours.

### Itération 9 : barre flottante et curseur

- **Barre flottante du plein écran** : les boutons **Chaînes** et **Disposition** y sont ajoutés en premier, avant Thème et Quitter le plein écran, séparés par un trait.
- **Curseur masqué en plein écran** après 2,5 s d'inactivité, comme la barre. Il réapparaît au moindre mouvement.

### Itération 10 : infobulle persistante

- **Bug** : l'infobulle native du flux (« *Nom* (touche *n*) ») ne disparaissait pas. Windows la garde affichée tant que la souris reste sur l'élément, et le calque de capture couvre tout le flux.
- **Correctif** : l'infobulle est retirée. L'étiquette affichée au survol donne déjà le numéro et le nom.

### Itération 11 : étiquette persistante

- **Bug** : l'étiquette du flux (numéro, logo, nom) restait affichée tant que la souris était posée sur le flux.
- **Correctif** : un détecteur d'inactivité unique (`useMouseIdle`) pose la classe `mouse-idle` sur la page après 2,5 s sans mouvement. L'étiquette, la croix du grand flux, la barre flottante et, en plein écran, le curseur s'effacent alors ensemble.

### Itération 12 : écran d'ouverture

- **Splashscreen d'environ 1,7 s** au lancement, façon chaîne d'info : balayage d'un bandeau rouge, grille du logo, titre « MULTIPLEX », bandeau « EN DIRECT ». Il s'efface ensuite vers le haut.
- **Intégré à l'interface**, et non dans une fenêtre séparée : les flux démarrent dessous pendant l'animation. Vérifié : à la fin de l'animation, les 4 flux par défaut sont déjà prêts à être lus.

### Itération 13 : panneau Information, README, publication

- **Panneau Information** : il s'ouvre par un bouton en bas de la barre latérale, par la barre flottante en plein écran, ou par la touche `I`. Il présente l'application (icône, version, description), la liste des chaînes avec un lien vers leur site, les mentions légales sur les droits des flux, et les licences des bibliothèques embarquées.
- **Licences tierces** : les bibliothèques embarquées sont toutes sous licence permissive (MIT, ISC, Apache-2.0, 0BSD). Elles exigent seulement de reproduire leur mention de copyright et leur licence. Un plugin Vite (`scripts/licenses.ts`) les collecte à chaque build, ce qui évite une liste à maintenir à la main.
- **Liens externes** : le processus principal ouvre les liens `https://` dans le navigateur par défaut, au lieu de les bloquer.
- **README** ajouté.
- **Publication automatisée** : le workflow GitHub Actions `release.yml` se déclenche sur un tag `v*`. Il vérifie que le tag correspond à la version de `package.json`, lance les tests, construit l'installeur et le dépose dans une **release brouillon**. Lancé à la main, il construit seulement l'installeur, en artefact.
- **Multiplateforme écarté pour l'instant** : l'application reste Windows uniquement. Les adaptations relevées pour macOS (barre de titre, menu, raccourci plein écran, signature) et Linux restent à faire si le besoin revient.
- **Licence de Multiplex** : aucune pour l'instant (tous droits réservés). Le choix entre MIT et Apache-2.0 reste ouvert.

## 6. Vérification réalisée

- **Tests unitaires** : 22 tests Vitest sur la géométrie des 6 dispositions et du mode grand (1 à 6 flux), et sur les règles de sélection.
- **Script de vérification** : `npm run check-streams` contrôle chaque source du catalogue.
- **Tests de bout en bout** : l'application a été pilotée via le protocole DevTools, en version packagée comme en mode dev :
  - lecture de chaque chaîne du catalogue ;
  - mode grand et son ;
  - croix et Échap ;
  - glisser-déposer ;
  - limite de sélection et troncature ;
  - thèmes et fondu ;
  - raccourcis clavier ;
  - bascule HLS → YouTube, en bloquant volontairement les flux d'Euronews.
- **Installeur** : l'exécutable packagé a été lancé et lit bien les flux.
