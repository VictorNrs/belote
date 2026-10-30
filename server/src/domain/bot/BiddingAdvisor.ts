import { Cards } from '../card/Cards';
import { Rank } from '../card/Rank';
import { Suit } from '../card/Suit';
import { Trump } from '../card/Trump';
import { Bid } from '../bidding/Bid';
import { BiddingView } from './BotStrategy';

const FIRST_ROUND_THRESHOLD = 56;
const SECOND_ROUND_THRESHOLD = 60;
const TRUMP_LENGTH_BONUS = 4;
const SIDE_ACE_BONUS = 10;

interface Candidate {
  suit: Suit;
  strength: number;
}

/** Évalue la force d'une main pour chaque atout possible et prend au-delà d'un seuil. */
export class BiddingAdvisor {
  advise(view: BiddingView): Bid {
    const isFirstRound = view.round.number() === 1;
    const suits = isFirstRound ? [view.proposed.suit()] : Suit.all().filter((suit) => !view.proposed.isOfSuit(suit));
    const best = this.bestCandidate(view.hand.plus(view.proposed), suits);
    const threshold = isFirstRound ? FIRST_ROUND_THRESHOLD : SECOND_ROUND_THRESHOLD;
    if (!best || best.strength < threshold) return Bid.pass();
    return Bid.take(best.suit);
  }

  private bestCandidate(cards: Cards, suits: readonly Suit[]): Candidate | undefined {
    const candidates = suits.map((suit) => ({ suit, strength: this.strength(cards, new Trump(suit)) }));
    return candidates.sort((a, b) => b.strength - a.strength)[0];
  }

  private strength(cards: Cards, trump: Trump): number {
    const trumps = cards.trumpsOf(trump);
    const trumpValue = trumps.points(trump).toNumber() + trumps.size() * TRUMP_LENGTH_BONUS;
    const sideAces = cards.count((card) => !trump.isTrump(card) && card.hasRank(Rank.ACE));
    return trumpValue + sideAces * SIDE_ACE_BONUS;
  }
}
