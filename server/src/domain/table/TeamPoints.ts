import { Points } from '../card/Points';
import { Team } from './Team';

type PointsByTeam = readonly [Points, Points];

/** Points des deux équipes. */
export class TeamPoints {
  static readonly ZERO = new TeamPoints([Points.ZERO, Points.ZERO]);

  private constructor(private readonly byTeam: PointsByTeam) {}

  static forTeam(team: Team, points: Points): TeamPoints {
    return TeamPoints.ZERO.add(team, points);
  }

  of(team: Team): Points {
    return this.byTeam[team.toIndex()];
  }

  add(team: Team, points: Points): TeamPoints {
    return this.mapTeams((current) => (current.equals(team) ? this.of(current).plus(points) : this.of(current)));
  }

  plus(other: TeamPoints): TeamPoints {
    return this.mapTeams((team) => this.of(team).plus(other.of(team)));
  }

  /** L'équipe qui a le plus de points, ou null en cas d'égalité. */
  leader(): Team | null {
    if (this.of(Team.FIRST).equals(this.of(Team.SECOND))) return null;
    return this.of(Team.FIRST).isGreaterThan(this.of(Team.SECOND)) ? Team.FIRST : Team.SECOND;
  }

  toNumbers(): number[] {
    return this.byTeam.map((points) => points.toNumber());
  }

  private mapTeams(compute: (team: Team) => Points): TeamPoints {
    return new TeamPoints([compute(Team.FIRST), compute(Team.SECOND)]);
  }
}
