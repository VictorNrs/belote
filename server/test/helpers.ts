import { Card } from '../src/domain/card/Card';
import { Cards } from '../src/domain/card/Cards';
import { Shuffler } from '../src/domain/card/Shuffler';
import { Suit } from '../src/domain/card/Suit';
import { Trump } from '../src/domain/card/Trump';
import { TableFormats } from '../src/domain/format/TableFormats';
import { PlayedCard } from '../src/domain/play/PlayedCard';
import { Trick } from '../src/domain/play/Trick';
import { Seat } from '../src/domain/table/Seat';
import { TableFormat } from '../src/domain/table/TableFormat';
import { MathRandomShuffler } from '../src/infrastructure/random/MathRandomShuffler';

export const FOUR = TableFormats.FOUR_PLAYERS;
export const THREE = TableFormats.THREE_PLAYERS;

/** Générateur pseudo-aléatoire déterministe (mulberry32) pour des tests reproductibles. */
export function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const seededShuffler = (seed: number): Shuffler => new MathRandomShuffler(seededRandom(seed));

export const seat = (index: number, format: TableFormat = FOUR): Seat => format.seat(index);
export const card = (code: string): Card => Card.fromCode(code);
export const cards = (...codes: string[]): Cards => Cards.fromCodes(codes);
export const trumpOf = (code: string): Trump => new Trump(Suit.fromCode(code));

/** Construit un pli à partir de la place qui entame et des cartes posées. */
export function trickAt(format: TableFormat, leader: number, ...codes: string[]): Trick {
  const seats = format.seat(leader).roundFromHere();
  const empty = Trick.empty(format.playerCount());
  return codes.reduce((current, code, index) => current.add(new PlayedCard(seats[index] as Seat, card(code))), empty);
}

export const trick = (leader: number, ...codes: string[]): Trick => trickAt(FOUR, leader, ...codes);
