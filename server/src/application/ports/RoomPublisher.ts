import { RoomView } from '@belote/shared';
import { PlayerId } from '../../domain/room/PlayerId';

/** Envoie à un joueur sa vue personnelle de la salle. */
export interface RoomPublisher {
  publish(playerId: PlayerId, view: RoomView): void;
}
