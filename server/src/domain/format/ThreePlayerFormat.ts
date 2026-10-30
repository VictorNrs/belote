import { Cards } from '../card/Cards';
import { Rank } from '../card/Rank';
import { DealScorer } from '../scoring/DealScorer';
import { SoloDealScorer } from '../scoring/SoloDealScorer';
import { Seat, SeatIndex } from '../table/Seat';
import { TableFormat } from '../table/TableFormat';
import { Team } from '../table/Team';
import { seatAt } from './seatAt';

const PLAYER_COUNT = 3;
const REMOVED_RANKS = [Rank.SEVEN, Rank.EIGHT];

/** Belote à 3 : 24 cartes (sans les 7 ni les 8), chacun joue pour soi. */
export class ThreePlayerFormat implements TableFormat {
  private readonly allSeats = [0, 1, 2].map((index) => new Seat(index as SeatIndex, this));
  private readonly allTeams = [Team.of(0), Team.of(1), Team.of(2)];
  private readonly dealScorer = new SoloDealScorer(this.allTeams);

  playerCount(): number {
    return PLAYER_COUNT;
  }

  seats(): readonly Seat[] {
    return this.allSeats;
  }

  seat(index: number): Seat {
    return seatAt(this.allSeats, index);
  }

  teams(): readonly Team[] {
    return this.allTeams;
  }

  teamOf(seatIndex: number): Team {
    return Team.of(seatIndex);
  }

  arePartners(): boolean {
    return false;
  }

  deck(): Cards {
    return Cards.fullDeck().filter((card) => !REMOVED_RANKS.some((rank) => card.hasRank(rank)));
  }

  scorer(): DealScorer {
    return this.dealScorer;
  }
}
