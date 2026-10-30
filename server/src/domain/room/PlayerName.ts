import { DomainError } from '../shared/DomainError';

const MAX_LENGTH = 20;

export class PlayerName {
  private constructor(private readonly value: string) {}

  static of(raw: string): PlayerName {
    const value = raw.trim();
    if (value.length === 0 || value.length > MAX_LENGTH) throw new DomainError(`Le pseudo doit faire entre 1 et ${MAX_LENGTH} caractères`);
    return new PlayerName(value);
  }

  toString(): string {
    return this.value;
  }
}
