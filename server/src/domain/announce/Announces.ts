import { Points } from '../card/Points';
import { Trump } from '../card/Trump';
import { Hands } from '../play/Hands';
import { Seat } from '../table/Seat';
import { Team } from '../table/Team';
import { TeamPoints } from '../table/TeamPoints';
import { Announce, AnnounceSnapshot } from './Announce';
import { AnnounceDetector } from './AnnounceDetector';

const detector = new AnnounceDetector();

/**
 * Annonces d'une donne. Seul le camp qui détient la meilleure annonce marque les siennes ;
 * en cas d'égalité parfaite entre deux camps, aucune annonce n'est comptée.
 */
export class Announces {
  static readonly NONE = new Announces([]);

  private constructor(private readonly declared: readonly Announce[]) {}

  static detect(hands: Hands, trump: Trump): Announces {
    return new Announces(hands.seats().flatMap((seat) => detector.detect(seat, hands.of(seat), trump)));
  }

  /** Ce que le joueur déclare en posant sa première carte, ex. « Tierce · Carré de 9 ». */
  declarationOf(seat: Seat): string | null {
    const labels = this.declared.filter((announce) => announce.isBy(seat)).map((announce) => announce.name());
    return labels.length ? labels.join(' · ') : null;
  }

  points(teams: readonly Team[]): TeamPoints {
    return this.valid().reduce((total, announce) => total.add(announce.team(), announce.worth()), TeamPoints.zero(teams));
  }

  total(): Points {
    return Points.sum(this.valid().map((announce) => announce.worth()));
  }

  toSnapshot(): AnnounceSnapshot[] {
    return this.valid().map((announce) => announce.toSnapshot());
  }

  private valid(): Announce[] {
    const winner = this.winningTeam();
    return winner ? this.declared.filter((announce) => announce.belongsTo(winner)) : [];
  }

  private winningTeam(): Team | null {
    const ranked = [...this.declared].sort((a, b) => b.compare(a));
    const [best, runnerUp] = ranked;
    if (!best) return null;
    const isTiedWithOpponent = runnerUp !== undefined && runnerUp.compare(best) === 0 && !runnerUp.team().equals(best.team());
    return isTiedWithOpponent ? null : best.team();
  }
}
