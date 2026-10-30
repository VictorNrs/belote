import { Card } from '../card/Card';
import { Cards } from '../card/Cards';
import { Seat } from '../table/Seat';

/** Les mains des quatre joueurs. */
export class Hands {
  private constructor(private readonly bySeat: readonly Cards[]) {}

  static empty(): Hands {
    return new Hands(Seat.all().map(() => Cards.NONE));
  }

  of(seat: Seat): Cards {
    return this.bySeat[seat.toIndex()] ?? Cards.NONE;
  }

  give(seat: Seat, cards: Cards): Hands {
    return this.replace(seat, this.of(seat).with(cards));
  }

  remove(seat: Seat, card: Card): Hands {
    return this.replace(seat, this.of(seat).without(card));
  }

  holderOf(predicate: (hand: Cards) => boolean): Seat | null {
    return Seat.all().find((seat) => predicate(this.of(seat))) ?? null;
  }

  allCards(): Cards {
    return this.bySeat.reduce((all, hand) => all.with(hand), Cards.NONE);
  }

  sizes(): number[] {
    return this.bySeat.map((hand) => hand.size());
  }

  private replace(seat: Seat, hand: Cards): Hands {
    return new Hands(Seat.all().map((current) => (current.equals(seat) ? hand : this.of(current))));
  }
}
