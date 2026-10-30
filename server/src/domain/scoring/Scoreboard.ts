import { Points } from '../card/Points';
import { Team } from '../table/Team';
import { TeamPoints } from '../table/TeamPoints';
import { DealResult } from './DealResult';

/** Tableau des scores cumulés de la partie. */
export class Scoreboard {
  static readonly START = new Scoreboard(TeamPoints.ZERO, Points.ZERO);

  private constructor(
    private readonly totals: TeamPoints,
    private readonly litige: Points,
  ) {}

  record(result: DealResult): Scoreboard {
    return new Scoreboard(this.totals.plus(result.scored()), result.pendingLitige());
  }

  pendingLitige(): Points {
    return this.litige;
  }

  /** L'équipe gagnante : celle qui mène après avoir atteint l'objectif. */
  winnerAt(target: Points): Team | null {
    const leader = this.totals.leader();
    if (!leader) return null;
    return this.totals.of(leader).isAtLeast(target) ? leader : null;
  }

  scores(): number[] {
    return this.totals.toNumbers();
  }
}
