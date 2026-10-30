import { Card } from '../card/Card';
import { Cards } from '../card/Cards';
import { Seat } from '../table/Seat';
import { TableFormat } from '../table/TableFormat';

/** Les mains de tous les joueurs de la table. */
export class Hands {
  private constructor(
    private readonly format: TableFormat,
    private readonly bySeat: readonly Cards[],
  ) {}

  static empty(format: TableFormat): Hands {
    return new Hands(format, format.seats().map(() => Cards.NONE));
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

  seats(): readonly Seat[] {
    return this.format.seats();
  }

  holderOf(predicate: (hand: Cards) => boolean): Seat | null {
    return this.format.seats().find((seat) => predicate(this.of(seat))) ?? null;
  }

  allCards(): Cards {
    return this.bySeat.reduce((all, hand) => all.with(hand), Cards.NONE);
  }

  sizes(): number[] {
    return this.bySeat.map((hand) => hand.size());
  }

  private replace(seat: Seat, hand: Cards): Hands {
    return new Hands(this.format, this.format.seats().map((current) => (current.equals(seat) ? hand : this.of(current))));
  }
}
