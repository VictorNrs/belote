import { PlayerId } from '../../domain/room/PlayerId';
import { Room } from '../../domain/room/Room';
import { RoomRepository } from '../ports/RoomRepository';
import { NewGameFactory } from '../services/NewGameFactory';
import { RoomSync } from '../services/RoomSync';
import { PlayerCommand, SeatedPlayerUseCase } from './SeatedPlayerUseCase';

export class StartGame extends SeatedPlayerUseCase<PlayerCommand> {
  constructor(
    rooms: RoomRepository,
    roomSync: RoomSync,
    private readonly games: NewGameFactory,
  ) {
    super(rooms, roomSync);
  }

  protected apply(room: Room, playerId: PlayerId): void {
    room.start(playerId, this.games.create);
  }
}
