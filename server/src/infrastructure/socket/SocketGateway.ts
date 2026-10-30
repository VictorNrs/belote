import { BeloteUseCases } from '../../application/BeloteUseCases';
import { PlayerId } from '../../domain/room/PlayerId';
import { BeloteServer, BeloteSocket, playerChannel } from './BeloteServer';
import { respond } from './respond';

/** Adaptateur entrant : traduit les événements Socket.io en appels de cas d'usage. */
export class SocketGateway {
  constructor(
    private readonly io: BeloteServer,
    private readonly useCases: BeloteUseCases,
  ) {}

  listen(): void {
    this.io.use((socket, next) => this.authenticate(socket, next));
    this.io.on('connection', (socket) => this.onConnection(socket));
  }

  private authenticate(socket: BeloteSocket, next: (error?: Error) => void): void {
    const playerId = String(socket.handshake.auth?.playerId ?? '');
    respond(
      (result) => next(result.ok ? undefined : new Error(result.error)),
      () => {
        socket.data.playerId = PlayerId.of(playerId).toString();
      },
    );
  }

  private onConnection(socket: BeloteSocket): void {
    const playerId = socket.data.playerId;
    socket.join(playerChannel(playerId));
    this.registerRoomEvents(socket, playerId);
    this.registerGameEvents(socket, playerId);
    socket.on('disconnect', () => this.onDisconnect(playerId));
    respond(undefined, () => this.useCases.connect.execute({ playerId }));
  }

  private registerRoomEvents(socket: BeloteSocket, playerId: string): void {
    const { createRoom, joinRoom, takeSeat, addBot, removeBot, startGame, leaveRoom } = this.useCases;
    socket.on('room:create', (payload, ack) => respond(ack, () => createRoom.execute({ ...payload, playerId })));
    socket.on('room:join', (payload, ack) => respond(ack, () => joinRoom.execute({ ...payload, playerId })));
    socket.on('room:sit', (payload, ack) => respond(ack, () => takeSeat.execute({ ...payload, playerId })));
    socket.on('room:addBot', (payload, ack) => respond(ack, () => addBot.execute({ ...payload, playerId })));
    socket.on('room:removeBot', (payload, ack) => respond(ack, () => removeBot.execute({ ...payload, playerId })));
    socket.on('room:start', (ack) => respond(ack, () => startGame.execute({ playerId })));
    socket.on('room:leave', (ack) => respond(ack, () => leaveRoom.execute({ playerId })));
  }

  private registerGameEvents(socket: BeloteSocket, playerId: string): void {
    const { placeBid, playCard } = this.useCases;
    socket.on('game:bid', (payload, ack) => respond(ack, () => placeBid.execute({ ...payload, playerId })));
    socket.on('game:play', (payload, ack) => respond(ack, () => playCard.execute({ ...payload, playerId })));
  }

  /** Le joueur n'est marqué déconnecté que lorsque sa dernière connexion (onglet) se ferme. */
  private onDisconnect(playerId: string): void {
    const remaining = this.io.sockets.adapter.rooms.get(playerChannel(playerId))?.size ?? 0;
    if (remaining > 0) return;
    respond(undefined, () => this.useCases.disconnect.execute({ playerId }));
  }
}
