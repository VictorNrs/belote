import { AnnounceSnapshot } from '../announce/Announce';
import { AnnounceRule } from '../announce/AnnounceRule';
import { Announces } from '../announce/Announces';
import { Card } from '../card/Card';
import { Points } from '../card/Points';
import { Trump } from '../card/Trump';
import { Seat } from '../table/Seat';
import { Team } from '../table/Team';
import { TeamPoints } from '../table/TeamPoints';
import { Belote } from './Belote';
import { Hands } from './Hands';

/** Points gagnés en plus des cartes pendant une donne : belote et annonces. */
export class DealBonuses {
  private constructor(
    private readonly belote: Belote,
    private readonly announces: Announces,
  ) {}

  static detect(hands: Hands, trump: Trump, rule: AnnounceRule): DealBonuses {
    return new DealBonuses(Belote.detect(hands, trump), rule.detect(hands, trump));
  }

  afterPlay(seat: Seat, card: Card, trump: Trump): DealBonuses {
    const belote = this.belote.afterPlay(seat, card, trump);
    return belote === this.belote ? this : new DealBonuses(belote, this.announces);
  }

  /** Ce que le joueur annonce en posant sa carte : ses annonces au premier pli, puis belote et rebelote. */
  announcementSince(previous: DealBonuses, seat: Seat, isFirstTrick: boolean): string | null {
    const declaration = isFirstTrick ? this.announces.declarationOf(seat) : null;
    const belote = this.belote === previous.belote ? null : this.belote.announcement();
    const parts = [declaration, belote].filter((part): part is string => part !== null);
    return parts.length ? parts.join(' · ') : null;
  }

  totals(teams: readonly Team[]): TeamPoints {
    return this.beloteBonuses(teams).plus(this.announcePoints(teams));
  }

  beloteBonuses(teams: readonly Team[]): TeamPoints {
    return this.belote.bonuses(teams);
  }

  announcePoints(teams: readonly Team[]): TeamPoints {
    return this.announces.points(teams);
  }

  announceTotal(): Points {
    return this.announces.total();
  }

  beloteTeamIndex(): number | null {
    return this.belote.holderTeamIndex();
  }

  announcesSnapshot(): AnnounceSnapshot[] {
    return this.announces.toSnapshot();
  }
}
