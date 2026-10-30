import { Card } from '../card/Card';
import { DomainError } from '../shared/DomainError';
import { Seat } from '../table/Seat';
import { Bid } from './Bid';
import { AllPassed, BiddingOutcome, Continued, Taken } from './BiddingOutcome';
import { BiddingRound } from './BiddingRound';
import { Contract } from './Contract';
import { Passes } from './Passes';

export interface BiddingSnapshot {
  turn: number;
  proposedCard: string;
  biddingRound: number;
  passedSeats: number[];
}

export class Bidding {
  private constructor(
    private readonly proposed: Card,
    private readonly turn: Seat,
    private readonly round: BiddingRound,
    private readonly passes: Passes,
  ) {}

  static open(dealer: Seat, proposed: Card): Bidding {
    return new Bidding(proposed, dealer.next(), BiddingRound.first(), Passes.NONE);
  }

  place(seat: Seat, bid: Bid): BiddingOutcome {
    if (!seat.equals(this.turn)) throw new DomainError("Ce n'est pas votre tour de parler");
    if (bid.isTake()) return new Taken(new Contract(seat, bid.trumpFor(this.round, this.proposed)));
    return this.afterPassOf(seat);
  }

  currentBidder(): Seat {
    return this.turn;
  }

  proposedCard(): Card {
    return this.proposed;
  }

  currentRound(): BiddingRound {
    return this.round;
  }

  toSnapshot(): BiddingSnapshot {
    return {
      turn: this.turn.toIndex(),
      proposedCard: this.proposed.toCode(),
      biddingRound: this.round.number(),
      passedSeats: this.passes.seatsIn(this.round),
    };
  }

  private afterPassOf(seat: Seat): BiddingOutcome {
    const passes = this.passes.record(seat, this.round);
    if (!passes.everyonePassedIn(this.round)) return this.continueWith(seat.next(), this.round, passes);
    const nextRound = this.round.next();
    if (!nextRound) return new AllPassed();
    return this.continueWith(seat.next(), nextRound, passes);
  }

  private continueWith(turn: Seat, round: BiddingRound, passes: Passes): BiddingOutcome {
    return new Continued(new Bidding(this.proposed, turn, round, passes));
  }
}
