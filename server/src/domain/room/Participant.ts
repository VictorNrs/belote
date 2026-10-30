import { Seat } from '../table/Seat';
import { PlayerId } from './PlayerId';
import { PlayerName } from './PlayerName';

export interface ParticipantSnapshot {
  name: string;
  isBot: boolean;
  connected: boolean;
}

/** Occupant d'une place : un humain ou un robot. */
export interface Participant {
  isPlayer(id: PlayerId): boolean;
  isBot(): boolean;
  isConnected(): boolean;
  withConnection(connected: boolean): Participant;
  playerId(): PlayerId | null;
  toSnapshot(): ParticipantSnapshot;
}

export class HumanPlayer implements Participant {
  private constructor(
    private readonly id: PlayerId,
    private readonly name: PlayerName,
    private readonly connected: boolean,
  ) {}

  static join(id: PlayerId, name: PlayerName): HumanPlayer {
    return new HumanPlayer(id, name, true);
  }

  isPlayer(id: PlayerId): boolean {
    return this.id.equals(id);
  }

  isBot(): boolean {
    return false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  withConnection(connected: boolean): Participant {
    return new HumanPlayer(this.id, this.name, connected);
  }

  playerId(): PlayerId {
    return this.id;
  }

  toSnapshot(): ParticipantSnapshot {
    return { name: this.name.toString(), isBot: false, connected: this.connected };
  }
}

const BOT_NAMES = ['Alice', 'Bruno', 'Chloé', 'Denis'];

export class BotPlayer implements Participant {
  private constructor(private readonly name: PlayerName) {}

  static forSeat(seat: Seat): BotPlayer {
    return new BotPlayer(PlayerName.of(BOT_NAMES[seat.toIndex()] ?? 'Robot'));
  }

  isPlayer(): boolean {
    return false;
  }

  isBot(): boolean {
    return true;
  }

  isConnected(): boolean {
    return true;
  }

  withConnection(): Participant {
    return this;
  }

  playerId(): null {
    return null;
  }

  toSnapshot(): ParticipantSnapshot {
    return { name: this.name.toString(), isBot: true, connected: true };
  }
}
