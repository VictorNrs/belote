import { Card } from './Card';
import { CardOrdering } from './CardOrdering';
import { Points } from './Points';
import { Rank } from './Rank';
import { Suit, SuitCode } from './Suit';
import { Valuation } from './Valuation';

/** La couleur d'atout d'une donne. */
export class Trump implements CardOrdering {
  constructor(private readonly suit: Suit) {}

  isTrump(card: Card): boolean {
    return card.isOfSuit(this.suit);
  }

  isSuit(suit: Suit): boolean {
    return this.suit.equals(suit);
  }

  isBeloteCard(card: Card): boolean {
    return this.isTrump(card) && (card.hasRank(Rank.KING) || card.hasRank(Rank.QUEEN));
  }

  strengthOf(card: Card): number {
    return card.strengthIn(this.valuationOf(card));
  }

  pointsOf(card: Card): Points {
    return card.pointsIn(this.valuationOf(card));
  }

  /** Vrai si `challenger` bat `holder`, la carte actuellement maîtresse du pli. */
  beats(challenger: Card, holder: Card): boolean {
    if (this.isTrump(challenger) && !this.isTrump(holder)) return true;
    if (!challenger.sameSuitAs(holder)) return false;
    return this.strengthOf(challenger) > this.strengthOf(holder);
  }

  displayOrder(): readonly Suit[] {
    return [this.suit, ...Suit.all().filter((suit) => !suit.equals(this.suit))];
  }

  toCode(): SuitCode {
    return this.suit.toCode();
  }

  private valuationOf(card: Card): Valuation {
    return this.isTrump(card) ? Valuation.TRUMP : Valuation.PLAIN;
  }
}
