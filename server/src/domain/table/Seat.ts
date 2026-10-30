import type { TableFormat } from './TableFormat';
import { Team } from './Team';

export type SeatIndex = 0 | 1 | 2 | 3;

/** Place autour de la table, numérotée dans le sens du jeu. Les places sont créées par leur format de table. */
export class Seat {
  constructor(
    private readonly index: SeatIndex,
    private readonly table: TableFormat,
  ) {}

  next(): Seat {
    return this.table.seat((this.index + 1) % this.table.playerCount());
  }

  team(): Team {
    return this.table.teamOf(this.index);
  }

  isPartnerOf(other: Seat): boolean {
    return this.table.arePartners(this.index, other.index);
  }

  /** Toutes les places dans l'ordre du jeu, en commençant par celle-ci. */
  roundFromHere(): readonly Seat[] {
    return this.table.seats().map((_, offset) => this.table.seat((this.index + offset) % this.table.playerCount()));
  }

  format(): TableFormat {
    return this.table;
  }

  equals(other: Seat): boolean {
    return this === other;
  }

  toIndex(): SeatIndex {
    return this.index;
  }
}
