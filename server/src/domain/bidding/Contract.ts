import { SuitCode } from '../card/Suit';
import { Trump } from '../card/Trump';
import { Seat } from '../table/Seat';
import { Team } from '../table/Team';

export interface ContractSnapshot {
  taker: number;
  trump: SuitCode;
}

/** Engagement du preneur : faire plus de points que la défense avec cet atout. */
export class Contract {
  constructor(
    private readonly takerSeat: Seat,
    private readonly trumpSuit: Trump,
  ) {}

  trump(): Trump {
    return this.trumpSuit;
  }

  taker(): Seat {
    return this.takerSeat;
  }

  isTakenBy(seat: Seat): boolean {
    return this.takerSeat.equals(seat);
  }

  takingTeam(): Team {
    return this.takerSeat.team();
  }

  defendingTeam(): Team {
    return this.takingTeam().opponent();
  }

  toSnapshot(): ContractSnapshot {
    return { taker: this.takerSeat.toIndex(), trump: this.trumpSuit.toCode() };
  }
}
