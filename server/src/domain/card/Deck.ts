import { Card } from './Card';
import { Cards } from './Cards';
import { Shuffler } from './Shuffler';

export interface Draw {
  drawn: Cards;
  remaining: Deck;
}

/** Talon de cartes, dont on tire par le dessus. */
export class Deck {
  private constructor(private readonly cards: Cards) {}

  static shuffled(cards: Cards, shuffler: Shuffler): Deck {
    return new Deck(cards.shuffledWith(shuffler));
  }

  static of(cards: Cards): Deck {
    return new Deck(cards);
  }

  draw(count: number): Draw {
    const [drawn, rest] = this.cards.splitAt(count);
    return { drawn, remaining: new Deck(rest) };
  }

  topCard(): Card {
    return this.cards.first();
  }

  withoutTopCard(): Deck {
    return this.draw(1).remaining;
  }
}
