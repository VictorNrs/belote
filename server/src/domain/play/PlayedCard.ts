import { Card } from '../card/Card';
import { Trump } from '../card/Trump';
import { Seat } from '../table/Seat';

export interface PlayedCardSnapshot {
  seat: number;
  card: string;
}

export class PlayedCard {
  constructor(
    private readonly player: Seat,
    private readonly played: Card,
  ) {}

  seat(): Seat {
    return this.player;
  }

  card(): Card {
    return this.played;
  }

  beats(other: PlayedCard, trump: Trump): boolean {
    return trump.beats(this.played, other.played);
  }

  toSnapshot(): PlayedCardSnapshot {
    return { seat: this.player.toIndex(), card: this.played.toCode() };
  }
}
