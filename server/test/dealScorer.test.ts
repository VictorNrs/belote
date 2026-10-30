import { describe, expect, it } from 'vitest';
import { Points } from '../src/domain/card/Points';
import { Contract } from '../src/domain/bidding/Contract';
import { Belote } from '../src/domain/play/Belote';
import { CollectedTricks } from '../src/domain/play/CollectedTricks';
import { Hands } from '../src/domain/play/Hands';
import { DealScorer } from '../src/domain/scoring/DealScorer';
import { Seat } from '../src/domain/table/Seat';
import { Team } from '../src/domain/table/Team';
import { cards, trumpOf } from './helpers';

const hearts = trumpOf('H');
const takenBySeatZero = new Contract(Seat.of(0), hearts);
const noBelote = Belote.detect(Hands.empty(), hearts);
const beloteFor = (seat: number) => Belote.detect(Hands.empty().give(Seat.of(seat), cards('KH', 'QH')), hearts);

/** Huit plis : [équipe gagnante, points du pli] (le dernier reçoit automatiquement le dix de der). */
const collected = (...tricks: [number, number][]) =>
  tricks.reduce((all, [team, points]) => all.collect(Team.of(team), new Points(points)), CollectedTricks.NONE);

const score = (tricks: CollectedTricks, belote = noBelote, pending = Points.ZERO) =>
  new DealScorer().score(takenBySeatZero, tricks, belote, pending).toSnapshot();

const madeDeal = collected([0, 20], [1, 20], [0, 20], [1, 20], [0, 20], [1, 22], [0, 10], [0, 20]);

describe('Comptage des points', () => {
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
    expect(score(madeDeal, noBelote, new Points(81))).toMatchObject({ scored: [181, 62], pendingLitige: 0 });
  });
});
