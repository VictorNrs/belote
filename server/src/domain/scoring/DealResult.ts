import { AnnounceSnapshot } from '../announce/Announce';
import { Points } from '../card/Points';
import { Contract, ContractSnapshot } from '../bidding/Contract';
import { DealBonuses } from '../play/DealBonuses';
import { TeamPoints } from '../table/TeamPoints';

export type DealOutcome = 'made' | 'failed' | 'capot' | 'capotAgainst' | 'litige';

export interface DealResultSnapshot {
  contract: ContractSnapshot;
  outcome: DealOutcome;
  cardPoints: number[];
  beloteTeam: number | null;
  announcePoints: number[];
  announces: AnnounceSnapshot[];
  scored: number[];
  pendingLitige: number;
}

export interface DealResultDetails {
  contract: Contract;
  outcome: DealOutcome;
  cardPoints: TeamPoints;
  bonuses: DealBonuses;
  announcePoints: TeamPoints;
  scored: TeamPoints;
  pendingLitige: Points;
}

/** Bilan d'une donne : points faits aux cartes, bonus, et points marqués au tableau. */
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
      beloteTeam: this.details.bonuses.beloteTeamIndex(),
      announcePoints: this.details.announcePoints.toNumbers(),
      announces: this.details.bonuses.announcesSnapshot(),
      scored: this.details.scored.toNumbers(),
      pendingLitige: this.details.pendingLitige.toNumber(),
    };
  }
}
