import { PlayerId } from '../../domain/room/PlayerId';
import { RoomRepository } from '../ports/RoomRepository';
import { RoomSync } from '../services/RoomSync';
import { PlayerCommand } from './SeatedPlayerUseCase';

/** Signale l'arrivée ou le départ réseau d'un joueur (rechargement de page, perte de connexion...). */
export class UpdateConnection {
  constructor(
    private readonly rooms: RoomRepository,
    private readonly roomSync: RoomSync,
    private readonly connected: boolean,
  ) {}

  execute(command: PlayerCommand): void {
    const playerId = PlayerId.of(command.playerId);
    const room = this.rooms.findByPlayer(playerId);
    if (!room) return;
    room.setConnection(playerId, this.connected);
    this.roomSync.sync(room);
  }
}
