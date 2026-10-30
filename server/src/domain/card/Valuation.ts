import { Points } from './Points';
import { Rank } from './Rank';

/** Force et valeur des rangs dans une couleur, selon qu'elle est atout ou non. */
export class Valuation {
  static readonly TRUMP = new Valuation(
    [Rank.SEVEN, Rank.EIGHT, Rank.QUEEN, Rank.KING, Rank.TEN, Rank.ACE, Rank.NINE, Rank.JACK],
    [0, 0, 3, 4, 10, 11, 14, 20],
  );

  static readonly PLAIN = new Valuation(
    [Rank.SEVEN, Rank.EIGHT, Rank.NINE, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.TEN, Rank.ACE],
    [0, 0, 0, 2, 3, 4, 10, 11],
  );

  private constructor(
    private readonly ascendingRanks: readonly Rank[],
    private readonly pointsByStrength: readonly number[],
  ) {}

  strengthOf(rank: Rank): number {
    return this.ascendingRanks.indexOf(rank);
  }

  pointsOf(rank: Rank): Points {
    return new Points(this.pointsByStrength[this.strengthOf(rank)] ?? 0);
  }
}
