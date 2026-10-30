import { Shuffler } from '../domain/card/Shuffler';
import { BotStrategy } from '../domain/bot/BotStrategy';
import { RoomCodeGenerator } from './ports/RoomCodeGenerator';
import { RoomPublisher } from './ports/RoomPublisher';
import { RoomRepository } from './ports/RoomRepository';
import { TaskScheduler } from './ports/TaskScheduler';
import { NewGameFactory } from './services/NewGameFactory';
import { AutomationDelays, RoomSync } from './services/RoomSync';
import { UpdateConnection } from './usecases/ConnectionActions';
import { CreateRoom } from './usecases/CreateRoom';
import { PlaceBid, PlayCard } from './usecases/GameActions';
import { JoinRoom } from './usecases/JoinRoom';
import { LeaveRoom } from './usecases/LeaveRoom';
import { AddBot, RemoveBot, TakeSeat } from './usecases/SeatActions';
import { StartGame } from './usecases/StartGame';

export interface BeloteDependencies {
  rooms: RoomRepository;
  publisher: RoomPublisher;
  scheduler: TaskScheduler;
  codes: RoomCodeGenerator;
  shuffler: Shuffler;
  bot: BotStrategy;
  delays: AutomationDelays;
}

export interface BeloteUseCases {
  createRoom: CreateRoom;
  joinRoom: JoinRoom;
  leaveRoom: LeaveRoom;
  takeSeat: TakeSeat;
  addBot: AddBot;
  removeBot: RemoveBot;
  startGame: StartGame;
  placeBid: PlaceBid;
  playCard: PlayCard;
  connect: UpdateConnection;
  disconnect: UpdateConnection;
}

export function createUseCases(deps: BeloteDependencies): BeloteUseCases {
  const roomSync = new RoomSync(deps.rooms, deps.publisher, deps.scheduler, deps.bot, deps.delays);
  const games = new NewGameFactory(deps.shuffler);
  const leaveRoom = new LeaveRoom(deps.rooms, roomSync);
  return {
    createRoom: new CreateRoom(deps.rooms, deps.codes, leaveRoom, games, roomSync),
    joinRoom: new JoinRoom(deps.rooms, leaveRoom, roomSync),
    leaveRoom,
    takeSeat: new TakeSeat(deps.rooms, roomSync),
    addBot: new AddBot(deps.rooms, roomSync),
    removeBot: new RemoveBot(deps.rooms, roomSync),
    startGame: new StartGame(deps.rooms, roomSync, games),
    placeBid: new PlaceBid(deps.rooms, roomSync),
    playCard: new PlayCard(deps.rooms, roomSync),
    connect: new UpdateConnection(deps.rooms, roomSync, true),
    disconnect: new UpdateConnection(deps.rooms, roomSync, false),
  };
}
