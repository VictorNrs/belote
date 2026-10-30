import { Points } from '../card/Points';
import { Contract } from '../bidding/Contract';
import { Hands } from '../play/Hands';
import { OpeningDeal } from '../play/OpeningDeal';
import { PlayingDeal } from '../play/PlayingDeal';
import { DealResult } from '../scoring/DealResult';
import { Scoreboard } from '../scoring/Scoreboard';
import { Seat } from '../table/Seat';
import { Team } from '../table/Team';
import { Announcements } from './Announcements';
import { GamePhase, GameSnapshot, NO_DEAL_DETAILS } from './GameSnapshot';
import { GameSettings } from './GameSettings';

/** Contexte de la partie qui survit d'une donne à l'autre : donneur, scores, annonces. */
export class Table {
  private constructor(
    private readonly dealer: Seat,
    private readonly scoreboard: Scoreboard,
    private readonly settings: GameSettings,
    private readonly announcements: Announcements,
  ) {}

  static initial(settings: GameSettings, firstDealer: Seat): Table {
    return new Table(firstDealer, Scoreboard.start(firstDealer.format().teams()), settings, Announcements.NONE);
  }

  dealerSeat(): Seat {
    return this.dealer;
  }

  dealOpening(): OpeningDeal {
    return this.settings.dealOpening(this.dealer);
  }

  startPlaying(hands: Hands, contract: Contract): PlayingDeal {
    return this.settings.startPlaying(hands, contract, this.dealer);
  }

  passDealToNextPlayer(): Table {
    return new Table(this.dealer.next(), this.scoreboard, this.settings, this.announcements);
  }

  record(result: DealResult): Table {
    return new Table(this.dealer, this.scoreboard.record(result), this.settings, this.announcements);
  }

  announce(seat: Seat | null, text: string): Table {
    return new Table(this.dealer, this.scoreboard, this.settings, this.announcements.announce(seat, text));
  }

  pendingLitige(): Points {
    return this.scoreboard.pendingLitige();
  }

  winner(): Team | null {
    return this.settings.winnerOf(this.scoreboard);
  }

  snapshot(phase: GamePhase): GameSnapshot {
    const format = this.dealer.format();
    return {
      ...NO_DEAL_DETAILS,
      handSizes: format.seats().map(() => 0),
      tricksWon: format.teams().map(() => 0),
      phase,
      dealer: this.dealer.toIndex(),
      scores: this.scoreboard.scores(),
      target: this.settings.targetPoints(),
      pendingLitige: this.scoreboard.pendingLitige().toNumber(),
      announcement: this.announcements.toSnapshot(),
    };
  }
}
