import { DomainError } from '../shared/DomainError';

/** Camp qui marque des points : une paire de partenaires à 4, un joueur seul à 3. */
export class Team {
  private static readonly TEAMS: readonly Team[] = [0, 1, 2].map((index) => new Team(index));

  private constructor(private readonly index: number) {}

  static of(index: number): Team {
    const team = Team.TEAMS[index];
    if (!team) throw new DomainError(`Équipe inconnue : ${index}`);
    return team;
  }

  equals(other: Team): boolean {
    return this === other;
  }

  toIndex(): number {
    return this.index;
  }
}
