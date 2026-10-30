import { Points } from '../card/Points';
import { CardDealer } from '../play/CardDealer';
import { OpeningDeal } from '../play/OpeningDeal';
import { Scoreboard } from '../scoring/Scoreboard';
import { Seat } from '../table/Seat';
import { Team } from '../table/Team';

export class GameSettings {
  constructor(
    private readonly target: Points,
    private readonly cardDealer: CardDealer,
  ) {}

  dealOpening(dealer: Seat): OpeningDeal {
    return this.cardDealer.dealOpening(dealer);
  }

  winnerOf(scoreboard: Scoreboard): Team | null {
    return scoreboard.winnerAt(this.target);
  }

  targetPoints(): number {
    return this.target.toNumber();
  }
}
