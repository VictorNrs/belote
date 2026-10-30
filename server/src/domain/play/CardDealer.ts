import { Deck } from '../card/Deck';
import { Shuffler } from '../card/Shuffler';
import { Seat } from '../table/Seat';
import { Distribution } from './Distribution';
import { Hands } from './Hands';
import { OpeningDeal } from './OpeningDeal';

/** Distribue les cartes par 3 puis par 2, en commençant à gauche du donneur. */
export class CardDealer {
  constructor(private readonly shuffler: Shuffler) {}

  dealOpening(dealer: Seat): OpeningDeal {
    const format = dealer.format();
    const order = dealer.next().roundFromHere();
    const dealt = new Distribution(Hands.empty(format), Deck.shuffled(format.deck(), this.shuffler))
      .dealRound(order, () => 3)
      .dealRound(order, () => 2);
    return new OpeningDeal(dealt.dealtHands(), dealt.remainingDeck(), dealer);
  }
}
