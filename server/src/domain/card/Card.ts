import { Points } from './Points';
import { Rank } from './Rank';
import { Suit } from './Suit';
import { Valuation } from './Valuation';

export class Card {
  private constructor(
    private readonly rank: Rank,
    private readonly cardSuit: Suit,
  ) {}

  static of(rank: Rank, suit: Suit): Card {
    return new Card(rank, suit);
  }

  static fromCode(code: string): Card {
    return new Card(Rank.fromCode(code.slice(0, -1)), Suit.fromCode(code.slice(-1)));
  }

  suit(): Suit {
    return this.cardSuit;
  }

  isOfSuit(suit: Suit): boolean {
    return this.cardSuit.equals(suit);
  }

  hasRank(rank: Rank): boolean {
    return this.rank.equals(rank);
  }

  sameSuitAs(other: Card): boolean {
    return other.isOfSuit(this.cardSuit);
  }

  strengthIn(valuation: Valuation): number {
    return valuation.strengthOf(this.rank);
  }

  pointsIn(valuation: Valuation): Points {
    return valuation.pointsOf(this.rank);
  }

  equals(other: Card): boolean {
    return other.hasRank(this.rank) && other.isOfSuit(this.cardSuit);
  }

  toCode(): string {
    return `${this.rank.toCode()}${this.cardSuit.toCode()}`;
  }
}
