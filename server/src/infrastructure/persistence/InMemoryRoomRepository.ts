import { RoomRepository } from '../../application/ports/RoomRepository';
import { PlayerId } from '../../domain/room/PlayerId';
import { Room } from '../../domain/room/Room';
import { RoomCode } from '../../domain/room/RoomCode';

export class InMemoryRoomRepository implements RoomRepository {
  private readonly rooms = new Map<string, Room>();

  save(room: Room): void {
    this.rooms.set(room.roomCode().toString(), room);
  }

  findByCode(code: RoomCode): Room | null {
    return this.rooms.get(code.toString()) ?? null;
  }

  findByPlayer(id: PlayerId): Room | null {
    return [...this.rooms.values()].find((room) => room.hasMember(id)) ?? null;
  }

  delete(code: RoomCode): void {
    this.rooms.delete(code.toString());
  }
}
