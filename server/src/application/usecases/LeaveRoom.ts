import { PlayerId } from '../../domain/room/PlayerId';
import { RoomRepository } from '../ports/RoomRepository';
import { RoomSync } from '../services/RoomSync';
import { PlayerCommand } from './SeatedPlayerUseCase';

export class LeaveRoom {
  constructor(
    private readonly rooms: RoomRepository,
    private readonly roomSync: RoomSync,
  ) {}

  execute(command: PlayerCommand): void {
    this.leaveIfSeated(PlayerId.of(command.playerId));
  }

  leaveIfSeated(playerId: PlayerId): void {
    const room = this.rooms.findByPlayer(playerId);
    if (!room) return;
    room.leave(playerId);
    this.roomSync.sync(room);
  }
}
