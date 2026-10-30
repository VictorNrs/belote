import { Cards } from '../card/Cards';
import { Trump } from '../card/Trump';
import { Seat } from '../table/Seat';
import { Trick } from './Trick';

/**
 * Règles de la belote classique pour savoir quelles cartes un joueur peut poser :
 * fournir la couleur demandée, monter à l'atout, couper et surcouper sauf si le partenaire est maître.
 */
export class PlayRules {
  constructor(
    private readonly trick: Trick,
    private readonly trump: Trump,
  ) {}

  legalCards(hand: Cards, seat: Seat): Cards {
    if (this.trick.isEmpty()) return hand;
    const lead = this.trick.leadCard();
    const followers = hand.filter((card) => card.sameSuitAs(lead));
    if (this.trump.isTrump(lead)) return this.whenTrumpIsLed(hand, followers);
    if (!followers.isEmpty()) return followers;
    return this.whenUnableToFollow(hand, seat);
  }

  private whenTrumpIsLed(hand: Cards, trumps: Cards): Cards {
    if (trumps.isEmpty()) return hand;
    return this.higherTrumpsOr(trumps, trumps);
  }

  private whenUnableToFollow(hand: Cards, seat: Seat): Cards {
    if (this.trick.winner(this.trump).isPartnerOf(seat)) return hand;
    const trumps = hand.trumpsOf(this.trump);
    if (trumps.isEmpty()) return hand;
    if (!this.trick.hasTrump(this.trump)) return trumps;
    return this.higherTrumpsOr(trumps, hand);
  }

  private higherTrumpsOr(trumps: Cards, fallback: Cards): Cards {
    const highest = this.trick.highestTrumpStrength(this.trump);
    const higher = trumps.filter((card) => this.trump.strengthOf(card) > highest);
    return higher.isEmpty() ? fallback : higher;
  }
}
