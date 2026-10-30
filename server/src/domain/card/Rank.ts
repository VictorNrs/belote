import { DomainError } from '../shared/DomainError';

export type RankCode = '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export class Rank {
  static readonly SEVEN = new Rank('7');
  static readonly EIGHT = new Rank('8');
  static readonly NINE = new Rank('9');
  static readonly TEN = new Rank('10');
  static readonly JACK = new Rank('J');
  static readonly QUEEN = new Rank('Q');
  static readonly KING = new Rank('K');
  static readonly ACE = new Rank('A');

  private constructor(private readonly code: RankCode) {}

  static all(): readonly Rank[] {
    return [Rank.SEVEN, Rank.EIGHT, Rank.NINE, Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE];
  }

  static fromCode(code: string): Rank {
    const rank = Rank.all().find((candidate) => candidate.code === code);
    if (!rank) throw new DomainError(`Rang inconnu : ${code}`);
    return rank;
  }

  equals(other: Rank): boolean {
    return this === other;
  }

  toCode(): RankCode {
    return this.code;
  }
}
