import { Deck } from '../card/Deck';
import { Seat } from '../table/Seat';
import { Hands } from './Hands';

/** Étape intermédiaire d'une distribution : les mains déjà servies et le talon restant. */
export class Distribution {
  constructor(
    private readonly hands: Hands,
    private readonly deck: Deck,
  ) {}

  giveTo(seat: Seat, count: number): Distribution {
    const { drawn, remaining } = this.deck.draw(count);
    return new Distribution(this.hands.give(seat, drawn), remaining);
  }

  dealRound(order: readonly Seat[], countFor: (seat: Seat) => number): Distribution {
    return order.reduce<Distribution>((current, seat) => current.giveTo(seat, countFor(seat)), this);
  }

  dealtHands(): Hands {
    return this.hands;
  }

  remainingDeck(): Deck {
    return this.deck;
  }
}
