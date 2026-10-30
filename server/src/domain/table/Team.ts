import { DomainError } from '../shared/DomainError';

export type TeamIndex = 0 | 1;

/** Équipe 0 : places 0 et 2. Équipe 1 : places 1 et 3. */
export class Team {
  static readonly FIRST = new Team(0);
  static readonly SECOND = new Team(1);

  private constructor(private readonly index: TeamIndex) {}

  static all(): readonly Team[] {
    return [Team.FIRST, Team.SECOND];
  }

  static of(index: number): Team {
    const team = Team.all()[index];
    if (!team) throw new DomainError(`Équipe inconnue : ${index}`);
    return team;
  }

  opponent(): Team {
    return this === Team.FIRST ? Team.SECOND : Team.FIRST;
  }

  equals(other: Team): boolean {
    return this === other;
  }

  toIndex(): TeamIndex {
    return this.index;
  }
}
