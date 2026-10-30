import { BidPayload, CardCode, CreateRoomPayload, JoinRoomPayload, RoomView } from '@belote/shared';

type Unsubscribe = () => void;

/** Port de communication avec le serveur de jeu ; l'UI ne connaît que cette interface. */
export interface GameGateway {
  onRoomState(listener: (room: RoomView) => void): Unsubscribe;
  onConnectionChange(listener: (connected: boolean) => void): Unsubscribe;
  createRoom(payload: CreateRoomPayload): Promise<string>;
  joinRoom(payload: JoinRoomPayload): Promise<void>;
  sit(seat: number): Promise<void>;
  addBot(seat: number): Promise<void>;
  removeBot(seat: number): Promise<void>;
  start(): Promise<void>;
  leave(): Promise<void>;
  bid(payload: BidPayload): Promise<void>;
  play(card: CardCode): Promise<void>;
}
