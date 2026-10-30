import { DomainError } from '../shared/DomainError';
import { Seat } from '../table/Seat';
import { Participant, ParticipantSnapshot } from './Participant';
import { PlayerId } from './PlayerId';

type Slot = Participant | null;

export interface SeatSnapshot extends ParticipantSnapshot {
  isHost: boolean;
}

/** Qui est assis à quelle place. */
export class SeatAssignments {
  private constructor(private readonly slots: readonly Slot[]) {}

  static empty(): SeatAssignments {
    return new SeatAssignments(Seat.all().map(() => null));
  }

  seatOf(id: PlayerId): Seat | null {
    const index = this.slots.findIndex((slot) => slot?.isPlayer(id));
    return index < 0 ? null : Seat.of(index);
  }

  firstFreeSeat(): Seat | null {
    return Seat.all().find((seat) => this.isFree(seat)) ?? null;
  }

  isFree(seat: Seat): boolean {
    return this.occupant(seat) === null;
  }

  isFull(): boolean {
    return this.slots.every((slot) => slot !== null);
  }

  isBotAt(seat: Seat): boolean {
    return this.occupant(seat)?.isBot() ?? false;
  }

  /** Un robot peut s'asseoir sur une place libre ou remplacer un joueur déconnecté. */
  acceptsBotAt(seat: Seat): boolean {
    return !(this.occupant(seat)?.isConnected() ?? false);
  }

  assign(seat: Seat, participant: Participant): SeatAssignments {
    return this.replace(seat, participant);
  }

  release(seat: Seat): SeatAssignments {
    return this.replace(seat, null);
  }

  moveTo(id: PlayerId, target: Seat): SeatAssignments {
    const origin = this.seatOf(id);
    const participant = origin && this.occupant(origin);
    if (!origin || !participant) throw new DomainError("Vous n'êtes pas assis à cette table");
    return this.release(origin).assign(target, participant);
  }

  updatePlayer(id: PlayerId, update: (participant: Participant) => Participant): SeatAssignments {
    return new SeatAssignments(this.slots.map((slot) => (slot?.isPlayer(id) ? update(slot) : slot)));
  }

  humanIds(): PlayerId[] {
    return this.slots.flatMap((slot) => slot?.playerId() ?? []);
  }

  hasConnectedHuman(): boolean {
    return this.slots.some((slot) => slot !== null && !slot.isBot() && slot.isConnected());
  }

  toSnapshot(host: PlayerId): (SeatSnapshot | null)[] {
    return this.slots.map((slot) => slot && { ...slot.toSnapshot(), isHost: slot.isPlayer(host) });
  }

  private occupant(seat: Seat): Slot {
    return this.slots[seat.toIndex()] ?? null;
  }

  private replace(seat: Seat, slot: Slot): SeatAssignments {
    return new SeatAssignments(this.slots.map((current, index) => (index === seat.toIndex() ? slot : current)));
  }
}
