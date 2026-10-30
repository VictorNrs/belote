import { describe, expect, it } from 'vitest';
import { Card } from '../src/domain/card/Card';
import { Points } from '../src/domain/card/Points';
import { Rank } from '../src/domain/card/Rank';
import { Bid } from '../src/domain/bidding/Bid';
import { SimpleBot } from '../src/domain/bot/SimpleBot';
import { Game } from '../src/domain/game/Game';
import { GameSettings } from '../src/domain/game/GameSettings';
import { CardDealer } from '../src/domain/play/CardDealer';
import { TableFormat } from '../src/domain/table/TableFormat';
import { FOUR, seat, seededShuffler, THREE } from './helpers';

const newGame = (seed: number, target = 1000, format: TableFormat = FOUR) =>
  Game.start(new GameSettings(new Points(target), new CardDealer(seededShuffler(seed))), format.seat(0));

const bot = new SimpleBot();

function playToTheEnd(game: Game): void {
  const maxSteps = 20_000;
  for (let step = 0; step < maxSteps && !game.isOver(); step++) {
    const actor = game.playerToAct();
    if (actor) game.actAsBot(actor, bot);
    if (!actor) game.advance();
  }
}

describe('Partie à 4', () => {
  it('distribue 5 cartes à chacun et retourne une carte', () => {
    const snapshot = newGame(1).snapshotFor(seat(1));
    expect(snapshot.phase).toBe('bidding');
    expect(snapshot.handSizes).toEqual([5, 5, 5, 5]);
    expect(snapshot.proposedCard).not.toBeNull();
    expect(snapshot.turn).toBe(1);
  });

  it('le preneur reçoit la retourne : tout le monde a 8 cartes', () => {
    const game = newGame(2);
    const proposed = game.snapshotFor(seat(1)).proposedCard as string;
    game.bid(seat(1), Bid.take());
    const snapshot = game.snapshotFor(seat(1));
    expect(snapshot.phase).toBe('playing');
    expect(snapshot.handSizes).toEqual([8, 8, 8, 8]);
    expect(snapshot.hand).toContain(proposed);
    expect(snapshot.contract).toEqual({ taker: 1, trump: Card.fromCode(proposed).suit().toCode() });
  });

  it('refuse une action hors de son tour', () => {
    expect(() => newGame(3).bid(seat(2), Bid.pass())).toThrow("Ce n'est pas votre tour");
  });

  it('redistribue quand tout le monde passe deux fois', () => {
    const game = newGame(4);
    seat(1).roundFromHere().forEach((current) => game.bid(current, Bid.pass()));
    expect(game.snapshotFor(seat(0)).biddingRound).toBe(2);
    seat(1).roundFromHere().forEach((current) => game.bid(current, Bid.pass()));
    const snapshot = game.snapshotFor(seat(0));
    expect(snapshot.dealer).toBe(1);
    expect(snapshot.biddingRound).toBe(1);
    expect(snapshot.announcement?.text).toContain('nouvelle donne');
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8])('quatre robots terminent une partie (graine %i)', (seed) => {
    const game = newGame(seed, 500);
    playToTheEnd(game);
    const snapshot = game.snapshotFor(seat(0));
    expect(snapshot.phase).toBe('gameOver');
    expect(snapshot.winner).not.toBeNull();
    expect(Math.max(...snapshot.scores)).toBeGreaterThanOrEqual(500);
  });
});

describe('Partie à 3', () => {
  it('se joue avec 24 cartes, sans les 7 ni les 8', () => {
    const deck = THREE.deck();
    expect(deck.size()).toBe(24);
    expect(deck.some((card) => card.hasRank(Rank.SEVEN) || card.hasRank(Rank.EIGHT))).toBe(false);
  });

  it('distribue 5 cartes à chacun, puis 8 après la prise', () => {
    const game = newGame(1, 1000, THREE);
    expect(game.snapshotFor(seat(0, THREE)).handSizes).toEqual([5, 5, 5]);
    game.bid(seat(1, THREE), Bid.take());
    const snapshot = game.snapshotFor(seat(1, THREE));
    expect(snapshot.handSizes).toEqual([8, 8, 8]);
    expect(snapshot.tricksWon).toEqual([0, 0, 0]);
    expect(snapshot.scores).toEqual([0, 0, 0]);
  });

  it('chaque joueur parle une fois par tour', () => {
    const game = newGame(2, 1000, THREE);
    seat(1, THREE).roundFromHere().forEach((current) => game.bid(current, Bid.pass()));
    expect(game.snapshotFor(seat(0, THREE)).biddingRound).toBe(2);
  });

  it.each([1, 2, 3, 4, 5, 6])('trois robots terminent une partie (graine %i)', (seed) => {
    const game = newGame(seed, 500, THREE);
    playToTheEnd(game);
    const snapshot = game.snapshotFor(seat(0, THREE));
    expect(snapshot.phase).toBe('gameOver');
    expect(snapshot.scores).toHaveLength(3);
    expect(Math.max(...snapshot.scores)).toBeGreaterThanOrEqual(500);
  });
});
