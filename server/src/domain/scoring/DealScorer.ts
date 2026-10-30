import type { Points } from '../card/Points';
import type { Contract } from '../bidding/Contract';
import type { Belote } from '../play/Belote';
import type { CollectedTricks } from '../play/CollectedTricks';
import type { DealResult } from './DealResult';

/** Comptage des points d'une donne, propre à chaque format de table. */
export interface DealScorer {
  score(contract: Contract, tricks: CollectedTricks, belote: Belote, pendingLitige: Points): DealResult;
}
