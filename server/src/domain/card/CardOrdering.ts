import { Card } from './Card';
import { Suit } from './Suit';
import { Valuation } from './Valuation';

/** Façon d'ordonner des cartes pour l'affichage d'une main. */
export interface CardOrdering {
  displayOrder(): readonly Suit[];
  strengthOf(card: Card): number;
}

export class PlainOrdering implements CardOrdering {
  displayOrder(): readonly Suit[] {
    return Suit.all();
  }

  strengthOf(card: Card): number {
    return card.strengthIn(Valuation.PLAIN);
  }
}
