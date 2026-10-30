import { Points } from '../card/Points';
import { Team } from './Team';

/** Points de chacun des camps de la table. */
export class TeamPoints {
  private constructor(private readonly byTeam: readonly Points[]) {}

  static zero(teams: readonly Team[]): TeamPoints {
    return new TeamPoints(teams.map(() => Points.ZERO));
  }

  of(team: Team): Points {
    return this.byTeam[team.toIndex()] ?? Points.ZERO;
  }

  add(team: Team, points: Points): TeamPoints {
    return this.mapTeams((current) => (current.equals(team) ? this.of(current).plus(points) : this.of(current)));
  }

  /** Les mêmes points, sans ceux de ce camp. */
  without(team: Team): TeamPoints {
    return this.mapTeams((current) => (current.equals(team) ? Points.ZERO : this.of(current)));
  }

  plus(other: TeamPoints): TeamPoints {
    return this.mapTeams((team) => this.of(team).plus(other.of(team)));
  }

  /** Le camp qui a strictement le plus de points, ou null en cas d'égalité en tête. */
  leader(): Team | null {
    const best = this.teams().reduce((leader, team) => (this.of(team).isGreaterThan(this.of(leader)) ? team : leader));
    const tied = this.teams().filter((team) => this.of(team).equals(this.of(best)));
    return tied.length === 1 ? best : null;
  }

  toNumbers(): number[] {
    return this.byTeam.map((points) => points.toNumber());
  }

  private teams(): Team[] {
    return this.byTeam.map((_, index) => Team.of(index));
  }

  private mapTeams(compute: (team: Team) => Points): TeamPoints {
    return new TeamPoints(this.teams().map(compute));
  }
}
