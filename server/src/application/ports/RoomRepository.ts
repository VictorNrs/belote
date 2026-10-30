import { PlayerId } from '../../domain/room/PlayerId';
import { Room } from '../../domain/room/Room';
import { RoomCode } from '../../domain/room/RoomCode';

export interface RoomRepository {
  save(room: Room): void;
  findByCode(code: RoomCode): Room | null;
  findByPlayer(id: PlayerId): Room | null;
  delete(code: RoomCode): void;
}
