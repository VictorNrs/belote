import type { Cards } from '../card/Cards';
import type { DealScorer } from '../scoring/DealScorer';
import type { Seat } from './Seat';
import type { Team } from './Team';

/**
 * Configuration d'une table : nombre de joueurs, équipes, paquet utilisé et façon de compter les points.
 * Implémentations : belote à 4 (deux équipes de deux) et belote à 3 (chacun pour soi).
 */
export interface TableFormat {
  playerCount(): number;
  seats(): readonly Seat[];
  seat(index: number): Seat;
  teams(): readonly Team[];
  teamOf(seatIndex: number): Team;
  arePartners(seatIndex: number, otherIndex: number): boolean;
  deck(): Cards;
  scorer(): DealScorer;
}
