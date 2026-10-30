/**
 * Contrat d'échange entre le client et le serveur (Socket.io).
 * Les cartes sont encodées « rang + couleur » : "JH" = valet de cœur, "10S" = dix de pique.
 */
export type SuitCode = 'S' | 'H' | 'D' | 'C';
export type RankCode = '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
export type CardCode = string;
export type SeatIndex = 0 | 1 | 2 | 3;
export type PlayerCount = 3 | 4;

export type GamePhase = 'bidding' | 'playing' | 'trickComplete' | 'dealEnd' | 'gameOver';
export type DealOutcome = 'made' | 'failed' | 'capot' | 'capotAgainst' | 'litige';

export interface PlayedCardView {
  seat: number;
  card: CardCode;
}

export interface ContractView {
  taker: number;
  trump: SuitCode;
}

export interface TrickView {
  cards: PlayedCardView[];
  winner: number;
}

export interface AnnounceView {
  seat: number;
  label: string;
  points: number;
}

export interface DealResultView {
  contract: ContractView;
  outcome: DealOutcome;
  cardPoints: number[];
  beloteTeam: number | null;
  announcePoints: number[];
  announces: AnnounceView[];
  scored: number[];
  pendingLitige: number;
}

export interface AnnouncementView {
  id: number;
  seat: number | null;
  text: string;
}

export interface GameView {
  phase: GamePhase;
  dealer: number;
  turn: number | null;
  hand: CardCode[];
  legalCards: CardCode[];
  handSizes: number[];
  proposedCard: CardCode | null;
  biddingRound: number | null;
  passedSeats: number[];
  contract: ContractView | null;
  trick: PlayedCardView[];
  /** Gagnant du pli quand les quatre (ou trois) cartes sont posées, pour l'animation du ramassage. */
  trickWinner: number | null;
  lastTrick: TrickView | null;
  tricksWon: number[];
  scores: number[];
  target: number;
  pendingLitige: number;
  lastResult: DealResultView | null;
  winner: number | null;
  announcement: AnnouncementView | null;
}

export interface SeatView {
  name: string;
  isBot: boolean;
  isHost: boolean;
  connected: boolean;
}

export interface RoomView {
  code: string;
  playerCount: number;
  announces: boolean;
  mySeat: number;
  isHost: boolean;
  target: number;
  seats: (SeatView | null)[];
  game: GameView | null;
}

export type AckResult<T = void> = { ok: true; data: T } | { ok: false; error: string };
export type Ack<T = void> = (result: AckResult<T>) => void;

export interface CreateRoomPayload {
  name: string;
  target: number;
  players: PlayerCount;
  announces: boolean;
  withBots: boolean;
}

export interface JoinRoomPayload {
  code: string;
  name: string;
}

export interface BidPayload {
  take: boolean;
  suit: SuitCode | null;
}

export interface ClientToServerEvents {
  'room:create': (payload: CreateRoomPayload, ack: Ack<string>) => void;
  'room:join': (payload: JoinRoomPayload, ack: Ack) => void;
  'room:sit': (payload: { seat: number }, ack: Ack) => void;
  'room:addBot': (payload: { seat: number }, ack: Ack) => void;
  'room:removeBot': (payload: { seat: number }, ack: Ack) => void;
  'room:start': (ack: Ack) => void;
  'room:leave': (ack: Ack) => void;
  'game:bid': (payload: BidPayload, ack: Ack) => void;
  'game:play': (payload: { card: CardCode }, ack: Ack) => void;
}

export interface ServerToClientEvents {
  'room:state': (view: RoomView) => void;
}

export interface HandshakeAuth {
  playerId: string;
}

export const GAME_TARGETS = [500, 1000, 1500] as const;
export const PLAYER_COUNTS: readonly PlayerCount[] = [4, 3];
