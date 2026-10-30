import { RoomView } from '@belote/shared';
import { RoomPublisher } from '../../application/ports/RoomPublisher';
import { PlayerId } from '../../domain/room/PlayerId';
import { BeloteServer, playerChannel } from './BeloteServer';

/** Chaque joueur écoute sur son propre canal : toutes ses connexions (onglets) reçoivent sa vue. */
export class SocketRoomPublisher implements RoomPublisher {
  constructor(private readonly io: BeloteServer) {}

  publish(playerId: PlayerId, view: RoomView): void {
    this.io.to(playerChannel(playerId.toString())).emit('room:state', view);
  }
}
