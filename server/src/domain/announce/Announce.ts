import { Points } from '../card/Points';
import { Seat } from '../table/Seat';
import { Team } from '../table/Team';

export interface AnnounceSnapshot {
  seat: number;
  label: string;
  points: number;
}

/** Valeur d'une annonce : ses points, puis sa hauteur, puis le fait d'être à l'atout départagent deux annonces. */
export class AnnounceValue {
  constructor(
    private readonly points: Points,
    private readonly height: number,
    private readonly inTrump: boolean,
  ) {}

  compare(other: AnnounceValue): number {
    const byPoints = this.points.toNumber() - other.points.toNumber();
    const byHeight = this.height - other.height;
    return byPoints || byHeight || Number(this.inTrump) - Number(other.inTrump);
  }

  worth(): Points {
    return this.points;
  }
}

/** Combinaison annoncée par un joueur : suite (tierce, cinquante, cent) ou carré. */
export class Announce {
  constructor(
    private readonly seat: Seat,
    private readonly label: string,
    private readonly value: AnnounceValue,
  ) {}

  isBy(seat: Seat): boolean {
    return this.seat.equals(seat);
  }

  belongsTo(team: Team): boolean {
    return this.seat.team().equals(team);
  }

  team(): Team {
    return this.seat.team();
  }

  compare(other: Announce): number {
    return this.value.compare(other.value);
  }

  worth(): Points {
    return this.value.worth();
  }

  name(): string {
    return this.label;
  }

  toSnapshot(): AnnounceSnapshot {
    return { seat: this.seat.toIndex(), label: this.label, points: this.worth().toNumber() };
  }
}
