import { DomainError } from '../shared/DomainError';
import { Team } from './Team';

export type SeatIndex = 0 | 1 | 2 | 3;

const SEAT_COUNT = 4;

/** Place autour de la table, numérotée dans le sens du jeu. */
export class Seat {
  private static readonly SEATS: readonly Seat[] = [0, 1, 2, 3].map((index) => new Seat(index as SeatIndex));

  private constructor(private readonly index: SeatIndex) {}

  static all(): readonly Seat[] {
    return Seat.SEATS;
  }

  static count(): number {
    return SEAT_COUNT;
  }

  static of(index: number): Seat {
    const seat = Seat.SEATS[index];
    if (!seat) throw new DomainError(`Place inconnue : ${index}`);
    return seat;
  }

  next(): Seat {
    return Seat.of((this.index + 1) % SEAT_COUNT);
  }

  partner(): Seat {
    return Seat.of((this.index + 2) % SEAT_COUNT);
  }

  team(): Team {
    return Team.of(this.index % 2);
  }

  isPartnerOf(other: Seat): boolean {
    return this.partner().equals(other);
  }

  /** Les quatre places dans l'ordre du jeu, en commençant par celle-ci. */
  roundFromHere(): readonly Seat[] {
    return Seat.SEATS.map((_, offset) => Seat.of((this.index + offset) % SEAT_COUNT));
  }

  equals(other: Seat): boolean {
    return this === other;
  }

  toIndex(): SeatIndex {
    return this.index;
  }
}
