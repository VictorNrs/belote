import { describe, expect, it } from 'vitest';
import { AnnounceRules } from '../src/domain/announce/AnnounceRule';
import { Points } from '../src/domain/card/Points';
import { Contract } from '../src/domain/bidding/Contract';
import { CollectedTricks } from '../src/domain/play/CollectedTricks';
import { DealBonuses } from '../src/domain/play/DealBonuses';
import { Hands } from '../src/domain/play/Hands';
import { TableFormat } from '../src/domain/table/TableFormat';
import { Team } from '../src/domain/table/Team';
import { cards, FOUR, seat, THREE, trumpOf } from './helpers';

const hearts = trumpOf('H');

/** Bonus d'une donne à partir des cartes détenues par certains joueurs (annonces activées). */
const bonusesFrom = (format: TableFormat, bySeat: Record<number, string[]> = {}) => {
  const hands = Object.entries(bySeat).reduce((all, [index, hand]) => all.give(seat(Number(index), format), cards(...hand)), Hands.empty(format));
  return DealBonuses.detect(hands, hearts, AnnounceRules.ENABLED);
};
const beloteFor = (seatIndex: number, format: TableFormat = FOUR) => bonusesFrom(format, { [seatIndex]: ['KH', 'QH'] });

/** Huit plis : [camp gagnant, points du pli] (le dernier reçoit automatiquement le dix de der). */
const collectedAt = (format: TableFormat, ...tricks: [number, number][]) =>
  tricks.reduce((all, [team, points]) => all.collect(Team.of(team), new Points(points)), CollectedTricks.none(format.teams()));
const collected = (...tricks: [number, number][]) => collectedAt(FOUR, ...tricks);

const scoreAt = (format: TableFormat, tricks: CollectedTricks, bonuses = bonusesFrom(format), pending = Points.ZERO) =>
  format.scorer().score(new Contract(seat(0, format), hearts), tricks, bonuses, pending).toSnapshot();
const score = (tricks: CollectedTricks, bonuses = bonusesFrom(FOUR), pending = Points.ZERO) => scoreAt(FOUR, tricks, bonuses, pending);

const madeDeal = collected([0, 20], [1, 20], [0, 20], [1, 20], [0, 20], [1, 22], [0, 10], [0, 20]);
const failedDeal = collected([1, 20], [1, 20], [0, 20], [1, 20], [0, 20], [1, 22], [0, 10], [1, 20]);

describe('Comptage des points à 4', () => {
  it('contrat rempli : chaque équipe marque ses points', () => {
    expect(score(madeDeal)).toMatchObject({ outcome: 'made', cardPoints: [100, 62], scored: [100, 62] });
  });

  it('dedans : la défense marque 162', () => {
    expect(score(failedDeal)).toMatchObject({ outcome: 'failed', cardPoints: [50, 112], scored: [0, 162] });
  });

  it("capot : 252 points pour l'équipe qui a fait tous les plis", () => {
    const tricks = collected([0, 20], [0, 20], [0, 20], [0, 20], [0, 20], [0, 22], [0, 10], [0, 20]);
    expect(score(tricks)).toMatchObject({ outcome: 'capot', scored: [252, 0] });
  });

  it('la belote compte pour remplir le contrat et reste acquise', () => {
    const tricks = collected([0, 20], [1, 20], [0, 20], [1, 20], [1, 20], [1, 20], [0, 32], [1, 0]);
    expect(score(tricks, beloteFor(2))).toMatchObject({ outcome: 'made', cardPoints: [72, 90], scored: [92, 90], beloteTeam: 0 });
  });

  it('dedans avec belote adverse : la défense garde sa belote en plus des 162', () => {
    expect(score(failedDeal, beloteFor(1))).toMatchObject({ outcome: 'failed', scored: [0, 182] });
  });

  it("litige : les points du preneur sont mis en réserve pour l'équipe qui gagne la donne suivante", () => {
    const tie = collected([0, 20], [1, 20], [0, 20], [1, 20], [0, 21], [1, 21], [0, 20], [1, 10]);
    expect(score(tie)).toMatchObject({ outcome: 'litige', scored: [0, 81], pendingLitige: 81 });
    expect(score(madeDeal, bonusesFrom(FOUR), new Points(81))).toMatchObject({ scored: [181, 62], pendingLitige: 0 });
  });

  it('les annonces s’ajoutent aux points du camp qui les a faites', () => {
    const bonuses = bonusesFrom(FOUR, { 2: ['9C', '10C', 'JC'] });
    expect(score(madeDeal, bonuses)).toMatchObject({ outcome: 'made', announcePoints: [20, 0], scored: [120, 62] });
    expect(score(madeDeal, bonuses).announces).toEqual([{ seat: 2, label: 'Tierce', points: 20 }]);
  });

  it('les annonces comptent pour remplir le contrat', () => {
    const tricks = collected([0, 20], [1, 20], [0, 20], [1, 20], [1, 20], [1, 20], [0, 32], [1, 0]);
    expect(score(tricks, bonusesFrom(FOUR, { 0: ['9C', '10C', 'JC'] }))).toMatchObject({ outcome: 'made', scored: [92, 90] });
  });

  it('dedans : la défense marque aussi les annonces du preneur', () => {
    expect(score(failedDeal, bonusesFrom(FOUR, { 0: ['9C', '10C', 'JC', 'QC'] }))).toMatchObject({ outcome: 'failed', scored: [0, 212] });
  });
});

describe('Comptage des points à 3', () => {
  it('contrat rempli avec 82 points : chacun marque ses points', () => {
    const tricks = collectedAt(THREE, [0, 20], [1, 20], [0, 20], [2, 20], [0, 20], [1, 20], [2, 10], [0, 12]);
    expect(scoreAt(THREE, tricks)).toMatchObject({ outcome: 'made', cardPoints: [82, 40, 30], scored: [82, 40, 30] });
  });

  it('dedans sous 82 points : chaque adversaire marque 81', () => {
    const tricks = collectedAt(THREE, [0, 20], [1, 20], [0, 20], [2, 20], [0, 20], [1, 20], [2, 10], [0, 11]);
    expect(scoreAt(THREE, tricks)).toMatchObject({ outcome: 'failed', cardPoints: [81, 40, 30], scored: [0, 81, 81] });
  });

  it('la belote du preneur compte pour atteindre 82 points', () => {
    const tricks = collectedAt(THREE, [0, 20], [1, 30], [0, 20], [2, 20], [1, 20], [1, 20], [2, 10], [0, 12]);
    expect(scoreAt(THREE, tricks, beloteFor(0, THREE))).toMatchObject({ outcome: 'made', scored: [82, 70, 30] });
  });

  it('dedans : un adversaire garde ses annonces', () => {
    const tricks = collectedAt(THREE, [0, 20], [1, 20], [0, 20], [2, 20], [0, 20], [1, 20], [2, 10], [0, 1]);
    const bonuses = bonusesFrom(THREE, { 2: ['9C', '10C', 'JC'] });
    expect(scoreAt(THREE, tricks, bonuses)).toMatchObject({ outcome: 'failed', scored: [0, 81, 101] });
  });

  it('capot du preneur : 252 points', () => {
    const tricks = collectedAt(THREE, [0, 20], [0, 20], [0, 20], [0, 20], [0, 20], [0, 20], [0, 10], [0, 2]);
    expect(scoreAt(THREE, tricks)).toMatchObject({ outcome: 'capot', scored: [252, 0, 0] });
  });
});
