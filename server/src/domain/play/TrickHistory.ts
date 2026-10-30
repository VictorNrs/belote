import { Trump } from '../card/Trump';
import { TableFormat } from '../table/TableFormat';
import { CollectedTricks } from './CollectedTricks';
import { PlayedCard, PlayedCardSnapshot } from './PlayedCard';
import { Trick } from './Trick';

export interface TrickSnapshot {
  cards: PlayedCardSnapshot[];
  winner: number;
}

/** Le pli en cours, le dernier pli ramassé et l'ensemble des plis de la donne. */
export class TrickHistory {
  private constructor(
    private readonly currentTrick: Trick,
    private readonly previous: TrickSnapshot | null,
    private readonly collected: CollectedTricks,
  ) {}

  static start(format: TableFormat): TrickHistory {
    return new TrickHistory(Trick.empty(format.playerCount()), null, CollectedTricks.none(format.teams()));
  }

  current(): Trick {
    return this.currentTrick;
  }

  play(play: PlayedCard): TrickHistory {
    return new TrickHistory(this.currentTrick.add(play), this.previous, this.collected);
  }

  collect(trump: Trump): TrickHistory {
    const winner = this.currentTrick.winner(trump);
    const previous = { cards: this.currentTrick.toSnapshot(), winner: winner.toIndex() };
    const collected = this.collected.collect(winner.team(), this.currentTrick.points(trump));
    return new TrickHistory(this.currentTrick.next(), previous, collected);
  }

  isFirstTrick(): boolean {
    return this.collected.isEmpty();
  }

  isTrickComplete(): boolean {
    return this.currentTrick.isComplete();
  }

  isOver(): boolean {
    return this.collected.isComplete();
  }

  collectedTricks(): CollectedTricks {
    return this.collected;
  }

  previousTrick(): TrickSnapshot | null {
    return this.previous;
  }
}
