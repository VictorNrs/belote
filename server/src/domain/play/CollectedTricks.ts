import { Points } from '../card/Points';
import { Team } from '../table/Team';
import { TeamPoints } from '../table/TeamPoints';

const TRICKS_PER_DEAL = 8;
const DIX_DE_DER = new Points(10);

class CollectedTrick {
  constructor(
    private readonly winner: Team,
    private readonly points: Points,
  ) {}

  isWonBy(team: Team): boolean {
    return this.winner.equals(team);
  }

  pointsFor(team: Team): Points {
    return this.isWonBy(team) ? this.points : Points.ZERO;
  }
}

/** Plis ramassés par chaque équipe pendant la donne (le dernier vaut 10 points de plus). */
export class CollectedTricks {
  private constructor(
    private readonly teams: readonly Team[],
    private readonly tricks: readonly CollectedTrick[],
  ) {}

  static none(teams: readonly Team[]): CollectedTricks {
    return new CollectedTricks(teams, []);
  }

  collect(winner: Team, points: Points): CollectedTricks {
    const isLastTrick = this.tricks.length === TRICKS_PER_DEAL - 1;
    const bonus = isLastTrick ? DIX_DE_DER : Points.ZERO;
    return new CollectedTricks(this.teams, [...this.tricks, new CollectedTrick(winner, points.plus(bonus))]);
  }

  isEmpty(): boolean {
    return this.tricks.length === 0;
  }

  isComplete(): boolean {
    return this.tricks.length === TRICKS_PER_DEAL;
  }

  countFor(team: Team): number {
    return this.tricks.filter((trick) => trick.isWonBy(team)).length;
  }

  cardPoints(): TeamPoints {
    return this.teams.reduce(
      (total, team) => total.add(team, Points.sum(this.tricks.map((trick) => trick.pointsFor(team)))),
      TeamPoints.zero(this.teams),
    );
  }

  /** L'équipe qui a fait tous les plis (capot), s'il y en a une. */
  sweepingTeam(): Team | null {
    return this.teams.find((team) => this.countFor(team) === TRICKS_PER_DEAL) ?? null;
  }

  counts(): number[] {
    return this.teams.map((team) => this.countFor(team));
  }
}
