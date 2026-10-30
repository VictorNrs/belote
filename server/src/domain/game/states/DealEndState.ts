import { PlayingDeal } from '../../play/PlayingDeal';
import { DealResult } from '../../scoring/DealResult';
import { Seat } from '../../table/Seat';
import { BaseState, GameState } from '../GameState';
import { GamePhase, GameSnapshot } from '../GameSnapshot';
import { Table } from '../Table';
import { BiddingState } from './BiddingState';

/** Fin de donne : les scores sont affichés avant la distribution suivante. */
export class DealEndState extends BaseState {
  constructor(
    table: Table,
    private readonly deal: PlayingDeal,
    private readonly result: DealResult,
  ) {
    super(table);
  }

  phase(): GamePhase {
    return 'dealEnd';
  }

  override advance(): GameState {
    return BiddingState.open(this.table.passDealToNextPlayer());
  }

  snapshotFor(viewer: Seat): GameSnapshot {
    return {
      ...this.table.snapshot(this.phase()),
      ...this.deal.toSnapshot(viewer),
      lastResult: this.result.toSnapshot(),
      winner: this.table.winner()?.toIndex() ?? null,
    };
  }
}
