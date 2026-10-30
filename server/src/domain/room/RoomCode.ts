import { DomainError } from '../shared/DomainError';

const ROOM_CODE_PATTERN = /^[A-Z]{4}$/;

/** Code à 4 lettres permettant de rejoindre une salle. */
export class RoomCode {
  static readonly ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  static readonly LENGTH = 4;

  private constructor(private readonly value: string) {}

  static of(raw: string): RoomCode {
    const value = raw.trim().toUpperCase();
    if (!ROOM_CODE_PATTERN.test(value)) throw new DomainError('Code de salle invalide');
    return new RoomCode(value);
  }

  equals(other: RoomCode): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
