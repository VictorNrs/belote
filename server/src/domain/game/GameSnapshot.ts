import { ContractSnapshot } from '../bidding/Contract';
import { PlayedCardSnapshot } from '../play/PlayedCard';
import { TrickSnapshot } from '../play/TrickHistory';
import { DealResultSnapshot } from '../scoring/DealResult';

export type GamePhase = 'bidding' | 'playing' | 'trickComplete' | 'dealEnd' | 'gameOver';

export interface AnnouncementSnapshot {
  id: number;
  seat: number | null;
  text: string;
}

/** Ce qu'un joueur voit de la partie depuis sa place (sans les mains adverses). */
export interface GameSnapshot {
  phase: GamePhase;
  dealer: number;
  turn: number | null;
  hand: string[];
  legalCards: string[];
  handSizes: number[];
  proposedCard: string | null;
  biddingRound: number | null;
  passedSeats: number[];
  contract: ContractSnapshot | null;
  trick: PlayedCardSnapshot[];
  lastTrick: TrickSnapshot | null;
  tricksWon: number[];
  scores: number[];
  target: number;
  pendingLitige: number;
  lastResult: DealResultSnapshot | null;
  winner: number | null;
  announcement: AnnouncementSnapshot | null;
}

export type DealSnapshotDefaults = Omit<
  GameSnapshot,
  'phase' | 'dealer' | 'handSizes' | 'tricksWon' | 'scores' | 'target' | 'pendingLitige' | 'announcement'
>;

export const NO_DEAL_DETAILS: DealSnapshotDefaults = {
  turn: null,
  hand: [],
  legalCards: [],
  proposedCard: null,
  biddingRound: null,
  passedSeats: [],
  contract: null,
  trick: [],
  lastTrick: null,
  lastResult: null,
  winner: null,
};
