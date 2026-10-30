import { Card } from '../card/Card';
import { Cards } from '../card/Cards';
import { Bid } from '../bidding/Bid';
import { BiddingRound } from '../bidding/BiddingRound';
import { Contract } from '../bidding/Contract';
import { Trick } from '../play/Trick';
import { Seat } from '../table/Seat';

/** Ce qu'un joueur sait au moment de parler. */
export interface BiddingView {
  hand: Cards;
  proposed: Card;
  round: BiddingRound;
}

/** Ce qu'un joueur sait au moment de poser une carte. */
export interface PlayView {
  seat: Seat;
  hand: Cards;
  legal: Cards;
  trick: Trick;
  contract: Contract;
  /** Cartes encore cachées dans les mains des autres joueurs. */
  unseen: Cards;
}

export interface BotStrategy {
  chooseBid(view: BiddingView): Bid;
  chooseCard(view: PlayView): Card;
}
