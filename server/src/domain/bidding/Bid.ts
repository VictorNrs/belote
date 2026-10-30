import { Card } from '../card/Card';
import { Suit } from '../card/Suit';
import { Trump } from '../card/Trump';
import { BiddingRound } from './BiddingRound';

export class Bid {
  private constructor(
    private readonly taking: boolean,
    private readonly requestedSuit: Suit | null,
  ) {}

  static pass(): Bid {
    return new Bid(false, null);
  }

  static take(suit: Suit | null = null): Bid {
    return new Bid(true, suit);
  }

  isTake(): boolean {
    return this.taking;
  }

  trumpFor(round: BiddingRound, proposed: Card): Trump {
    return round.trumpFor(this.requestedSuit, proposed);
  }
}
