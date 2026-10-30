import { Card } from '../card/Card';
import { Bid } from '../bidding/Bid';
import { BotStrategy } from '../bot/BotStrategy';
import { Game } from '../game/Game';
import { GamePhase, GameSnapshot } from '../game/GameSnapshot';
import { DomainError } from '../shared/DomainError';
import { Seat } from '../table/Seat';
import { BotPlayer, HumanPlayer } from './Participant';
import { PlayerId } from './PlayerId';
import { PlayerName } from './PlayerName';
import { RoomCode } from './RoomCode';
import { GameFactory, RoomRules } from './RoomRules';
import { SeatAssignments, SeatSnapshot } from './SeatAssignments';

export type AutomaticStep = 'botTurn' | 'collectTrick' | 'nextDeal';

export interface RoomSnapshot {
  code: string;
  playerCount: number;
  announces: boolean;
  mySeat: number;
  isHost: boolean;
  target: number;
  seats: (SeatSnapshot | null)[];
  game: GameSnapshot | null;
}

const ADVANCING_PHASES: Partial<Record<GamePhase, AutomaticStep>> = { trickComplete: 'collectTrick', dealEnd: 'nextDeal' };

/** Agrégat racine d'une salle : la table, ses occupants, son hôte et la partie en cours. */
export class Room {
  private constructor(
    private readonly code: RoomCode,
    private readonly rules: RoomRules,
    private seats: SeatAssignments,
    private host: PlayerId,
    private game: Game | null,
  ) {}

  static open(code: RoomCode, host: HumanPlayer, rules: RoomRules): Room {
    const seats = SeatAssignments.empty(rules.format).assign(rules.format.seat(0), host);
    return new Room(code, rules, seats, host.playerId(), null);
  }

  seatAt(index: number): Seat {
    return this.rules.format.seat(index);
  }

  join(id: PlayerId, name: PlayerName): void {
    if (this.hasMember(id)) return this.setConnection(id, true);
    this.ensureNoGameInProgress();
    const seat = this.seats.firstFreeSeat();
    if (!seat) throw new DomainError('La table est complète');
    this.seats = this.seats.assign(seat, HumanPlayer.join(id, name));
  }

  setConnection(id: PlayerId, connected: boolean): void {
    this.seats = this.seats.updatePlayer(id, (participant) => participant.withConnection(connected));
  }

  sit(id: PlayerId, seat: Seat): void {
    this.ensureNoGameInProgress();
    if (!this.seats.isFree(seat)) throw new DomainError('Cette place est occupée');
    this.seats = this.seats.moveTo(id, seat);
  }

  addBot(requester: PlayerId, seat: Seat): void {
    this.ensureHost(requester);
    if (!this.seats.acceptsBotAt(seat)) throw new DomainError('Cette place est occupée');
    this.seats = this.seats.assign(seat, BotPlayer.forSeat(seat));
  }

  removeBot(requester: PlayerId, seat: Seat): void {
    this.ensureHost(requester);
    this.ensureNoGameInProgress();
    if (!this.seats.isBotAt(seat)) throw new DomainError("Il n'y a pas de robot à cette place");
    this.seats = this.seats.release(seat);
  }

  start(requester: PlayerId, newGame: GameFactory): void {
    this.ensureHost(requester);
    this.ensureNoGameInProgress();
    if (!this.seats.isFull()) throw new DomainError('Il faut 4 joueurs pour commencer');
    this.game = newGame(this.rules);
  }

  /** En cours de partie, un robot reprend la place du joueur qui s'en va. */
  leave(id: PlayerId): void {
    const seat = this.requireSeat(id);
    this.seats = this.isGameInProgress() ? this.seats.assign(seat, BotPlayer.forSeat(seat)) : this.seats.release(seat);
    this.electNewHostIfLeaving(id);
  }

  bid(id: PlayerId, bid: Bid): void {
    this.requireGame().bid(this.requireSeat(id), bid);
  }

  play(id: PlayerId, card: Card): void {
    this.requireGame().play(this.requireSeat(id), card);
  }

  nextAutomaticStep(): AutomaticStep | null {
    if (!this.game) return null;
    const advancing = ADVANCING_PHASES[this.game.phase()];
    if (advancing) return advancing;
    const actor = this.game.playerToAct();
    return actor && this.seats.isBotAt(actor) ? 'botTurn' : null;
  }

  runAutomaticStep(strategy: BotStrategy): void {
    const step = this.nextAutomaticStep();
    const actor = this.game?.playerToAct();
    if (step === 'botTurn' && actor) return this.requireGame().actAsBot(actor, strategy);
    if (step) this.requireGame().advance();
  }

  hasMember(id: PlayerId): boolean {
    return this.seats.seatOf(id) !== null;
  }

  memberIds(): PlayerId[] {
    return this.seats.humanIds();
  }

  isAbandoned(): boolean {
    return !this.seats.hasConnectedHuman();
  }

  roomCode(): RoomCode {
    return this.code;
  }

  snapshotFor(id: PlayerId): RoomSnapshot {
    const seat = this.requireSeat(id);
    return {
      code: this.code.toString(),
      playerCount: this.rules.format.playerCount(),
      announces: this.rules.announces.isEnabled(),
      mySeat: seat.toIndex(),
      isHost: this.host.equals(id),
      target: this.rules.target.toNumber(),
      seats: this.seats.toSnapshot(this.host),
      game: this.game?.snapshotFor(seat) ?? null,
    };
  }

  private isGameInProgress(): boolean {
    return this.game !== null && !this.game.isOver();
  }

  private ensureNoGameInProgress(): void {
    if (this.isGameInProgress()) throw new DomainError('Une partie est déjà en cours');
  }

  private ensureHost(id: PlayerId): void {
    if (!this.host.equals(id)) throw new DomainError("Seul l'hôte de la salle peut faire cela");
  }

  private electNewHostIfLeaving(id: PlayerId): void {
    const successor = this.seats.humanIds()[0];
    if (this.host.equals(id) && successor) this.host = successor;
  }

  private requireSeat(id: PlayerId): Seat {
    const seat = this.seats.seatOf(id);
    if (!seat) throw new DomainError("Vous n'êtes pas assis à cette table");
    return seat;
  }

  private requireGame(): Game {
    if (!this.game) throw new DomainError("La partie n'a pas commencé");
    return this.game;
  }
}
