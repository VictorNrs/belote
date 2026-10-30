import { Points } from '../card/Points';
import { Contract } from '../bidding/Contract';
import { Belote } from '../play/Belote';
import { CollectedTricks } from '../play/CollectedTricks';
import { Team } from '../table/Team';
import { TeamPoints } from '../table/TeamPoints';
import { DealScorer } from './DealScorer';
import { DealOutcome, DealResult } from './DealResult';

const CONTRACT_THRESHOLD = new Points(82);
const DEFENDER_SHARE = new Points(81);
const CAPOT_TOTAL = new Points(252);

/**
 * Comptage de la belote à 3 (chacun pour soi) :
 * - contrat rempli si le preneur fait au moins 82 points (belote comprise) : chacun marque ses points ;
 * - dedans : chaque adversaire marque 81 points, le preneur rien ;
 * - capot du preneur : 252 points.
 * La belote reste toujours acquise au joueur qui l'a annoncée.
 */
export class SoloDealScorer implements DealScorer {
  constructor(private readonly players: readonly Team[]) {}

  score(contract: Contract, tricks: CollectedTricks, belote: Belote, pendingLitige: Points): DealResult {
    const bonuses = belote.bonuses(this.players);
    const { outcome, scored } = this.verdict(contract, tricks, bonuses);
    return new DealResult({ contract, outcome, cardPoints: tricks.cardPoints(), belote, scored, pendingLitige });
  }

  private verdict(contract: Contract, tricks: CollectedTricks, bonuses: TeamPoints): { outcome: DealOutcome; scored: TeamPoints } {
    const taker = contract.takingTeam();
    if (tricks.sweepingTeam()?.equals(taker)) return { outcome: 'capot', scored: this.zero().add(taker, CAPOT_TOTAL).plus(bonuses) };
    const totals = tricks.cardPoints().plus(bonuses);
    if (totals.of(taker).isAtLeast(CONTRACT_THRESHOLD)) return { outcome: 'made', scored: totals };
    return { outcome: 'failed', scored: this.defendersShare(taker).plus(bonuses) };
  }

  private defendersShare(taker: Team): TeamPoints {
    const defenders = this.players.filter((player) => !player.equals(taker));
    return defenders.reduce((scored, defender) => scored.add(defender, DEFENDER_SHARE), this.zero());
  }

  private zero(): TeamPoints {
    return TeamPoints.zero(this.players);
  }
}
