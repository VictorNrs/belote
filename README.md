# Belote ♠ ♥ ♣ ♦

Jeu de belote classique multijoueur en ligne, pensé pour le mobile.
Monorepo **TypeScript** : serveur **Node.js** (Express + Socket.io) et client **React** (Vite).

- Belote à 4 (en équipes) ou à 3 (chacun pour soi), en temps réel : on crée une table,
  on partage le code (ou le lien), les amis rejoignent.
- Des robots complètent les places libres, ou remplacent un joueur qui quitte la partie.
- Possibilité de jouer seul contre des robots.
- Reconnexion automatique : après un rechargement de page, on retrouve sa place.

## Démarrage

Prérequis : Node.js 20 ou plus.

```bash
npm install
npm run dev        # serveur sur :3001 + client sur :5173 (proxy WebSocket)
```

Ouvrez http://localhost:5173. Pour tester sur un téléphone du même réseau Wi-Fi, ouvrez
`http://<ip-de-votre-pc>:5173` (Vite écoute sur toutes les interfaces).

Production :

```bash
npm run build      # compile le serveur (tsup) et le client (vite)
npm start          # sert le client et l'API Socket.io sur le port $PORT (3001 par défaut)
```

| Commande            | Rôle                                          |
| ------------------- | --------------------------------------------- |
| `npm test`          | tests du domaine et des cas d'usage (Vitest)  |
| `npm run lint`      | ESLint, avec les règles d'Object Calisthenics |
| `npm run typecheck` | vérification TypeScript de tous les paquets   |

Variable optionnelle côté client : `VITE_SERVER_URL` si le serveur est hébergé sur une autre origine.

## Règles implémentées

### Belote à 4

- 32 cartes, 2 équipes de 2 (partenaires face à face), distribution 3 + 2 puis une carte retournée.
- Enchères en deux tours : au premier on prend la couleur retournée, au second on choisit une autre couleur.
  Si tout le monde passe deux fois, on redistribue (le donneur change).
- Le preneur reçoit la retourne + 2 cartes, les autres 3 cartes.
- Obligation de fournir, de monter à l'atout, de couper et de surcouper (sauf si le partenaire est maître).
  Sans pouvoir surcouper, on n'est pas obligé de sous-couper.
- Belote / Rebelote (roi + dame d'atout) : 20 points, toujours acquis à l'équipe qui les détient.
- Dix de der : 10 points pour le dernier pli.
- Contrat rempli : chacun marque ses points. Dedans : 162 pour la défense. Capot : 252.
  Litige (égalité) : les points du preneur sont mis en réserve et vont à l'équipe qui gagne la donne suivante.
- Partie en 500, 1000 ou 1500 points.

### Belote à 3

Mêmes règles de jeu, avec ces différences :

- 24 cartes (on retire les 7 et les 8), chacun joue pour soi. Le total reste de 162 points.
- Distribution 3 + 2, une carte retournée ; après la prise, le preneur reçoit la retourne + 2 cartes, les autres 3 :
  chacun a 8 cartes.
- Pas de partenaire : sans la couleur demandée, il faut toujours couper (et surcouper si possible).
- Contrat rempli si le preneur fait au moins 82 points (belote comprise) : chacun marque ses points.
  Dedans : chaque adversaire marque 81 points. Capot du preneur : 252. Pas de litige.

Non implémenté (pistes d'évolution) : annonces (tierce, cinquante, cent, carrés), coinche, sans-atout / tout-atout.

## Architecture

```
shared/          contrat réseau (types des événements Socket.io et des vues)
server/src/
  domain/        cœur métier pur, sans aucune dépendance technique
    card/        Suit, Rank, Card, Cards, Deck, Trump, Valuation, Points
    table/       Seat, Team, TeamPoints, TableFormat (port)
    format/      FourPlayerFormat, ThreePlayerFormat : places, équipes, paquet, comptage
    bidding/     Bidding, BiddingRound (1er / 2nd tour), Bid, Contract, BiddingOutcome
    play/        Trick, PlayRules, PlayingDeal, Hands, Belote, CardDealer, ...
    scoring/     TeamDealScorer (à 4), SoloDealScorer (à 3), DealResult, Scoreboard
    game/        Game (agrégat) + une classe par phase (pattern State)
    room/        Room (agrégat), participants, places, hôte
    bot/         stratégie des robots
  application/   cas d'usage (un par action), ports, synchronisation des salles
  infrastructure/adaptateurs : Socket.io, Express, mémoire, minuteries, hasard
  main.ts        racine de composition (seul endroit qui connaît les implémentations)
client/src/
  domain/        logique de présentation pure (faces de cartes, placement à table)
  application/   ports (GameGateway, PlayerProfile) et hook useRoom
  infrastructure/adaptateurs Socket.io et localStorage
  ui/            composants et écrans React
```

Le **format de table** est le seul endroit qui distingue la belote à 3 de la belote à 4 : il fournit les places,
les équipes (à 3, chaque joueur est sa propre « équipe »), le paquet et la stratégie de comptage. Les règles de jeu,
les enchères, les phases et les robots sont communs aux deux variantes.

La règle de dépendance est respectée : `domain` ← `application` ← `infrastructure`.
Le domaine ne connaît ni Socket.io, ni Express, ni le hasard (le mélange est injecté via le port `Shuffler`,
ce qui rend les tests déterministes).

Le serveur fait autorité : le client n'envoie que des intentions (« je prends », « je joue le valet de cœur »)
et reçoit une vue personnelle qui ne contient jamais les mains des autres joueurs.

### Phases de jeu (pattern State)

```
BiddingState ──prise──▶ PlayingState ──4 cartes──▶ TrickCompleteState ──ramassage──▶ PlayingState
     ▲  └──tous passent──▶ BiddingState (donneur suivant)          └──8e pli──▶ DealEndState ──▶ BiddingState
     │                                                                        └──objectif atteint──▶ GameOverState
```

Chaque phase n'accepte que les actions qui ont un sens pour elle ; les autres lèvent une `DomainError`.

## Clean code et Object Calisthenics

| Règle                                    | Mise en œuvre                                                                                                                   |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1. Un seul niveau d'indentation          | `max-depth: 1` (ESLint) sur le serveur ; retours anticipés, `reduce`, petites méthodes                                         |
| 2. Pas de `else`                         | interdit par ESLint ; retours anticipés, polymorphisme (`BiddingRound`, états de la partie, `BiddingOutcome.resolve`)          |
| 3. Encapsuler les primitives             | `Points`, `Seat`, `Team`, `Suit`, `Rank`, `PlayerId`, `PlayerName`, `RoomCode`                                                  |
| 4. Collections de première classe        | `Cards`, `Hands`, `Trick`, `CollectedTricks`, `Passes`, `SeatAssignments`, `TeamPoints`                                         |
| 5. Un point par ligne                    | délégation plutôt que chaînage d'accès (`contract.takingTeam()` plutôt que `contract.taker.team`)                              |
| 6. Pas d'abréviation                     | noms complets, vocabulaire métier français dans les messages (`Dedans`, `Capot`, `Litige`)                                      |
| 7. Petites entités                       | fichiers ≤ 150 lignes, fonctions ≤ 20 lignes, complexité ≤ 6 (ESLint)                                                          |
| 8. Peu de variables d'instance           | respecté par les objets valeur et les collections ; assoupli pour les agrégats (`Room`, `PlayingDeal`, `Bidding`)              |
| 9. Pas de getters/setters                | objets immuables, méthodes « dis, ne demande pas » (`trump.beats()`, `room.join()`) ; quelques accesseurs d'intention restent aux frontières (`card.suit()`, `contract.trump()`) |

Les règles vérifiables automatiquement sont dans [eslint.config.js](eslint.config.js) ; elles sont appliquées strictement
au serveur et de façon adaptée au JSX côté client.
