import { Card } from '../../domain/card/Card';
import { Suit } from '../../domain/card/Suit';
import { Bid } from '../../domain/bidding/Bid';
import { PlayerId } from '../../domain/room/PlayerId';
import { Room } from '../../domain/room/Room';
import { PlayerCommand, SeatedPlayerUseCase } from './SeatedPlayerUseCase';

export interface BidCommand extends PlayerCommand {
  take: boolean;
  suit: string | null;
}

export interface PlayCardCommand extends PlayerCommand {
  card: string;
}

export class PlaceBid extends SeatedPlayerUseCase<BidCommand> {
  protected apply(room: Room, playerId: PlayerId, command: BidCommand): void {
    room.bid(playerId, this.toBid(command));
  }

  private toBid(command: BidCommand): Bid {
    if (!command.take) return Bid.pass();
    return Bid.take(command.suit ? Suit.fromCode(command.suit) : null);
  }
}

export class PlayCard extends SeatedPlayerUseCase<PlayCardCommand> {
  protected apply(room: Room, playerId: PlayerId, command: PlayCardCommand): void {
    room.play(playerId, Card.fromCode(command.card));
  }
}
