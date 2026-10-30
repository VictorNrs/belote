import { Points } from '../card/Points';
import { Contract } from '../bidding/Contract';
import { CollectedTricks } from '../play/CollectedTricks';
import { DealBonuses } from '../play/DealBonuses';
import { Team } from '../table/Team';
import { TeamPoints } from '../table/TeamPoints';
import { DealScorer } from './DealScorer';
import { DealOutcome, DealResult } from './DealResult';

const CONTRACT_THRESHOLD = new Points(82);
const DEFENDER_SHARE = new Points(81);
const CAPOT_TOTAL = new Points(252);

/**
 * Comptage de la belote à 3 (chacun pour soi) :
 * - contrat rempli si le preneur fait au moins 82 points (belote et annonces comprises) : chacun marque ses points ;
 * - dedans : chaque adversaire marque 81 points plus ses annonces, le preneur perd les siennes ;
 * - capot du preneur : 252 points.
 * La belote reste toujours acquise au joueur qui l'a annoncée.
 */
export class SoloDealScorer implements DealScorer {
  constructor(private readonly players: readonly Team[]) {}

  score(contract: Contract, tricks: CollectedTricks, bonuses: DealBonuses, pendingLitige: Points): DealResult {
    const { outcome, scored } = this.verdict(contract, tricks, bonuses);
    const announcePoints = bonuses.announcePoints(this.players);
    return new DealResult({ contract, outcome, cardPoints: tricks.cardPoints(), bonuses, announcePoints, scored, pendingLitige });
  }

  private verdict(contract: Contract, tricks: CollectedTricks, bonuses: DealBonuses): { outcome: DealOutcome; scored: TeamPoints } {
    const taker = contract.takingTeam();
    const extras = bonuses.totals(this.players);
    if (tricks.sweepingTeam()?.equals(taker)) return { outcome: 'capot', scored: this.zero().add(taker, CAPOT_TOTAL).plus(extras) };
    const totals = tricks.cardPoints().plus(extras);
    if (totals.of(taker).isAtLeast(CONTRACT_THRESHOLD)) return { outcome: 'made', scored: totals };
    return { outcome: 'failed', scored: this.failed(taker, bonuses) };
  }

  private failed(taker: Team, bonuses: DealBonuses): TeamPoints {
    const defenders = this.players.filter((player) => !player.equals(taker));
    const shares = defenders.reduce((scored, defender) => scored.add(defender, DEFENDER_SHARE), this.zero());
    return shares.plus(bonuses.beloteBonuses(this.players)).plus(bonuses.announcePoints(this.players).without(taker));
  }

  private zero(): TeamPoints {
    return TeamPoints.zero(this.players);
  }
}
