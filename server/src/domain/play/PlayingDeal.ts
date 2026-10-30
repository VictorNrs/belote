import { Card } from '../card/Card';
import { Cards } from '../card/Cards';
import { Points } from '../card/Points';
import { Contract, ContractSnapshot } from '../bidding/Contract';
import { PlayView } from '../bot/BotStrategy';
import { DealResult } from '../scoring/DealResult';
import { DealScorer } from '../scoring/DealScorer';
import { DomainError } from '../shared/DomainError';
import { Seat } from '../table/Seat';
import { Belote } from './Belote';
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
  lastTrick: TrickSnapshot | null;
  tricksWon: number[];
}

const scorer = new DealScorer();

/** Phase de jeu de la carte d'une donne, une fois l'atout choisi. */
export class PlayingDeal {
  private constructor(
    private readonly hands: Hands,
    private readonly contract: Contract,
    private readonly turn: Seat,
    private readonly tricks: TrickHistory,
    private readonly belote: Belote,
  ) {}

  static start(hands: Hands, contract: Contract, dealer: Seat): PlayingDeal {
    return new PlayingDeal(hands, contract, dealer.next(), TrickHistory.start(), Belote.detect(hands, contract.trump()));
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
    const trump = this.contract.trump();
    const tricks = this.tricks.play(new PlayedCard(seat, card));
    return new PlayingDeal(this.hands.remove(seat, card), this.contract, seat.next(), tricks, this.belote.afterPlay(seat, card, trump));
  }

  /** L'annonce « Belote » / « Rebelote » déclenchée depuis l'état précédent, s'il y en a une. */
  announcementSince(previous: PlayingDeal): string | null {
    return this.belote === previous.belote ? null : this.belote.announcement();
  }

  isTrickComplete(): boolean {
    return this.tricks.isTrickComplete();
  }

  collectTrick(): PlayingDeal {
    const trump = this.contract.trump();
    const winner = this.tricks.current().winner(trump);
    return new PlayingDeal(this.hands, this.contract, winner, this.tricks.collect(trump), this.belote);
  }

  isOver(): boolean {
    return this.tricks.isOver();
  }

  score(pendingLitige: Points): DealResult {
    return scorer.score(this.contract, this.tricks.collectedTricks(), this.belote, pendingLitige);
  }

  viewFor(seat: Seat): PlayView {
    const hand = this.hands.of(seat);
    const unseen = this.hands.allCards().withoutAll(hand);
    return { seat, hand, legal: this.legalCardsFor(seat), trick: this.tricks.current(), contract: this.contract, unseen };
  }

  toSnapshot(viewer: Seat): PlayingSnapshot {
    return {
      turn: this.isTrickComplete() ? null : this.turn.toIndex(),
      hand: this.hands.of(viewer).orderedFor(this.contract.trump()).toCodes(),
      legalCards: this.legalCardsFor(viewer).toCodes(),
      handSizes: this.hands.sizes(),
      contract: this.contract.toSnapshot(),
      trick: this.tricks.current().toSnapshot(),
      lastTrick: this.tricks.previousTrick(),
      tricksWon: this.tricks.collectedTricks().counts(),
    };
  }
}
