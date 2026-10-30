import { Card } from '../card/Card';
import { Suit } from '../card/Suit';
import { Trump } from '../card/Trump';
import { DomainError } from '../shared/DomainError';

/** Tour d'enchères : au premier on prend la couleur retournée, au second on en choisit une autre. */
export abstract class BiddingRound {
  static first(): BiddingRound {
    return new FirstRound();
  }

  abstract number(): number;
  abstract next(): BiddingRound | null;
  abstract trumpFor(requested: Suit | null, proposed: Card): Trump;

  isSameAs(other: BiddingRound): boolean {
    return this.number() === other.number();
  }
}

class FirstRound extends BiddingRound {
  number(): number {
    return 1;
  }

  next(): BiddingRound {
    return new SecondRound();
  }

  trumpFor(_requested: Suit | null, proposed: Card): Trump {
    return new Trump(proposed.suit());
  }
}

class SecondRound extends BiddingRound {
  number(): number {
    return 2;
  }

  next(): null {
    return null;
  }

  trumpFor(requested: Suit | null, proposed: Card): Trump {
    if (!requested) throw new DomainError('Choisissez une couleur');
    if (proposed.isOfSuit(requested)) throw new DomainError('Au second tour, choisissez une autre couleur que la retourne');
    return new Trump(requested);
  }
}
