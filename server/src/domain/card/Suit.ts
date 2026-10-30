import { DomainError } from '../shared/DomainError';

export type SuitCode = 'S' | 'H' | 'D' | 'C';

export class Suit {
  static readonly SPADES = new Suit('S');
  static readonly HEARTS = new Suit('H');
  static readonly DIAMONDS = new Suit('D');
  static readonly CLUBS = new Suit('C');

  private constructor(private readonly code: SuitCode) {}

  static all(): readonly Suit[] {
    return [Suit.SPADES, Suit.HEARTS, Suit.CLUBS, Suit.DIAMONDS];
  }

  static fromCode(code: string): Suit {
    const suit = Suit.all().find((candidate) => candidate.code === code);
    if (!suit) throw new DomainError(`Couleur inconnue : ${code}`);
    return suit;
  }

  equals(other: Suit): boolean {
    return this === other;
  }

  toCode(): SuitCode {
    return this.code;
  }
}
