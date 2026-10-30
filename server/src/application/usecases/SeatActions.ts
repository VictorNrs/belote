import { PlayerId } from '../../domain/room/PlayerId';
import { Room } from '../../domain/room/Room';
import { Seat } from '../../domain/table/Seat';
import { PlayerCommand, SeatedPlayerUseCase } from './SeatedPlayerUseCase';

export interface SeatCommand extends PlayerCommand {
  seat: number;
}

export class TakeSeat extends SeatedPlayerUseCase<SeatCommand> {
  protected apply(room: Room, playerId: PlayerId, command: SeatCommand): void {
    room.sit(playerId, Seat.of(command.seat));
  }
}

export class AddBot extends SeatedPlayerUseCase<SeatCommand> {
  protected apply(room: Room, playerId: PlayerId, command: SeatCommand): void {
    room.addBot(playerId, Seat.of(command.seat));
  }
}

export class RemoveBot extends SeatedPlayerUseCase<SeatCommand> {
  protected apply(room: Room, playerId: PlayerId, command: SeatCommand): void {
    room.removeBot(playerId, Seat.of(command.seat));
  }
}
