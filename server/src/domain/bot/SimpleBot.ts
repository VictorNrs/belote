import { Card } from '../card/Card';
import { Bid } from '../bidding/Bid';
import { BiddingAdvisor } from './BiddingAdvisor';
import { BiddingView, BotStrategy, PlayView } from './BotStrategy';
import { PlayAdvisor } from './PlayAdvisor';

export class SimpleBot implements BotStrategy {
  constructor(
    private readonly biddingAdvisor = new BiddingAdvisor(),
    private readonly playAdvisor = new PlayAdvisor(),
  ) {}

  chooseBid(view: BiddingView): Bid {
    return this.biddingAdvisor.advise(view);
  }

  chooseCard(view: PlayView): Card {
    return this.playAdvisor.advise(view);
  }
}
