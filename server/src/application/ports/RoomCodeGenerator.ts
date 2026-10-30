import { RoomCode } from '../../domain/room/RoomCode';

export interface RoomCodeGenerator {
  generate(): RoomCode;
}
