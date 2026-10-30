import { Card } from '../card/Card';
import { Bid } from '../bidding/Bid';
import { BotStrategy } from '../bot/BotStrategy';
import { DomainError } from '../shared/DomainError';
import { Seat } from '../table/Seat';
import { GamePhase, GameSnapshot } from './GameSnapshot';
import { Table } from './Table';

/** Une phase de la partie : chaque phase n'accepte que les actions qui ont du sens pour elle. */
export interface GameState {
  phase(): GamePhase;
  bid(seat: Seat, bid: Bid): GameState;
  play(seat: Seat, card: Card): GameState;
  advance(): GameState;
  playerToAct(): Seat | null;
  actAsBot(seat: Seat, strategy: BotStrategy): GameState;
  snapshotFor(viewer: Seat): GameSnapshot;
}

/** Comportement par défaut : toute action est refusée. */
export abstract class BaseState implements GameState {
  constructor(protected readonly table: Table) {}

  abstract phase(): GamePhase;
  abstract snapshotFor(viewer: Seat): GameSnapshot;

  bid(_seat: Seat, _bid: Bid): GameState {
    throw new DomainError('Les enchères sont terminées');
  }

  play(_seat: Seat, _card: Card): GameState {
    throw new DomainError('Impossible de jouer une carte maintenant');
  }

  advance(): GameState {
    throw new DomainError('La partie ne peut pas avancer maintenant');
  }

  playerToAct(): Seat | null {
    return null;
  }

  actAsBot(_seat: Seat, _strategy: BotStrategy): GameState {
    throw new DomainError("Ce n'est pas au robot de jouer");
  }
}
