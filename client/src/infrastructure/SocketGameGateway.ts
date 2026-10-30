import {
  AckResult,
  BidPayload,
  CardCode,
  ClientToServerEvents,
  CreateRoomPayload,
  JoinRoomPayload,
  RoomView,
  ServerToClientEvents,
} from '@belote/shared';
import { io, Socket } from 'socket.io-client';
import { GameGateway } from '../application/GameGateway';

type BeloteSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

function unwrap<T>(result: AckResult<T>): T {
  if (!result.ok) throw new Error(result.error);
  return result.data;
}

/** Adaptateur Socket.io du port GameGateway. */
export class SocketGameGateway implements GameGateway {
  private readonly socket: BeloteSocket;

  constructor(playerId: string, url?: string) {
    const options = { auth: { playerId }, transports: ['websocket', 'polling'] };
    this.socket = url ? io(url, options) : io(options);
  }

  onRoomState(listener: (room: RoomView) => void): () => void {
    this.socket.on('room:state', listener);
    return () => this.socket.off('room:state', listener);
  }

  onConnectionChange(listener: (connected: boolean) => void): () => void {
    const onConnect = () => listener(true);
    const onDisconnect = () => listener(false);
    this.socket.on('connect', onConnect);
    this.socket.on('disconnect', onDisconnect);
    listener(this.socket.connected);
    return () => {
      this.socket.off('connect', onConnect);
      this.socket.off('disconnect', onDisconnect);
    };
  }

  async createRoom(payload: CreateRoomPayload): Promise<string> {
    return unwrap(await this.socket.emitWithAck('room:create', payload));
  }

  async joinRoom(payload: JoinRoomPayload): Promise<void> {
    return unwrap(await this.socket.emitWithAck('room:join', payload));
  }

  async sit(seat: number): Promise<void> {
    return unwrap(await this.socket.emitWithAck('room:sit', { seat }));
  }

  async addBot(seat: number): Promise<void> {
    return unwrap(await this.socket.emitWithAck('room:addBot', { seat }));
  }

  async removeBot(seat: number): Promise<void> {
    return unwrap(await this.socket.emitWithAck('room:removeBot', { seat }));
  }

  async start(): Promise<void> {
    return unwrap(await this.socket.emitWithAck('room:start'));
  }

  async leave(): Promise<void> {
    return unwrap(await this.socket.emitWithAck('room:leave'));
  }

  async bid(payload: BidPayload): Promise<void> {
    return unwrap(await this.socket.emitWithAck('game:bid', payload));
  }

  async play(card: CardCode): Promise<void> {
    return unwrap(await this.socket.emitWithAck('game:play', { card }));
  }
}
