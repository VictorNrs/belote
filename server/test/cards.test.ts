import { describe, expect, it } from 'vitest';
import { Cards } from '../src/domain/card/Cards';
import { card, trick, trumpOf } from './helpers';

describe('Cartes', () => {
  it('le paquet contient 32 cartes valant 152 points (162 avec le dix de der)', () => {
    const deck = Cards.fullDeck();
    expect(deck.size()).toBe(32);
    expect(deck.points(trumpOf('H')).toNumber()).toBe(152);
  });

  it("à l'atout, le valet puis le 9 sont les cartes les plus fortes", () => {
    const trump = trumpOf('S');
    expect(trump.beats(card('JS'), card('9S'))).toBe(true);
    expect(trump.beats(card('9S'), card('AS'))).toBe(true);
    expect(trump.pointsOf(card('JS')).toNumber()).toBe(20);
    expect(trump.pointsOf(card('9S')).toNumber()).toBe(14);
  });

  it("hors atout, l'as puis le 10 sont les plus forts", () => {
    const trump = trumpOf('S');
    expect(trump.beats(card('AH'), card('10H'))).toBe(true);
    expect(trump.beats(card('10H'), card('KH'))).toBe(true);
    expect(trump.pointsOf(card('JH')).toNumber()).toBe(2);
  });

  it('un atout bat toute carte non atout, une autre couleur ne bat jamais', () => {
    const trump = trumpOf('S');
    expect(trump.beats(card('7S'), card('AH'))).toBe(true);
    expect(trump.beats(card('AD'), card('7H'))).toBe(false);
  });

  it('désigne le gagnant du pli', () => {
    const trump = trumpOf('S');
    expect(trick(0, 'KH', 'AH', '7H', '10H').winner(trump).toIndex()).toBe(1);
    expect(trick(0, 'KH', 'AH', '7S', '10H').winner(trump).toIndex()).toBe(2);
    expect(trick(3, 'KH', 'AD', '7C', '8H').winner(trump).toIndex()).toBe(3);
  });

  it('trie une main par couleur, atout en premier, du plus fort au plus faible', () => {
    const hand = Cards.fromCodes(['7H', 'JS', 'AH', '9S', 'KD']);
    expect(hand.orderedFor(trumpOf('S')).toCodes()).toEqual(['JS', '9S', 'AH', '7H', 'KD']);
  });
});
