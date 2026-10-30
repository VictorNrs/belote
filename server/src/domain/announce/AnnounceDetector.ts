import { Cards } from '../card/Cards';
import { Points } from '../card/Points';
import { Rank } from '../card/Rank';
import { Suit } from '../card/Suit';
import { Trump } from '../card/Trump';
import { Seat } from '../table/Seat';
import { Announce, AnnounceValue } from './Announce';

/** Pour les suites, les cartes se suivent dans l'ordre naturel : 7 8 9 10 V D R A. */
const NATURAL_ORDER = Rank.all();

const SEQUENCES = [
  { length: 5, label: 'Cent', points: 100 },
  { length: 4, label: 'Cinquante', points: 50 },
  { length: 3, label: 'Tierce', points: 20 },
];

const SQUARES = [
  { rank: Rank.JACK, label: 'Carré de valets', points: 200 },
  { rank: Rank.NINE, label: 'Carré de 9', points: 150 },
  { rank: Rank.ACE, label: "Carré d'as", points: 100 },
  { rank: Rank.TEN, label: 'Carré de 10', points: 100 },
  { rank: Rank.KING, label: 'Carré de rois', points: 100 },
  { rank: Rank.QUEEN, label: 'Carré de dames', points: 100 },
];

/** Un carré l'emporte sur une suite de même valeur. */
const SQUARE_HEIGHT_BONUS = NATURAL_ORDER.length;

type Run = number[];

/** Repère les suites et carrés d'une main. */
export class AnnounceDetector {
  detect(seat: Seat, hand: Cards, trump: Trump): Announce[] {
    return [...this.sequences(seat, hand, trump), ...this.squares(seat, hand)];
  }

  private sequences(seat: Seat, hand: Cards, trump: Trump): Announce[] {
    return Suit.all().flatMap((suit) =>
      this.runsOf(hand.ofSuit(suit)).flatMap((run) => this.sequenceAnnounce(seat, run, trump.isSuit(suit))),
    );
  }

  private sequenceAnnounce(seat: Seat, run: Run, inTrump: boolean): Announce[] {
    const kind = SEQUENCES.find((sequence) => run.length >= sequence.length);
    if (!kind) return [];
    const height = run[run.length - 1] ?? 0;
    return [new Announce(seat, kind.label, new AnnounceValue(new Points(kind.points), height, inTrump))];
  }

  /** Index (dans l'ordre naturel) des cartes présentes, regroupés en suites consécutives. */
  private runsOf(cards: Cards): Run[] {
    const indexes = NATURAL_ORDER.flatMap((rank, index) => (cards.some((card) => card.hasRank(rank)) ? [index] : []));
    return indexes.reduce<Run[]>((runs, index) => {
      const last = runs[runs.length - 1];
      const continues = last !== undefined && last[last.length - 1] === index - 1;
      return continues ? [...runs.slice(0, -1), [...last, index]] : [...runs, [index]];
    }, []);
  }

  private squares(seat: Seat, hand: Cards): Announce[] {
    return SQUARES.filter((square) => hand.count((card) => card.hasRank(square.rank)) === Suit.all().length).map((square) => {
      const height = SQUARE_HEIGHT_BONUS + NATURAL_ORDER.indexOf(square.rank);
      return new Announce(seat, square.label, new AnnounceValue(new Points(square.points), height, false));
    });
  }
}
