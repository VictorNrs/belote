import { DomainError } from '../shared/DomainError';
import { Card } from './Card';
import { CardOrdering } from './CardOrdering';
import { Points } from './Points';
import { Rank } from './Rank';
import { Shuffler } from './Shuffler';
import { Suit } from './Suit';
import { Trump } from './Trump';

type CardScore = (card: Card) => number;

/** Collection immuable de cartes (main, paquet, cartes jouables...). */
export class Cards {
  static readonly NONE = new Cards([]);

  constructor(private readonly items: readonly Card[]) {}

  static fullDeck(): Cards {
    return new Cards(Suit.all().flatMap((suit) => Rank.all().map((rank) => Card.of(rank, suit))));
  }

  static fromCodes(codes: readonly string[]): Cards {
    return new Cards(codes.map((code) => Card.fromCode(code)));
  }

  contains(card: Card): boolean {
    return this.items.some((item) => item.equals(card));
  }

  plus(card: Card): Cards {
    return new Cards([...this.items, card]);
  }

  with(other: Cards): Cards {
    return new Cards([...this.items, ...other.items]);
  }

  without(card: Card): Cards {
    return this.filter((item) => !item.equals(card));
  }

  withoutAll(other: Cards): Cards {
    return this.filter((item) => !other.contains(item));
  }

  filter(predicate: (card: Card) => boolean): Cards {
    return new Cards(this.items.filter(predicate));
  }

  ofSuit(suit: Suit): Cards {
    return this.filter((card) => card.isOfSuit(suit));
  }

  trumpsOf(trump: Trump): Cards {
    return this.filter((card) => trump.isTrump(card));
  }

  some(predicate: (card: Card) => boolean): boolean {
    return this.items.some(predicate);
  }

  count(predicate: (card: Card) => boolean): number {
    return this.items.filter(predicate).length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  first(): Card {
    const card = this.items[0];
    if (!card) throw new DomainError('Aucune carte disponible');
    return card;
  }

  strongest(score: CardScore): Card {
    return this.sortedBy((a, b) => score(b) - score(a)).first();
  }

  weakest(score: CardScore): Card {
    return this.sortedBy((a, b) => score(a) - score(b)).first();
  }

  sum(score: (card: Card) => Points): Points {
    return Points.sum(this.items.map(score));
  }

  points(trump: Trump): Points {
    return this.sum((card) => trump.pointsOf(card));
  }

  splitAt(count: number): [Cards, Cards] {
    return [new Cards(this.items.slice(0, count)), new Cards(this.items.slice(count))];
  }

  shuffledWith(shuffler: Shuffler): Cards {
    return new Cards(shuffler.shuffle(this.items));
  }

  orderedFor(ordering: CardOrdering): Cards {
    const bySuit = ordering.displayOrder().map((suit) => this.ofSuit(suit));
    const descending = bySuit.map((cards) => cards.sortedBy((a, b) => ordering.strengthOf(b) - ordering.strengthOf(a)));
    return descending.reduce((all, cards) => all.with(cards), Cards.NONE);
  }

  map<T>(transform: (card: Card) => T): T[] {
    return this.items.map(transform);
  }

  toCodes(): string[] {
    return this.map((card) => card.toCode());
  }

  private sortedBy(compare: (a: Card, b: Card) => number): Cards {
    return new Cards([...this.items].sort(compare));
  }
}
