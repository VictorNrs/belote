import { AnnounceRule } from '../announce/AnnounceRule';
import { Card } from '../card/Card';
import { Cards } from '../card/Cards';
import { Points } from '../card/Points';
import { Contract, ContractSnapshot } from '../bidding/Contract';
import { PlayView } from '../bot/BotStrategy';
import { DealResult } from '../scoring/DealResult';
import { DomainError } from '../shared/DomainError';
import { Seat } from '../table/Seat';
import { DealBonuses } from './DealBonuses';
import { Hands } from './Hands';
import { PlayedCard, PlayedCardSnapshot } from './PlayedCard';
import { PlayRules } from './PlayRules';
import { TrickHistory, TrickSnapshot } from './TrickHistory';

export interface PlayingSnapshot {
  turn: number | null;
  hand: string[];
  legalCards: string[];
  handSizes: number[];
  contract: ContractSnapshot;
  trick: PlayedCardSnapshot[];
  trickWinner: number | null;
  lastTrick: TrickSnapshot | null;
  tricksWon: number[];
}

/** Phase de jeu de la carte d'une donne, une fois l'atout choisi. */
export class PlayingDeal {
  private constructor(
    private readonly hands: Hands,
    private readonly contract: Contract,
    private readonly turn: Seat,
    private readonly tricks: TrickHistory,
    private readonly bonuses: DealBonuses,
  ) {}

  static start(hands: Hands, contract: Contract, dealer: Seat, announceRule: AnnounceRule): PlayingDeal {
    const tricks = TrickHistory.start(dealer.format());
    return new PlayingDeal(hands, contract, dealer.next(), tricks, DealBonuses.detect(hands, contract.trump(), announceRule));
  }

  currentPlayer(): Seat {
    return this.turn;
  }

  legalCardsFor(seat: Seat): Cards {
    if (!seat.equals(this.turn) || this.tricks.isTrickComplete()) return Cards.NONE;
    return new PlayRules(this.tricks.current(), this.contract.trump()).legalCards(this.hands.of(seat), seat);
  }

  play(seat: Seat, card: Card): PlayingDeal {
    if (!seat.equals(this.turn)) throw new DomainError("Ce n'est pas votre tour de jouer");
    if (!this.legalCardsFor(seat).contains(card)) throw new DomainError('Cette carte ne peut pas être jouée');
    const tricks = this.tricks.play(new PlayedCard(seat, card));
    const bonuses = this.bonuses.afterPlay(seat, card, this.contract.trump());
    return new PlayingDeal(this.hands.remove(seat, card), this.contract, seat.next(), tricks, bonuses);
  }

  /** Ce qu'a annoncé le joueur qui vient de poser sa carte (annonces, belote), s'il y a lieu. */
  announcementSince(previous: PlayingDeal): string | null {
    return this.bonuses.announcementSince(previous.bonuses, previous.turn, previous.tricks.isFirstTrick());
  }

  isTrickComplete(): boolean {
    return this.tricks.isTrickComplete();
  }

  collectTrick(): PlayingDeal {
    const trump = this.contract.trump();
    const winner = this.tricks.current().winner(trump);
    return new PlayingDeal(this.hands, this.contract, winner, this.tricks.collect(trump), this.bonuses);
  }

  isOver(): boolean {
    return this.tricks.isOver();
  }

  score(pendingLitige: Points): DealResult {
    return this.turn.format().scorer().score(this.contract, this.tricks.collectedTricks(), this.bonuses, pendingLitige);
  }

  viewFor(seat: Seat): PlayView {
    const hand = this.hands.of(seat);
    const unseen = this.hands.allCards().withoutAll(hand);
    return { seat, hand, legal: this.legalCardsFor(seat), trick: this.tricks.current(), contract: this.contract, unseen };
  }

  toSnapshot(viewer: Seat): PlayingSnapshot {
    const trump = this.contract.trump();
    return {
      turn: this.isTrickComplete() ? null : this.turn.toIndex(),
      hand: this.hands.of(viewer).orderedFor(trump).toCodes(),
      legalCards: this.legalCardsFor(viewer).toCodes(),
      handSizes: this.hands.sizes(),
      contract: this.contract.toSnapshot(),
      trick: this.tricks.current().toSnapshot(),
      trickWinner: this.isTrickComplete() ? this.tricks.current().winner(trump).toIndex() : null,
      lastTrick: this.tricks.previousTrick(),
      tricksWon: this.tricks.collectedTricks().counts(),
    };
  }
}
