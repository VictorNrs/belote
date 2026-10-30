import { AnnounceRule } from '../announce/AnnounceRule';
import { Points } from '../card/Points';
import { Contract } from '../bidding/Contract';
import { CardDealer } from '../play/CardDealer';
import { Hands } from '../play/Hands';
import { OpeningDeal } from '../play/OpeningDeal';
import { PlayingDeal } from '../play/PlayingDeal';
import { Scoreboard } from '../scoring/Scoreboard';
import { Seat } from '../table/Seat';
import { Team } from '../table/Team';

export class GameSettings {
  constructor(
    private readonly target: Points,
    private readonly cardDealer: CardDealer,
    private readonly announceRule: AnnounceRule,
  ) {}

  dealOpening(dealer: Seat): OpeningDeal {
    return this.cardDealer.dealOpening(dealer);
  }

  startPlaying(hands: Hands, contract: Contract, dealer: Seat): PlayingDeal {
    return PlayingDeal.start(hands, contract, dealer, this.announceRule);
  }

  winnerOf(scoreboard: Scoreboard): Team | null {
    return scoreboard.winnerAt(this.target);
  }

  targetPoints(): number {
    return this.target.toNumber();
  }
}
