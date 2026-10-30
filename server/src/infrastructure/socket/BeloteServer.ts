import { ClientToServerEvents, ServerToClientEvents } from '@belote/shared';
import { Server, Socket } from 'socket.io';

export interface SocketData {
  playerId: string;
}

export type BeloteServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
export type BeloteSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

export const playerChannel = (playerId: string): string => `player:${playerId}`;
