import { BidPayload, CardCode, RoomView } from '@belote/shared';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useServices } from './GameContext';

export interface RoomActions {
  createRoom(target: number, withBots: boolean): Promise<void>;
  joinRoom(code: string): Promise<void>;
  sit(seat: number): Promise<void>;
  addBot(seat: number): Promise<void>;
  removeBot(seat: number): Promise<void>;
  start(): Promise<void>;
  leave(): Promise<void>;
  bid(payload: BidPayload): Promise<void>;
  play(card: CardCode): Promise<void>;
}

export interface RoomSession {
  room: RoomView | null;
  connected: boolean;
  error: string | null;
  clearError(): void;
  actions: RoomActions;
}

const messageOf = (error: unknown): string => (error instanceof Error ? error.message : String(error));

/** État de la salle courante, synchronisé avec le serveur, et actions disponibles. */
export function useRoom(): RoomSession {
  const { gateway, profile } = useServices();
  const [room, setRoom] = useState<RoomView | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => gateway.onRoomState(setRoom), [gateway]);
  useEffect(() => gateway.onConnectionChange(setConnected), [gateway]);

  const run = useCallback(async (action: () => Promise<unknown>) => {
    setError(null);
    await action().catch((failure: unknown) => setError(messageOf(failure)));
  }, []);

  const actions = useMemo<RoomActions>(
    () => ({
      createRoom: (target, withBots) => run(() => gateway.createRoom({ name: profile.name(), target, withBots })),
      joinRoom: (code) => run(() => gateway.joinRoom({ code, name: profile.name() })),
      sit: (seat) => run(() => gateway.sit(seat)),
      addBot: (seat) => run(() => gateway.addBot(seat)),
      removeBot: (seat) => run(() => gateway.removeBot(seat)),
      start: () => run(() => gateway.start()),
      leave: () => run(() => gateway.leave().then(() => setRoom(null))),
      bid: (payload) => run(() => gateway.bid(payload)),
      play: (card) => run(() => gateway.play(card)),
    }),
    [gateway, profile, run],
  );

  return { room, connected, error, clearError: () => setError(null), actions };
}
