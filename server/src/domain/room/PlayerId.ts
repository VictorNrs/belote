import { DomainError } from '../shared/DomainError';

const PLAYER_ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;

/** Identifiant persistant d'un joueur (généré et conservé par le navigateur). */
export class PlayerId {
  private constructor(private readonly value: string) {}

  static of(value: string): PlayerId {
    if (!PLAYER_ID_PATTERN.test(value)) throw new DomainError('Identifiant de joueur invalide');
    return new PlayerId(value);
  }

  equals(other: PlayerId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
