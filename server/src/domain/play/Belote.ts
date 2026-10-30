import { Card } from '../card/Card';
import { Points } from '../card/Points';
import { Trump } from '../card/Trump';
import { Seat } from '../table/Seat';
import { TeamPoints } from '../table/TeamPoints';
import { Hands } from './Hands';

const BELOTE_BONUS = new Points(20);

/** Roi et dame d'atout dans la même main : 20 points pour l'équipe qui les détient. */
export class Belote {
  private constructor(
    private readonly holder: Seat | null,
    private readonly cardsShown: number,
  ) {}

  static detect(hands: Hands, trump: Trump): Belote {
    const holder = hands.holderOf((hand) => hand.count((card) => trump.isBeloteCard(card)) === 2);
    return new Belote(holder, 0);
  }

  afterPlay(seat: Seat, card: Card, trump: Trump): Belote {
    if (!this.isHeldBy(seat) || !trump.isBeloteCard(card)) return this;
    return new Belote(this.holder, this.cardsShown + 1);
  }

  announcement(): string {
    return this.cardsShown === 1 ? 'Belote !' : 'Rebelote !';
  }

  bonuses(): TeamPoints {
    if (!this.holder) return TeamPoints.ZERO;
    return TeamPoints.forTeam(this.holder.team(), BELOTE_BONUS);
  }

  holderTeamIndex(): number | null {
    return this.holder?.team().toIndex() ?? null;
  }

  private isHeldBy(seat: Seat): boolean {
    return this.holder !== null && this.holder.equals(seat);
  }
}
