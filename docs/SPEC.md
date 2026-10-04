# Multiplex : spécification

Version 1.0.0. Ce document décrit le comportement attendu de l'application, dans son état actuel. L'historique des décisions est dans le [plan et journal](PLAN.md).

## 1. Objet

Multiplex est une application de bureau Windows qui affiche simultanément de 2 à 6 directs de chaînes d'information francophones, dans une mosaïque en 16/9. L'utilisateur choisit les chaînes et la disposition, réordonne les flux, et affiche un flux en grand pour l'écouter.

## 2. Écran principal

```
┌──────────────────────────────────────────────────────────────┐
│ ● Multiplex                                  ☀   ─  □  ✕     │  barre de titre (36 px)
├──────┬───────────────────────────────────────────────────────┤
│  📺  │                                                       │
│Chaînes│        scène : flux disposés selon la disposition      │
│  ▦   │                                                       │
│Dispo.│                                                       │
└──────┴───────────────────────────────────────────────────────┘
```

### 2.1 Fenêtre

- La fenêtre s'ouvre **maximisée**. Restaurée, elle mesure 1440 × 900, avec un minimum de 800 × 480. Ce minimum reste bas, car avec une forte mise à l'échelle (1080p à 175 %), l'écran ne fait qu'environ 590 px de haut.
- La barre de titre est personnalisée. Elle contient :
  - à gauche, le nom « Multiplex » précédé d'un point rouge ;
  - à droite, juste avant les boutons natifs Réduire / Agrandir / Fermer, le **bouton de thème** puis le **bouton plein écran** (icônes seules).
- La barre de titre permet de déplacer la fenêtre. Les boutons natifs prennent les couleurs du thème.
- **Plein écran** : il s'active avec `F11` ou le bouton plein écran.
  - **Affichage immersif** : la barre de titre et la barre de gauche sont masquées. La scène occupe tout l'écran, avec des marges égales, et la grille est centrée.
  - **Barre flottante** : quand la souris bouge, une barre apparaît en haut à droite. Elle contient, dans l'ordre, **Chaînes**, **Disposition**, **À propos**, un séparateur, **Thème** et **Quitter le plein écran**. Les boutons Chaînes, Disposition et À propos ouvrent ou ferment leur panneau, et celui du panneau ouvert est en surbrillance. La barre s'efface après 2,5 s d'inactivité de la souris, même si elle est survolée.
  - **Curseur** : après le même délai d'inactivité (2,5 s), le curseur de la souris est masqué. Il réapparaît dès que la souris bouge.
  - **Sortie** : `F11`, `Échap` (si aucun panneau ni grand flux n'est ouvert) ou le bouton.
  - **Panneaux** : ils restent accessibles par la barre flottante et au clavier (`C`, `D`).

### 2.2 Écran d'ouverture

Au lancement, un habillage façon chaîne d'info recouvre l'application pendant environ **1,7 s**, puis s'efface vers le haut en 0,45 s. Pendant ce temps, les flux démarrent en dessous, ce qui masque leur temps de chargement. L'animation se déroule ainsi :

1. un bandeau rouge-orangé balaie l'écran de gauche à droite, puis se retire ;
2. la grille du logo apparaît tuile par tuile (la première en rouge « direct ») ;
3. le titre « MULTIPLEX » se révèle ;
4. un bandeau apparaît, avec « ● EN DIRECT » (point pulsant) et « L'info francophone en continu ».

L'écran d'ouverture suit le thème actif et fait partie de l'interface : ce n'est pas une fenêtre séparée.

### 2.3 Barre latérale

Elle contient trois boutons, dans cet ordre :

1. **Chaînes** : ouvre ou ferme le panneau Chaînes. Infobulle « Chaînes (C) ».
2. **Disposition** : ouvre ou ferme le panneau Disposition. Infobulle « Disposition (D) ».
3. **À propos**, seul en **bas** de la barre, icône sans libellé : ouvre ou ferme le panneau À propos. Infobulle « À propos (I) ».

Le bouton du panneau ouvert est mis en surbrillance.

### 2.4 Panneaux latéraux

- **Ouverture** : un panneau s'ouvre en surimpression à gauche de la scène (330 px de large), avec une animation de glissement et un voile sur la scène.
- **Fermeture** : la croix, un clic sur le voile, `Échap`, ou la même commande d'ouverture.
- **Un seul panneau à la fois** : ouvrir un panneau remplace celui qui est ouvert.
- **Focus clavier** : à l'ouverture, le focus va sur l'élément actif du panneau. À la fermeture, il est relâché.

### 2.5 Panneau À propos

Il présente, de haut en bas :

- **L'application** : son icône, son nom, sa version (lue dans `package.json` au build) et son copyright, puis une courte description.
- **Les mentions légales** :
  - Multiplex ne stocke ni ne retransmet aucun contenu : chaque flux est lu depuis la source officielle de la chaîne ;
  - les programmes, flux, noms et logos appartiennent aux chaînes, et Multiplex n'est affilié à aucune d'elles.
- **Les chaînes disponibles**, dans une section **repliée** par défaut. Une flèche indique qu'elle se déplie, et pivote quand elle est ouverte. Les chaînes suivent l'ordre du catalogue, avec leur logo. Chaque ligne est un lien vers le **site officiel** de la chaîne, ouvert dans le navigateur par défaut, jamais dans l'application.
- **Les logiciels tiers** : chaque bibliothèque embarquée, avec sa version et sa licence. Un clic déplie son site et le texte complet de sa licence (et de son fichier NOTICE, s'il existe). La liste est collectée dans `node_modules` à chaque build (`scripts/licenses.ts`). Les licences de Chromium sont fournies avec l'application, dans `LICENSES.chromium.html`.

## 3. Dispositions

| Identifiant | Schéma | Flux |
|---|---|---|
| `2h` | 2 côte à côte | 2 |
| `2v` | 2 l'un sur l'autre | 2 |
| `3top2` | 2 en haut, 1 centré en bas | 3 |
| `3top1` | 1 centré en haut, 2 en bas | 3 |
| `4grid` | grille 2 × 2 | 4 |
| `6grid` | grille 3 × 2 | 6 |

### Règles géométriques

- Chaque flux est en **16/9**, et tous les flux d'une disposition ont la **même taille**.
- Chaque flux prend la taille maximale qui tient dans la scène, avec un espacement de 10 px entre les flux.
- Chaque rangée est centrée horizontalement, et l'ensemble est centré verticalement. La scène a des marges égales en haut et en bas (14 px).
- Si la sélection compte moins de flux que la disposition, les emplacements libres affichent un cadre en pointillés « + Ajouter une chaîne ». Un clic sur ce cadre ouvre le panneau Chaînes.

### Panneau Disposition

- Il présente les 6 dispositions sous forme de **vignettes schématiques**, sur deux colonnes et sans libellé. La disposition active est en surbrillance.
- **Appliquer une disposition** : un clic, ou `Entrée` / `Espace` sur la vignette sélectionnée.
- **Passer à une disposition plus petite** : seules les **N premières chaînes** de la sélection sont conservées, dans l'ordre courant. Une infobulle prévient du nombre de chaînes qui seront retirées.

## 4. Flux

### 4.1 Comportement de lecture

- **Démarrage** : tous les flux démarrent automatiquement. Il n'y a ni bouton lecture ni bouton stop.
- **Son** : tous les flux sont **muets** par défaut. Il n'y a pas de réglage de volume. Seul le flux affiché en grand a le son, à 100 %.
- **Aucun contrôle de lecteur** n'est affiché.
- **Reprise automatique** : un flux ne reste jamais en pause. S'il est suspendu, par exemple quand la fenêtre est masquée, il reprend et revient au direct s'il a pris plus de 10 s de retard.
- **Qualité** : elle s'adapte à la taille d'affichage, pour qu'une miniature ne charge pas la qualité 1080p.

### 4.2 Étiquette

Au survol d'un flux, une étiquette apparaît en bas à gauche. Elle contient :

- le **numéro de position** (1 à 6), qui est aussi le raccourci clavier ;
- le logo et le nom de la chaîne ;
- une icône de son si le flux est affiché en grand.

Le flux n'a pas d'infobulle native : l'étiquette en tient lieu. Une infobulle Windows resterait affichée tant que la souris est posée sur le flux.

**Souris inactive** : après **2,5 s** sans mouvement de la souris, l'étiquette et la croix du flux en grand s'effacent, même si la souris reste posée sur le flux. Elles réapparaissent au moindre mouvement. Ce délai est commun à toute l'application (voir aussi le plein écran).

### 4.3 Flux affiché en grand

- **Ouvrir** : un clic sur un flux, ou sa touche `1` à `6`.
- **Disposition** : le flux s'agrandit à droite, au maximum en 16/9. Les autres flux passent en **miniatures empilées** dans une colonne à gauche (environ 20 % de la largeur), dans l'ordre de la sélection. La transition est animée par un ressort.
- **Son** : il s'active sur le flux affiché en grand.
- **Changer de flux** : un clic sur une miniature, ou sa touche, l'affiche en grand à son tour.
- **Revenir à la mosaïque** : une **croix** en haut à droite du flux en grand, visible au survol, ou `Échap`. Tous les flux redeviennent muets.
- **Si la chaîne affichée en grand est retirée** de la sélection, l'application revient à la mosaïque.

### 4.4 Réordonnancement

- **Geste** : un **appui long** de 400 ms sur un flux démarre le glisser. Une tolérance de 6 px permet de bouger légèrement pendant l'appui.
- **Pendant le glisser** : le flux suit le pointeur, légèrement agrandi. Le flux survolé est encadré de rouge.
- **Au dépôt** sur un autre flux : les deux **échangent leur place**, et les flux rejoignent leur nouvel emplacement avec une animation.
- **Un appui court** reste un clic.
- **Mode grand** : le glisser fonctionne aussi, entre les miniatures.

### 4.5 Invariant technique

Aucune action (changement de disposition, réordonnancement, passage en grand, ajout ou retrait d'une autre chaîne) ne doit **relancer** un flux déjà en lecture. Seule la position des flux change.

## 5. Sélection des chaînes

Le panneau Chaînes liste le catalogue groupé par zone, dans cet ordre : France, Europe, Canada, Afrique, Maroc, Monaco, Israël. Chaque ligne affiche le logo, le nom et une case.

- **Compteur** : une pastille « *n* / *capacité* » est affichée à côté du titre du panneau. Elle passe en rouge quand la disposition est pleine.
- **Cocher une chaîne** l'ajoute **à la fin** de la sélection. La case affiche alors la position de la chaîne (1, 2…).
- **Décocher une chaîne** la retire, et les suivantes remontent d'un rang.
- **Disposition pleine** :
  - les chaînes non cochées sont **grisées et sans effet**, avec l'infobulle « Maximum *N* chaînes pour cette disposition » ;
  - un message apparaît en haut de la liste : « Disposition complète. Décochez une chaîne pour en choisir une autre, ou passez à une disposition plus grande. » Le lien « passez à une disposition plus grande » ouvre le panneau Disposition. Il est absent avec la disposition à 6 flux, la plus grande ;
  - les lignes grisées restent atteignables au clavier.
- **Logos** : ils sont affichés sur une pastille blanche, ou sombre pour les logos clairs.

## 6. Clavier

Les raccourcis sont ignorés quand Ctrl, Alt ou Méta est enfoncé.

| Touche | Action |
|---|---|
| `C` | Ouvre ou ferme le panneau Chaînes. |
| `D` | Ouvre ou ferme le panneau Disposition. |
| `I` | Ouvre ou ferme le panneau À propos. |
| `H` | Ouvre ou ferme le panneau « Raccourcis clavier » (aide). |
| `1` … `6` | Affiche en grand le flux à cette position (ferme un éventuel panneau). Les touches sont lues par position physique, donc sans Maj sur un clavier AZERTY. |
| `F11` | Active ou quitte le plein écran. |
| `Échap` | Ferme le panneau ouvert. Sinon, revient du mode grand à la mosaïque. Sinon, quitte le plein écran. |
| `↑` `↓` | Panneau Chaînes : passer d'une chaîne à l'autre. |
| `Espace` / `Entrée` | Panneau Chaînes : cocher ou décocher. |
| `←` `↑` `→` `↓` | Panneau Disposition : se déplacer dans la grille des vignettes. |
| `Entrée` / `Espace` | Panneau Disposition : appliquer la disposition. Les flèches seules ne l'appliquent pas, pour éviter de retirer des chaînes par inadvertance. |
| `Début` / `Fin` | Dans les panneaux : aller au premier ou au dernier élément. |

## 7. Thèmes et fond

- **Thème initial** : il suit le thème du système. Le choix de l'utilisateur est ensuite mémorisé.
- **Bouton de thème** : il affiche un **soleil** en thème sombre (pour passer au clair) et une **lune** en thème clair (pour passer au sombre).
- **Changement de thème** : un **fondu enchaîné de 0,45 s**.
- **Thème sombre, bleu nuit** :

  | Élément | Couleur |
  |---|---|
  | Fond | `#0a1122` |
  | Panneaux | `#111a2f` |
  | Bordures | `#22314f` |
  | Texte | `#e6ecf7` |

- **Thème clair, gris-bleu léger** :

  | Élément | Couleur |
  |---|---|
  | Fond | `#f1f4f9` |
  | Panneaux | `#ffffff` |
  | Texte | `#1b1d24` |

- **Couleur d'accent** : rouge « direct » (`#ff3d4f` en sombre, `#e5293b` en clair).
- **Fond décoratif** : un habillage discret d'« info internationale » (globe filaire, orbites en pointillés, trame de points, halos bleu et rouge), à environ 9 % d'opacité. Il ne doit jamais concurrencer les flux.

## 8. Persistance

- **Ce qui est mémorisé** : la **disposition**, la **sélection ordonnée** et le **thème**, d'un lancement à l'autre (clé `multiplex-state`).
- **Ce qui ne l'est pas** : le flux affiché en grand et le panneau ouvert.
- **Au chargement** : les chaînes inconnues du catalogue et les doublons sont retirés, puis la sélection est tronquée à la capacité de la disposition.
- **Premier lancement** : disposition `4grid` avec franceinfo, BFMTV, France 24 et TV5Monde Info. Le thème suit le système.

## 9. Catalogue et sources

### 9.1 Critères d'inclusion

Une chaîne n'entre au catalogue que si elle remplit trois conditions :

- elle est **francophone** et d'**information** ;
- elle a au moins une source **officielle**, c'est-à-dire le CDN de la chaîne ou son compte officiel YouTube ou Dailymotion ;
- elle est **lisible depuis la France** sans contourner de protection : pas de jeton récupéré par un tiers, pas d'usurpation de site autorisé.

Les rediffusions non officielles (adresses IP brutes, dépôts tiers) sont exclues.

### 9.2 Chaînes

| Zone | Chaîne | Sources (dans l'ordre de repli) |
|---|---|---|
| France | franceinfo | Dailymotion |
| France | BFMTV | HLS |
| France | BFM Business | HLS |
| France | CNews | Dailymotion |
| France | France 24 | HLS, HLS de secours, YouTube |
| France | TV5Monde Info | HLS |
| France | LCP | Dailymotion (uniquement aux heures d'antenne) |
| Europe | Euronews | HLS, HLS de secours, YouTube |
| Afrique | Africanews | HLS, YouTube |
| Afrique | Africa 24 | HLS |
| Canada | ICI RDI | HLS |
| Israël | i24NEWS | HLS |
| Maroc | Medi1TV Afrique | HLS |
| Maroc | Medi1TV Maghreb | HLS |
| Monaco | Monaco Info | HLS |

Chaque chaîne a aussi un champ `website` : son site officiel, affiché dans le panneau À propos. Les URL exactes sont dans [`channels.json`](../src/renderer/data/channels.json). Les logos sont stockés en local dans `src/renderer/assets/logos/<id>.png`.

### 9.3 Chaînes écartées

| Chaîne | Raison |
|---|---|
| LCI | Aucun direct public officiel. Le flux proposé était une redistribution d'un flux protégé de TF1. |
| Public Sénat | Le direct Dailymotion est réservé à ses propres sites (code DM016), et il n'existe pas de direct YouTube. |
| LCN, RTS Info, CRTV News | Géo-bloquées depuis la France. |
| RT France, Press TV | Sous sanctions européennes. |
| Chaînes régionales BFM | Hors périmètre de l'information générale. |
| AL24 News | Qualité trop faible (240p). |

### 9.4 Types de source

| Type | Champ | Lecture |
|---|---|---|
| `hls` | `url` | `<video>` piloté par hls.js |
| `youtube` | `channelId` | Lecteur YouTube intégré sur le direct en cours de la chaîne (`embed/live_stream?channel=`), piloté par postMessage |
| `dailymotion` | `videoId` | URL HLS signée, résolue à la demande par le processus principal, puis lue par hls.js |

### 9.5 Résilience

- **Ordre des sources** : chaque chaîne déclare une liste ordonnée de sources. En cas d'échec, l'application passe à la source suivante.
- **Échec d'une source HLS**, dans l'un de ces cas :
  - le manifest est injoignable ;
  - une coupure en cours de lecture persiste après 3 relances (au bout de 2 s, 4 s puis 6 s) ;
  - une erreur média persiste après une tentative de récupération ;
  - le flux ne progresse plus pendant **30 s** alors que la fenêtre est visible.
- **Échec d'une source YouTube** : une erreur du lecteur, ou aucun démarrage dans les **30 s**.
- **Un seul signalement** d'échec est pris en compte par tentative.
- **Toutes les sources ont échoué** : le flux affiche le logo grisé et « Flux indisponible », puis l'application **réessaie toute la liste toutes les 60 s**.

## 10. Architecture technique

### 10.1 Pile

Electron 44, React 19, TypeScript, Vite (via electron-vite), hls.js, Framer Motion, @dnd-kit/core, zustand (avec persistance) et lucide-react. Les tests utilisent Vitest, et le packaging electron-builder (NSIS).

### 10.2 Processus principal (`src/main/index.ts`)

- **Protocole `app://multiplex`** : en production, il sert les fichiers de l'interface. Il fournit une origine fixe, ce qui garde la persistance d'un lancement à l'autre. En développement, c'est le serveur Vite qui sert l'interface.
- **User-Agent** : la mention « Electron » en est retirée, car certains CDN, dont celui de BFM, la refusent.
- **En-têtes sortants** :
  - **YouTube** (`/embed/`) : un `Referer` https est ajouté s'il est absent, pour éviter les erreurs 152 et 153 ;
  - **Dailymotion** (`*.dailymotion.com`, `*.dmcdn.net`) : `Origin` et `Referer` sont retirés, car le CDN répond 403 aux origines tierces comme `localhost`.
- **CORS** : `Access-Control-Allow-Origin: *` est ajouté aux réponses XHR destinées au document principal. Les iframes ne sont pas concernées.
- **IPC** :
  - `resolve-dailymotion(videoId)` renvoie l'URL HLS signée, obtenue via la pile réseau Chromium (le CDN rejette les clients non navigateurs) ;
  - `set-theme(theme)` met à jour le thème natif et les couleurs de la barre de titre ;
  - `toggle-fullscreen` et `is-fullscreen` pilotent et lisent le plein écran ;
  - `fullscreen` (du processus principal vers l'interface) signale l'entrée et la sortie du plein écran.
- **Pas de menu d'application**, pour que ses raccourcis (`F11`) ne doublent pas ceux de l'interface.
- **Fenêtre** :
  - `autoplayPolicy: no-user-gesture-required`, pour que le son s'active sans geste préalable ;
  - `backgroundThrottling: false` ;
  - liens externes bloqués.

### 10.3 Interface (`src/renderer/`)

| Module | Rôle |
|---|---|
| `data/channels.json`, `channels.ts` | Catalogue typé et association des logos. |
| `layout/layouts.ts` | Définition des dispositions (rangées, capacité). |
| `layout/computeRects.ts` | Fonctions pures : rectangles de la mosaïque et du mode grand. |
| `store/selection.ts` | Règles pures : ajout, retrait, limite, troncature, échange. |
| `store/useAppStore.ts` | État global : disposition, sélection, thème, flux en grand, panneau. Seuls disposition, sélection et thème sont persistés. |
| `components/Stage.tsx` | Mesure de la scène, calcul des rectangles, glisser-déposer, emplacements vides. |
| `components/Tile.tsx` | Flux animé, calque de capture des clics (au-dessus des iframes), étiquette, croix. |
| `components/players/*` | `StreamPlayer` (repli entre sources), `HlsPlayer`, `YouTubePlayer`, `DailymotionPlayer`. |
| `components/Rail.tsx`, `SidePanel.tsx`, `ChannelPicker.tsx`, `LayoutPicker.tsx`, `HelpPanel.tsx` | Barre latérale et panneaux. |
| `components/useArrowNav.ts` | Navigation aux flèches dans les panneaux. |
| `components/Backdrop.tsx` | Fond décoratif. |
| `components/Splash.tsx` | Écran d'ouverture animé. |
| `components/WindowActions.tsx` | Boutons thème et plein écran, et barre flottante du plein écran. |
| `useMouseIdle.ts` | Détection de l'inactivité de la souris (2,5 s). |
| `App.tsx` | Structure, thème avec fondu, raccourcis clavier. |
| `styles/theme.css` | Variables des thèmes et styles. |

### 10.4 Invariants d'implémentation

1. **Les flux sont rendus dans un ordre fixe** (trié par identifiant) et positionnés en absolu. Déplacer un `<video>` ou une `<iframe>` dans le DOM interromprait le flux.
2. **Un calque transparent couvre chaque flux** pour capter clics et glisser, car les iframes avalent les événements souris.
3. **Les rectangles sont calculés par des fonctions pures**, couvertes par les tests unitaires.
4. **Un redimensionnement de fenêtre repositionne les flux sans animation.**
5. **La scène est mesurée dès le montage** : le ResizeObserver ne se déclenche pas tant que la fenêtre est masquée.

## 11. Commandes

| Commande | Effet |
|---|---|
| `npm run dev` | Lance l'application en développement. |
| `npm test` | Lance les tests unitaires. |
| `npm run typecheck` | Vérifie les types. |
| `npm run check-streams` | Vérifie chaque source du catalogue (HTTP + manifest, direct YouTube, antenne Dailymotion). |
| `npm run build:win` | Produit l'installeur `dist/Multiplex Setup <version>.exe`. |

## 12. Limites connues

- **URL des flux** : elles peuvent changer sans préavis. Il faut lancer `npm run check-streams` régulièrement et mettre à jour `channels.json`.
- **LCP** n'est diffusée qu'aux heures d'antenne. Hors antenne, son flux affiche « Flux indisponible ».
- **i24NEWS** est signalée en erreur par `check-streams` (connexion réinitialisée côté Node), mais elle est lue normalement dans l'application.
- **Installeur non signé** : Windows SmartScreen affiche un avertissement à l'installation.
- **Fondu de thème** : pendant les 0,45 s, les vidéos peuvent montrer une brève image fantôme.
