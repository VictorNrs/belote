import { DomainError } from '../shared/DomainError';
import { Seat } from '../table/Seat';

export function seatAt(seats: readonly Seat[], index: number): Seat {
  const seat = seats[index];
  if (!seat) throw new DomainError(`Place inconnue : ${index}`);
  return seat;
}
