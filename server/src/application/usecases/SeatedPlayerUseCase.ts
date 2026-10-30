import { PlayerId } from '../../domain/room/PlayerId';
import { Room } from '../../domain/room/Room';
import { ApplicationError } from '../ApplicationError';
import { RoomRepository } from '../ports/RoomRepository';
import { RoomSync } from '../services/RoomSync';

export interface PlayerCommand {
  playerId: string;
}

/** Gabarit des actions d'un joueur déjà assis : retrouver sa salle, agir, synchroniser. */
export abstract class SeatedPlayerUseCase<C extends PlayerCommand> {
  constructor(
    protected readonly rooms: RoomRepository,
    protected readonly roomSync: RoomSync,
  ) {}

  execute(command: C): void {
    const playerId = PlayerId.of(command.playerId);
    const room = this.rooms.findByPlayer(playerId);
    if (!room) throw new ApplicationError("Vous n'êtes dans aucune salle");
    this.apply(room, playerId, command);
    this.roomSync.sync(room);
  }

  protected abstract apply(room: Room, playerId: PlayerId, command: C): void;
}
