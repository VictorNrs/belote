import { PlayerId } from '../../domain/room/PlayerId';
import { PlayerName } from '../../domain/room/PlayerName';
import { RoomCode } from '../../domain/room/RoomCode';
import { ApplicationError } from '../ApplicationError';
import { RoomRepository } from '../ports/RoomRepository';
import { RoomSync } from '../services/RoomSync';
import { LeaveRoom } from './LeaveRoom';
import { PlayerCommand } from './SeatedPlayerUseCase';

export interface JoinRoomCommand extends PlayerCommand {
  code: string;
  name: string;
}

export class JoinRoom {
  constructor(
    private readonly rooms: RoomRepository,
    private readonly leaveRoom: LeaveRoom,
    private readonly roomSync: RoomSync,
  ) {}

  execute(command: JoinRoomCommand): void {
    const playerId = PlayerId.of(command.playerId);
    const room = this.rooms.findByCode(RoomCode.of(command.code));
    if (!room) throw new ApplicationError("Cette salle n'existe pas");
    if (!room.hasMember(playerId)) this.leaveRoom.leaveIfSeated(playerId);
    room.join(playerId, PlayerName.of(command.name));
    this.roomSync.sync(room);
  }
}
