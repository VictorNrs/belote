import { Card } from '../card/Card';
import { Bid } from '../bidding/Bid';
import { BotStrategy } from '../bot/BotStrategy';
import { Seat } from '../table/Seat';
import { GameState } from './GameState';
import { GamePhase, GameSnapshot } from './GameSnapshot';
import { GameSettings } from './GameSettings';
import { BiddingState } from './states/BiddingState';
import { Table } from './Table';

/** Agrégat racine d'une partie de belote : délègue chaque action à la phase courante. */
export class Game {
  private constructor(private state: GameState) {}

  static start(settings: GameSettings, firstDealer: Seat): Game {
    return new Game(BiddingState.open(Table.initial(settings, firstDealer)));
  }

  bid(seat: Seat, bid: Bid): void {
    this.state = this.state.bid(seat, bid);
  }

  play(seat: Seat, card: Card): void {
    this.state = this.state.play(seat, card);
  }

  advance(): void {
    this.state = this.state.advance();
  }

  actAsBot(seat: Seat, strategy: BotStrategy): void {
    this.state = this.state.actAsBot(seat, strategy);
  }

  phase(): GamePhase {
    return this.state.phase();
  }

  isOver(): boolean {
    return this.phase() === 'gameOver';
  }

  playerToAct(): Seat | null {
    return this.state.playerToAct();
  }

  snapshotFor(viewer: Seat): GameSnapshot {
    return this.state.snapshotFor(viewer);
  }
}
