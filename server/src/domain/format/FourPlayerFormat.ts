import { Cards } from '../card/Cards';
import { DealScorer } from '../scoring/DealScorer';
import { TeamDealScorer } from '../scoring/TeamDealScorer';
import { Seat, SeatIndex } from '../table/Seat';
import { TableFormat } from '../table/TableFormat';
import { Team } from '../table/Team';
import { seatAt } from './seatAt';

const PLAYER_COUNT = 4;

/** Belote à 4 : 32 cartes, deux équipes de partenaires assis face à face. */
export class FourPlayerFormat implements TableFormat {
  private readonly allSeats = [0, 1, 2, 3].map((index) => new Seat(index as SeatIndex, this));
  private readonly allTeams = [Team.of(0), Team.of(1)];
  private readonly dealScorer = new TeamDealScorer(this.allTeams);

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
    return Team.of(seatIndex % 2);
  }

  arePartners(seatIndex: number, otherIndex: number): boolean {
    return (seatIndex + 2) % PLAYER_COUNT === otherIndex;
  }

  deck(): Cards {
    return Cards.fullDeck();
  }

  scorer(): DealScorer {
    return this.dealScorer;
  }
}
