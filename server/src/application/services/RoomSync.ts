import { RoomView } from '@belote/shared';
import { BotStrategy } from '../../domain/bot/BotStrategy';
import { AutomaticStep, Room, RoomSnapshot } from '../../domain/room/Room';
import { RoomCode } from '../../domain/room/RoomCode';
import { RoomPublisher } from '../ports/RoomPublisher';
import { RoomRepository } from '../ports/RoomRepository';
import { TaskScheduler } from '../ports/TaskScheduler';

export type AutomationDelays = Record<AutomaticStep | 'abandonedRoom', number>;

/**
 * Après chaque changement d'une salle : la sauvegarde, envoie à chaque joueur sa vue,
 * puis planifie l'étape automatique suivante (tour d'un robot, ramassage du pli, donne suivante).
 */
export class RoomSync {
  constructor(
    private readonly rooms: RoomRepository,
    private readonly publisher: RoomPublisher,
    private readonly scheduler: TaskScheduler,
    private readonly bot: BotStrategy,
    private readonly delays: AutomationDelays,
  ) {}

  sync(room: Room): void {
    if (room.memberIds().length === 0) return this.discard(room.roomCode());
    this.rooms.save(room);
    room.memberIds().forEach((id) => this.publisher.publish(id, this.toView(room.snapshotFor(id))));
    this.planNextStep(room);
    this.planCleanup(room);
  }

  /** Le snapshot du domaine est structurellement conforme au contrat réseau : le compilateur le vérifie ici. */
  private toView(snapshot: RoomSnapshot): RoomView {
    return snapshot;
  }

  private planNextStep(room: Room): void {
    const key = this.automationKey(room.roomCode());
    this.scheduler.cancel(key);
    const step = room.nextAutomaticStep();
    if (!step || room.isAbandoned()) return;
    this.scheduler.schedule(key, this.delays[step], () => this.runStep(room.roomCode()));
  }

  private runStep(code: RoomCode): void {
    const room = this.rooms.findByCode(code);
    if (!room) return;
    room.runAutomaticStep(this.bot);
    this.sync(room);
  }

  private planCleanup(room: Room): void {
    const key = this.cleanupKey(room.roomCode());
    this.scheduler.cancel(key);
    if (!room.isAbandoned()) return;
    this.scheduler.schedule(key, this.delays.abandonedRoom, () => this.discard(room.roomCode()));
  }

  private discard(code: RoomCode): void {
    this.scheduler.cancel(this.automationKey(code));
    this.scheduler.cancel(this.cleanupKey(code));
    this.rooms.delete(code);
  }

  private automationKey(code: RoomCode): string {
    return `automation:${code.toString()}`;
  }

  private cleanupKey(code: RoomCode): string {
    return `cleanup:${code.toString()}`;
  }
}
