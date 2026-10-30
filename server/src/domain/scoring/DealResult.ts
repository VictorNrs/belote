import { Points } from '../card/Points';
import { Contract, ContractSnapshot } from '../bidding/Contract';
import { Belote } from '../play/Belote';
import { TeamPoints } from '../table/TeamPoints';

export type DealOutcome = 'made' | 'failed' | 'capot' | 'capotAgainst' | 'litige';

export interface DealResultSnapshot {
  contract: ContractSnapshot;
  outcome: DealOutcome;
  cardPoints: number[];
  beloteTeam: number | null;
  scored: number[];
  pendingLitige: number;
}

export interface DealResultDetails {
  contract: Contract;
  outcome: DealOutcome;
  cardPoints: TeamPoints;
  belote: Belote;
  scored: TeamPoints;
  pendingLitige: Points;
}

/** Bilan d'une donne : points faits aux cartes et points marqués au tableau. */
export class DealResult {
  constructor(private readonly details: DealResultDetails) {}

  scored(): TeamPoints {
    return this.details.scored;
  }

  pendingLitige(): Points {
    return this.details.pendingLitige;
  }

  toSnapshot(): DealResultSnapshot {
    return {
      contract: this.details.contract.toSnapshot(),
      outcome: this.details.outcome,
      cardPoints: this.details.cardPoints.toNumbers(),
      beloteTeam: this.details.belote.holderTeamIndex(),
      scored: this.details.scored.toNumbers(),
      pendingLitige: this.details.pendingLitige.toNumber(),
    };
  }
}
