import { describe, expect, it } from 'vitest';
import { AnnounceDetector } from '../src/domain/announce/AnnounceDetector';
import { Announces } from '../src/domain/announce/Announces';
import { Hands } from '../src/domain/play/Hands';
import { FOUR, cards, seat, trumpOf } from './helpers';

const hearts = trumpOf('H');
const labelsOf = (...hand: string[]) => new AnnounceDetector().detect(seat(0), cards(...hand), hearts).map((announce) => announce.toSnapshot());

const announcesOf = (bySeat: Record<number, string[]>) => {
  const hands = Object.entries(bySeat).reduce((all, [index, hand]) => all.give(seat(Number(index)), cards(...hand)), Hands.empty(FOUR));
  return Announces.detect(hands, hearts);
};

describe('Détection des annonces', () => {
  it('reconnaît tierce, cinquante et cent dans l’ordre naturel 7 8 9 10 V D R A', () => {
    expect(labelsOf('9S', '10S', 'JS')).toEqual([{ seat: 0, label: 'Tierce', points: 20 }]);
    expect(labelsOf('7D', '8D', '9D', '10D')).toEqual([{ seat: 0, label: 'Cinquante', points: 50 }]);
    expect(labelsOf('10C', 'JC', 'QC', 'KC', 'AC')).toEqual([{ seat: 0, label: 'Cent', points: 100 }]);
  });

  it('ne compte pas des cartes qui ne se suivent pas', () => {
    expect(labelsOf('9S', 'JS', 'QS', 'AS')).toEqual([]);
  });

  it('reconnaît les carrés de valets (200), de 9 (150) et d’as (100), pas ceux de 7 ou de 8', () => {
    expect(labelsOf('JS', 'JH', 'JD', 'JC')).toEqual([{ seat: 0, label: 'Carré de valets', points: 200 }]);
    expect(labelsOf('9S', '9H', '9D', '9C')).toEqual([{ seat: 0, label: 'Carré de 9', points: 150 }]);
    expect(labelsOf('AS', 'AH', 'AD', 'AC')).toEqual([{ seat: 0, label: "Carré d'as", points: 100 }]);
    expect(labelsOf('8S', '8H', '8D', '8C')).toEqual([]);
  });
});

describe('Comparaison des annonces', () => {
  it('seul le camp qui a la meilleure annonce marque toutes les siennes', () => {
    const announces = announcesOf({ 0: ['7S', '8S', '9S', '10S'], 1: ['QD', 'KD', 'AD'], 2: ['9C', '10C', 'JC'] });
    expect(announces.points(FOUR.teams()).toNumbers()).toEqual([70, 0]);
  });

  it('à valeur et hauteur égales, la suite à l’atout l’emporte', () => {
    const announces = announcesOf({ 0: ['JS', 'QS', 'KS'], 1: ['JH', 'QH', 'KH'] });
    expect(announces.points(FOUR.teams()).toNumbers()).toEqual([0, 20]);
  });

  it('à égalité parfaite entre deux camps, aucune annonce ne compte', () => {
    const announces = announcesOf({ 0: ['JS', 'QS', 'KS'], 1: ['JD', 'QD', 'KD'] });
    expect(announces.points(FOUR.teams()).toNumbers()).toEqual([0, 0]);
  });

  it('un carré bat une suite de même valeur', () => {
    const announces = announcesOf({ 0: ['7D', '8D', '9D', '10D', 'JD'], 1: ['KS', 'KH', 'KD', 'KC'] });
    expect(announces.points(FOUR.teams()).toNumbers()).toEqual([0, 100]);
  });

  it('décrit ce que chaque joueur annonce', () => {
    const announces = announcesOf({ 0: ['9S', '10S', 'JS', 'KD', 'KH', 'KC', 'KS'] });
    expect(announces.declarationOf(seat(0))).toBe('Tierce · Carré de rois');
    expect(announces.declarationOf(seat(1))).toBeNull();
  });
});
