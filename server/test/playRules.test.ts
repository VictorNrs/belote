import { describe, expect, it } from 'vitest';
import { PlayRules } from '../src/domain/play/PlayRules';
import { Trick } from '../src/domain/play/Trick';
import { TableFormat } from '../src/domain/table/TableFormat';
import { cards, FOUR, seat, THREE, trick, trickAt, trumpOf } from './helpers';

const spades = trumpOf('S');
const legalAt = (format: TableFormat, currentTrick: Trick, seatIndex: number, ...hand: string[]) =>
  new PlayRules(currentTrick, spades).legalCards(cards(...hand), seat(seatIndex, format)).toCodes().sort();
const legal = (currentTrick: Trick, seatIndex: number, ...hand: string[]) => legalAt(FOUR, currentTrick, seatIndex, ...hand);

describe('Règles de jeu', () => {
  it('toutes les cartes sont jouables quand on entame', () => {
    expect(legal(Trick.empty(4), 0, 'AH', '7S', 'KD')).toEqual(['7S', 'AH', 'KD']);
  });

  it('il faut fournir la couleur demandée', () => {
    expect(legal(trick(0, 'KH'), 1, 'AH', '7H', '7S', 'KD')).toEqual(['7H', 'AH']);
  });

  it("sans la couleur demandée, il faut couper si l'adversaire est maître", () => {
    expect(legal(trick(0, 'KH'), 1, '7S', '9S', 'KD')).toEqual(['7S', '9S']);
  });

  it('sans la couleur demandée, on est libre si le partenaire est maître', () => {
    expect(legal(trick(0, 'AH', '7H'), 2, '7S', 'KD')).toEqual(['7S', 'KD']);
  });

  it('il faut surcouper quand un adversaire a déjà coupé', () => {
    expect(legal(trick(0, 'KH', '9S'), 2, '7S', 'JS', 'KD')).toEqual(['JS']);
  });

  it("sans pouvoir surcouper, on n'est pas obligé de sous-couper", () => {
    expect(legal(trick(0, 'KH', 'JS'), 2, '7S', 'KD')).toEqual(['7S', 'KD']);
  });

  it("à l'atout, il faut monter si possible", () => {
    expect(legal(trick(0, '10S'), 1, '7S', 'AS', 'JS')).toEqual(['AS', 'JS']);
  });

  it("à l'atout, sans pouvoir monter, on fournit quand même de l'atout", () => {
    expect(legal(trick(0, 'JS'), 1, '7S', 'AS', 'KD')).toEqual(['7S', 'AS']);
  });

  it("à 3, il n'y a pas de partenaire : il faut toujours couper", () => {
    expect(legalAt(THREE, trickAt(THREE, 0, 'AH', '9H'), 2, '9S', 'KD')).toEqual(['9S']);
  });
});
