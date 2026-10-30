import { Bidding } from './Bidding';
import { Contract } from './Contract';

export interface BiddingOutcomeHandler<T> {
  continued(bidding: Bidding): T;
  taken(contract: Contract): T;
  allPassed(): T;
}

export interface BiddingOutcome {
  resolve<T>(handler: BiddingOutcomeHandler<T>): T;
}

export class Continued implements BiddingOutcome {
  constructor(private readonly bidding: Bidding) {}

  resolve<T>(handler: BiddingOutcomeHandler<T>): T {
    return handler.continued(this.bidding);
  }
}

export class Taken implements BiddingOutcome {
  constructor(private readonly contract: Contract) {}

  resolve<T>(handler: BiddingOutcomeHandler<T>): T {
    return handler.taken(this.contract);
  }
}

export class AllPassed implements BiddingOutcome {
  resolve<T>(handler: BiddingOutcomeHandler<T>): T {
    return handler.allPassed();
  }
}
