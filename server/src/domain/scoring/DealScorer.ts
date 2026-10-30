import type { Points } from '../card/Points';
import type { Contract } from '../bidding/Contract';
import type { CollectedTricks } from '../play/CollectedTricks';
import type { DealBonuses } from '../play/DealBonuses';
import type { DealResult } from './DealResult';

/** Comptage des points d'une donne, propre à chaque format de table. */
export interface DealScorer {
  score(contract: Contract, tricks: CollectedTricks, bonuses: DealBonuses, pendingLitige: Points): DealResult;
}
