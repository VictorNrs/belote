import { Card } from '../card/Card';
import { Cards } from '../card/Cards';
import { Deck } from '../card/Deck';
import { Contract } from '../bidding/Contract';
import { Seat } from '../table/Seat';
import { Distribution } from './Distribution';
import { Hands } from './Hands';

const CARDS_FOR_TAKER = 2;
const CARDS_FOR_OTHERS = 3;

/** Première distribution (5 cartes chacun) et carte retournée au-dessus du talon. */
export class OpeningDeal {
  constructor(
    private readonly hands: Hands,
    private readonly stock: Deck,
    private readonly dealer: Seat,
  ) {}

  proposedCard(): Card {
    return this.stock.topCard();
  }

  handOf(seat: Seat): Cards {
    return this.hands.of(seat);
  }

  handSizes(): number[] {
    return this.hands.sizes();
  }

  /** Le preneur reçoit la retourne et 2 cartes, les autres 3 cartes. */
  completeFor(contract: Contract): Hands {
    const withProposedCard = new Distribution(this.hands, this.stock).giveTo(contract.taker(), 1);
    const countFor = (seat: Seat) => (contract.isTakenBy(seat) ? CARDS_FOR_TAKER : CARDS_FOR_OTHERS);
    return withProposedCard.dealRound(this.dealer.next().roundFromHere(), countFor).dealtHands();
  }
}
