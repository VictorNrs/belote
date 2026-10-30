import { PlainOrdering } from '../../card/CardOrdering';
import { Bid } from '../../bidding/Bid';
import { Bidding } from '../../bidding/Bidding';
import { BotStrategy } from '../../bot/BotStrategy';
import { OpeningDeal } from '../../play/OpeningDeal';
import { Seat } from '../../table/Seat';
import { BaseState, GameState } from '../GameState';
import { GamePhase, GameSnapshot } from '../GameSnapshot';
import { Table } from '../Table';
import { PlayingState } from './PlayingState';

export class BiddingState extends BaseState {
  private constructor(
    table: Table,
    private readonly opening: OpeningDeal,
    private readonly bidding: Bidding,
  ) {
    super(table);
  }

  static open(table: Table): BiddingState {
    const opening = table.dealOpening();
    return new BiddingState(table, opening, Bidding.open(table.dealerSeat(), opening.proposedCard()));
  }

  phase(): GamePhase {
    return 'bidding';
  }

  override playerToAct(): Seat {
    return this.bidding.currentBidder();
  }

  override bid(seat: Seat, bid: Bid): GameState {
    return this.bidding.place(seat, bid).resolve<GameState>({
      continued: (bidding) => new BiddingState(this.table, this.opening, bidding),
      taken: (contract) => PlayingState.start(this.table, this.opening.completeFor(contract), contract),
      allPassed: () => BiddingState.open(this.table.announce(null, 'Tout le monde passe : nouvelle donne').passDealToNextPlayer()),
    });
  }

  override actAsBot(seat: Seat, strategy: BotStrategy): GameState {
    const view = { hand: this.opening.handOf(seat), proposed: this.bidding.proposedCard(), round: this.bidding.currentRound() };
    return this.bid(seat, strategy.chooseBid(view));
  }

  snapshotFor(viewer: Seat): GameSnapshot {
    return {
      ...this.table.snapshot(this.phase()),
      ...this.bidding.toSnapshot(),
      hand: this.opening.handOf(viewer).orderedFor(new PlainOrdering()).toCodes(),
      handSizes: this.opening.handSizes(),
    };
  }
}
