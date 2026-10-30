import { Card } from '../card/Card';
import { Cards } from '../card/Cards';
import { Points } from '../card/Points';
import { Trump } from '../card/Trump';
import { DomainError } from '../shared/DomainError';
import { Seat } from '../table/Seat';
import { PlayedCard, PlayedCardSnapshot } from './PlayedCard';

export const NO_TRUMP_STRENGTH = -1;

/** Pli en cours : les cartes posées sur la table, dans l'ordre. */
export class Trick {
  private constructor(
    private readonly playerCount: number,
    private readonly plays: readonly PlayedCard[],
  ) {}

  static empty(playerCount: number): Trick {
    return new Trick(playerCount, []);
  }

  add(play: PlayedCard): Trick {
    return new Trick(this.playerCount, [...this.plays, play]);
  }

  /** Un nouveau pli vide, pour le même nombre de joueurs. */
  next(): Trick {
    return Trick.empty(this.playerCount);
  }

  isEmpty(): boolean {
    return this.plays.length === 0;
  }

  isComplete(): boolean {
    return this.plays.length === this.playerCount;
  }

  remainingPlays(): number {
    return this.playerCount - this.plays.length;
  }

  leadCard(): Card {
    return this.firstPlay().card();
  }

  winner(trump: Trump): Seat {
    return this.winningPlay(trump).seat();
  }

  winningCard(trump: Trump): Card {
    return this.winningPlay(trump).card();
  }

  cards(): Cards {
    return new Cards(this.plays.map((play) => play.card()));
  }

  points(trump: Trump): Points {
    return this.cards().points(trump);
  }

  hasTrump(trump: Trump): boolean {
    return this.cards().some((card) => trump.isTrump(card));
  }

  highestTrumpStrength(trump: Trump): number {
    const trumps = this.cards().trumpsOf(trump);
    if (trumps.isEmpty()) return NO_TRUMP_STRENGTH;
    return trump.strengthOf(trumps.strongest((card) => trump.strengthOf(card)));
  }

  toSnapshot(): PlayedCardSnapshot[] {
    return this.plays.map((play) => play.toSnapshot());
  }

  private winningPlay(trump: Trump): PlayedCard {
    return this.plays.reduce((best, play) => (play.beats(best, trump) ? play : best), this.firstPlay());
  }

  private firstPlay(): PlayedCard {
    const first = this.plays[0];
    if (!first) throw new DomainError('Le pli est vide');
    return first;
  }
}
