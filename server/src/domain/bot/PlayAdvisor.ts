import { Card } from '../card/Card';
import { Cards } from '../card/Cards';
import { Trump } from '../card/Trump';
import { PlayedCard } from '../play/PlayedCard';
import { PlayView } from './BotStrategy';

const TRUMP_PENALTY = 100;

/** Heuristiques simples : jouer ses cartes maîtresses, charger son partenaire, gagner au moindre coût. */
export class PlayAdvisor {
  advise(view: PlayView): Card {
    if (view.legal.size() === 1) return view.legal.first();
    if (view.trick.isEmpty()) return this.lead(view);
    if (view.trick.winner(this.trumpOf(view)).isPartnerOf(view.seat)) return this.supportPartner(view);
    return this.contest(view);
  }

  private lead(view: PlayView): Card {
    const trump = this.trumpOf(view);
    const masters = view.legal.filter((card) => this.isMaster(card, view));
    const masterTrumps = masters.trumpsOf(trump);
    const shouldDrawTrumps = view.contract.takingTeam().equals(view.seat.team()) && !view.unseen.trumpsOf(trump).isEmpty();
    if (shouldDrawTrumps && !masterTrumps.isEmpty()) return masterTrumps.first();
    const plainMasters = masters.filter((card) => !trump.isTrump(card));
    if (!plainMasters.isEmpty()) return plainMasters.strongest((card) => trump.pointsOf(card).toNumber());
    return this.cheapest(view.legal, trump);
  }

  private supportPartner(view: PlayView): Card {
    const trump = this.trumpOf(view);
    const partnerIsSafe = view.trick.remainingPlays() === 1 || this.isMaster(view.trick.winningCard(trump), view);
    const plainCards = view.legal.filter((card) => !trump.isTrump(card));
    if (!partnerIsSafe || plainCards.isEmpty()) return this.cheapest(view.legal, trump);
    return plainCards.strongest((card) => trump.pointsOf(card).toNumber());
  }

  private contest(view: PlayView): Card {
    const trump = this.trumpOf(view);
    const winners = view.legal.filter((card) => this.wouldWin(card, view));
    if (winners.isEmpty()) return this.cheapest(view.legal, trump);
    const masters = winners.filter((card) => this.isMaster(card, view));
    const candidates = view.trick.remainingPlays() === 1 || masters.isEmpty() ? winners : masters;
    return candidates.weakest((card) => this.winningCost(card, trump));
  }

  private wouldWin(card: Card, view: PlayView): boolean {
    return view.trick.add(new PlayedCard(view.seat, card)).winner(this.trumpOf(view)).equals(view.seat);
  }

  private isMaster(card: Card, view: PlayView): boolean {
    const trump = this.trumpOf(view);
    return !view.unseen.some((other) => other.sameSuitAs(card) && trump.strengthOf(other) > trump.strengthOf(card));
  }

  private cheapest(cards: Cards, trump: Trump): Card {
    return cards.weakest((card) => this.trumpPenalty(card, trump) + trump.pointsOf(card).toNumber() * 2 + trump.strengthOf(card));
  }

  /** Gagner avec un atout coûte cher ; gagner avec une grosse carte d'une autre couleur rapporte. */
  private winningCost(card: Card, trump: Trump): number {
    return this.trumpPenalty(card, trump) + trump.strengthOf(card) - trump.pointsOf(card).toNumber();
  }

  private trumpPenalty(card: Card, trump: Trump): number {
    return trump.isTrump(card) ? TRUMP_PENALTY : 0;
  }

  private trumpOf(view: PlayView): Trump {
    return view.contract.trump();
  }
}
