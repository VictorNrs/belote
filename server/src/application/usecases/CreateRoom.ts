import { GAME_TARGETS } from '@belote/shared';
import { Points } from '../../domain/card/Points';
import { TableFormats } from '../../domain/format/TableFormats';
import { HumanPlayer } from '../../domain/room/Participant';
import { PlayerId } from '../../domain/room/PlayerId';
import { PlayerName } from '../../domain/room/PlayerName';
import { Room, RoomRules } from '../../domain/room/Room';
import { RoomCode } from '../../domain/room/RoomCode';
import { ApplicationError } from '../ApplicationError';
import { RoomCodeGenerator } from '../ports/RoomCodeGenerator';
import { RoomRepository } from '../ports/RoomRepository';
import { NewGameFactory } from '../services/NewGameFactory';
import { RoomSync } from '../services/RoomSync';
import { LeaveRoom } from './LeaveRoom';
import { PlayerCommand } from './SeatedPlayerUseCase';

export interface CreateRoomCommand extends PlayerCommand {
  name: string;
  target: number;
  players: number;
  withBots: boolean;
}

const MAX_CODE_ATTEMPTS = 50;

export class CreateRoom {
  constructor(
    private readonly rooms: RoomRepository,
    private readonly codes: RoomCodeGenerator,
    private readonly leaveRoom: LeaveRoom,
    private readonly games: NewGameFactory,
    private readonly roomSync: RoomSync,
  ) {}

  /** @returns le code de la salle créée */
  execute(command: CreateRoomCommand): string {
    const playerId = PlayerId.of(command.playerId);
    const host = HumanPlayer.join(playerId, PlayerName.of(command.name));
    const room = Room.open(this.uniqueCode(), host, this.rulesFrom(command));
    this.leaveRoom.leaveIfSeated(playerId);
    if (command.withBots) this.fillWithBotsAndStart(room, playerId, command.players);
    this.roomSync.sync(room);
    return room.roomCode().toString();
  }

  private fillWithBotsAndStart(room: Room, host: PlayerId, players: number): void {
    Array.from({ length: players - 1 }, (_, offset) => room.seatAt(offset + 1)).forEach((seat) => room.addBot(host, seat));
    room.start(host, this.games.create);
  }

  private uniqueCode(): RoomCode {
    const candidates = Array.from({ length: MAX_CODE_ATTEMPTS }, () => this.codes.generate());
    const code = candidates.find((candidate) => !this.rooms.findByCode(candidate));
    if (!code) throw new ApplicationError('Impossible de créer une salle pour le moment');
    return code;
  }

  private rulesFrom(command: CreateRoomCommand): RoomRules {
    if (!(GAME_TARGETS as readonly number[]).includes(command.target)) throw new ApplicationError('Objectif de points invalide');
    return { target: new Points(command.target), format: TableFormats.forPlayerCount(command.players) };
  }
}
