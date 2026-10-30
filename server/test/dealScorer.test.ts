import { describe, expect, it } from 'vitest';
import { Points } from '../src/domain/card/Points';
import { Contract } from '../src/domain/bidding/Contract';
import { Belote } from '../src/domain/play/Belote';
import { CollectedTricks } from '../src/domain/play/CollectedTricks';
import { Hands } from '../src/domain/play/Hands';
import { TableFormat } from '../src/domain/table/TableFormat';
import { Team } from '../src/domain/table/Team';
import { cards, FOUR, seat, THREE, trumpOf } from './helpers';

const hearts = trumpOf('H');
const noBelote = (format: TableFormat) => Belote.detect(Hands.empty(format), hearts);
const beloteFor = (seatIndex: number, format: TableFormat = FOUR) =>
  Belote.detect(Hands.empty(format).give(seat(seatIndex, format), cards('KH', 'QH')), hearts);

/** Huit plis : [camp gagnant, points du pli] (le dernier reçoit automatiquement le dix de der). */
const collectedAt = (format: TableFormat, ...tricks: [number, number][]) =>
  tricks.reduce((all, [team, points]) => all.collect(Team.of(team), new Points(points)), CollectedTricks.none(format.teams()));
const collected = (...tricks: [number, number][]) => collectedAt(FOUR, ...tricks);

const scoreAt = (format: TableFormat, tricks: CollectedTricks, belote = noBelote(format), pending = Points.ZERO) =>
  format.scorer().score(new Contract(seat(0, format), hearts), tricks, belote, pending).toSnapshot();
const score = (tricks: CollectedTricks, belote = noBelote(FOUR), pending = Points.ZERO) => scoreAt(FOUR, tricks, belote, pending);

const madeDeal = collected([0, 20], [1, 20], [0, 20], [1, 20], [0, 20], [1, 22], [0, 10], [0, 20]);

describe('Comptage des points à 4', () => {
  it('contrat rempli : chaque équipe marque ses points', () => {
    expect(score(madeDeal)).toMatchObject({ outcome: 'made', cardPoints: [100, 62], scored: [100, 62] });
  });

  it('dedans : la défense marque 162', () => {
    const tricks = collected([1, 20], [1, 20], [0, 20], [1, 20], [0, 20], [1, 22], [0, 10], [1, 20]);
    expect(score(tricks)).toMatchObject({ outcome: 'failed', cardPoints: [50, 112], scored: [0, 162] });
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
    const tricks = collected([1, 20], [1, 20], [0, 20], [1, 20], [0, 20], [1, 22], [0, 10], [1, 20]);
    expect(score(tricks, beloteFor(1))).toMatchObject({ outcome: 'failed', scored: [0, 182] });
  });

  it("litige : les points du preneur sont mis en réserve pour l'équipe qui gagne la donne suivante", () => {
    const tie = collected([0, 20], [1, 20], [0, 20], [1, 20], [0, 21], [1, 21], [0, 20], [1, 10]);
    expect(score(tie)).toMatchObject({ outcome: 'litige', scored: [0, 81], pendingLitige: 81 });
    expect(score(madeDeal, noBelote(FOUR), new Points(81))).toMatchObject({ scored: [181, 62], pendingLitige: 0 });
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

  it('capot du preneur : 252 points', () => {
    const tricks = collectedAt(THREE, [0, 20], [0, 20], [0, 20], [0, 20], [0, 20], [0, 20], [0, 10], [0, 2]);
    expect(scoreAt(THREE, tricks)).toMatchObject({ outcome: 'capot', scored: [252, 0, 0] });
  });
});
