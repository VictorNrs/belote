import { Card } from '../../card/Card';
import { Contract } from '../../bidding/Contract';
import { BotStrategy } from '../../bot/BotStrategy';
import { Hands } from '../../play/Hands';
import { PlayingDeal } from '../../play/PlayingDeal';
import { Seat } from '../../table/Seat';
import { BaseState, GameState } from '../GameState';
import { GamePhase, GameSnapshot } from '../GameSnapshot';
import { Table } from '../Table';
import { TrickCompleteState } from './TrickCompleteState';

export class PlayingState extends BaseState {
  constructor(
    table: Table,
    private readonly deal: PlayingDeal,
  ) {
    super(table);
  }

  static start(table: Table, hands: Hands, contract: Contract): PlayingState {
    return new PlayingState(table, table.startPlaying(hands, contract));
  }

  phase(): GamePhase {
    return 'playing';
  }

  override playerToAct(): Seat {
    return this.deal.currentPlayer();
  }

  override play(seat: Seat, card: Card): GameState {
    const deal = this.deal.play(seat, card);
    const table = this.tableAfterAnnouncement(seat, deal);
    if (deal.isTrickComplete()) return new TrickCompleteState(table, deal);
    return new PlayingState(table, deal);
  }

  override actAsBot(seat: Seat, strategy: BotStrategy): GameState {
    return this.play(seat, strategy.chooseCard(this.deal.viewFor(seat)));
  }

  snapshotFor(viewer: Seat): GameSnapshot {
    return { ...this.table.snapshot(this.phase()), ...this.deal.toSnapshot(viewer) };
  }

  private tableAfterAnnouncement(seat: Seat, deal: PlayingDeal): Table {
    const announcement = deal.announcementSince(this.deal);
    return announcement ? this.table.announce(seat, announcement) : this.table;
  }
}
