import { Points } from '../card/Points';
import { Contract } from '../bidding/Contract';
import { Belote } from '../play/Belote';
import { CollectedTricks } from '../play/CollectedTricks';
import { Team } from '../table/Team';
import { TeamPoints } from '../table/TeamPoints';
import { DealOutcome, DealResult } from './DealResult';

const DEAL_TOTAL = new Points(162);
const CAPOT_TOTAL = new Points(252);

interface Verdict {
  outcome: DealOutcome;
  scored: TeamPoints;
  heldInLitige: Points;
}

/**
 * Comptage d'une donne :
 * - contrat rempli : chaque équipe marque ses points ;
 * - dedans : la défense marque 162 ;
 * - capot : 252 pour l'équipe qui a fait tous les plis ;
 * - litige (égalité) : les points du preneur sont mis en réserve pour la donne suivante.
 * La belote reste toujours acquise à l'équipe qui l'a annoncée.
 */
export class DealScorer {
  score(contract: Contract, tricks: CollectedTricks, belote: Belote, pendingLitige: Points): DealResult {
    const verdict = this.verdict(contract, tricks, belote);
    const settled = this.settleLitige(verdict, pendingLitige);
    return new DealResult({ contract, outcome: verdict.outcome, cardPoints: tricks.cardPoints(), belote, ...settled });
  }

  private verdict(contract: Contract, tricks: CollectedTricks, belote: Belote): Verdict {
    const sweepingTeam = tricks.sweepingTeam();
    if (sweepingTeam) return this.capot(contract, sweepingTeam, belote);
    const totals = tricks.cardPoints().plus(belote.bonuses());
    const leader = totals.leader();
    if (!leader) return this.litige(contract, totals);
    if (leader.equals(contract.takingTeam())) return { outcome: 'made', scored: totals, heldInLitige: Points.ZERO };
    const scored = TeamPoints.forTeam(contract.defendingTeam(), DEAL_TOTAL).plus(belote.bonuses());
    return { outcome: 'failed', scored, heldInLitige: Points.ZERO };
  }

  private capot(contract: Contract, sweepingTeam: Team, belote: Belote): Verdict {
    const outcome = sweepingTeam.equals(contract.takingTeam()) ? 'capot' : 'capotAgainst';
    const scored = TeamPoints.forTeam(sweepingTeam, CAPOT_TOTAL).plus(belote.bonuses());
    return { outcome, scored, heldInLitige: Points.ZERO };
  }

  private litige(contract: Contract, totals: TeamPoints): Verdict {
    const defending = contract.defendingTeam();
    const scored = TeamPoints.forTeam(defending, totals.of(defending));
    return { outcome: 'litige', scored, heldInLitige: totals.of(contract.takingTeam()) };
  }

  private settleLitige(verdict: Verdict, pending: Points): { scored: TeamPoints; pendingLitige: Points } {
    if (verdict.outcome === 'litige') return { scored: verdict.scored, pendingLitige: pending.plus(verdict.heldInLitige) };
    const winner = verdict.scored.leader();
    if (!winner) return { scored: verdict.scored, pendingLitige: pending };
    return { scored: verdict.scored.add(winner, pending), pendingLitige: Points.ZERO };
  }
}
