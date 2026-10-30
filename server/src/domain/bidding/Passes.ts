import { Seat } from '../table/Seat';
import { BiddingRound } from './BiddingRound';

class Pass {
  constructor(
    private readonly seat: Seat,
    private readonly round: BiddingRound,
  ) {}

  isIn(round: BiddingRound): boolean {
    return this.round.isSameAs(round);
  }

  seatIndex(): number {
    return this.seat.toIndex();
  }
}

/** Historique des « je passe » d'une donne. */
export class Passes {
  static readonly NONE = new Passes([]);

  private constructor(private readonly passes: readonly Pass[]) {}

  record(seat: Seat, round: BiddingRound): Passes {
    return new Passes([...this.passes, new Pass(seat, round)]);
  }

  everyonePassedIn(round: BiddingRound): boolean {
    return this.in(round).length === Seat.count();
  }

  seatsIn(round: BiddingRound): number[] {
    return this.in(round).map((pass) => pass.seatIndex());
  }

  private in(round: BiddingRound): Pass[] {
    return this.passes.filter((pass) => pass.isIn(round));
  }
}
