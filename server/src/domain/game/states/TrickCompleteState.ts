import { PlayingDeal } from '../../play/PlayingDeal';
import { Seat } from '../../table/Seat';
import { BaseState, GameState } from '../GameState';
import { GamePhase, GameSnapshot } from '../GameSnapshot';
import { Table } from '../Table';
import { DealEndState } from './DealEndState';
import { GameOverState } from './GameOverState';
import { PlayingState } from './PlayingState';

/** Les quatre cartes sont posées : le pli reste visible jusqu'à ce qu'il soit ramassé. */
export class TrickCompleteState extends BaseState {
  constructor(
    table: Table,
    private readonly deal: PlayingDeal,
  ) {
    super(table);
  }

  phase(): GamePhase {
    return 'trickComplete';
  }

  override advance(): GameState {
    const deal = this.deal.collectTrick();
    if (!deal.isOver()) return new PlayingState(this.table, deal);
    return this.conclude(deal);
  }

  snapshotFor(viewer: Seat): GameSnapshot {
    return { ...this.table.snapshot(this.phase()), ...this.deal.toSnapshot(viewer) };
  }

  private conclude(deal: PlayingDeal): GameState {
    const result = deal.score(this.table.pendingLitige());
    const recorded = this.table.record(result);
    if (recorded.winner()) return new GameOverState(recorded, deal, result);
    return new DealEndState(recorded, deal, result);
  }
}
