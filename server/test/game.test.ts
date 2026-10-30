import { describe, expect, it } from 'vitest';
import { Card } from '../src/domain/card/Card';
import { Points } from '../src/domain/card/Points';
import { Bid } from '../src/domain/bidding/Bid';
import { SimpleBot } from '../src/domain/bot/SimpleBot';
import { Game } from '../src/domain/game/Game';
import { GameSettings } from '../src/domain/game/GameSettings';
import { CardDealer } from '../src/domain/play/CardDealer';
import { Seat } from '../src/domain/table/Seat';
import { seededShuffler } from './helpers';

const newGame = (seed: number, target = 1000) =>
  Game.start(new GameSettings(new Points(target), new CardDealer(seededShuffler(seed))), Seat.of(0));

const bot = new SimpleBot();

function playToTheEnd(game: Game): void {
  const maxSteps = 20_000;
  for (let step = 0; step < maxSteps && !game.isOver(); step++) {
    const actor = game.playerToAct();
    if (actor) game.actAsBot(actor, bot);
    if (!actor) game.advance();
  }
}

describe('Partie complète', () => {
  it('distribue 5 cartes à chacun et retourne une carte', () => {
    const snapshot = newGame(1).snapshotFor(Seat.of(1));
    expect(snapshot.phase).toBe('bidding');
    expect(snapshot.handSizes).toEqual([5, 5, 5, 5]);
    expect(snapshot.proposedCard).not.toBeNull();
    expect(snapshot.turn).toBe(1);
  });

  it('le preneur reçoit la retourne : tout le monde a 8 cartes', () => {
    const game = newGame(2);
    const proposed = game.snapshotFor(Seat.of(1)).proposedCard as string;
    game.bid(Seat.of(1), Bid.take());
    const snapshot = game.snapshotFor(Seat.of(1));
    expect(snapshot.phase).toBe('playing');
    expect(snapshot.handSizes).toEqual([8, 8, 8, 8]);
    expect(snapshot.hand).toContain(proposed);
    expect(snapshot.contract).toEqual({ taker: 1, trump: Card.fromCode(proposed).suit().toCode() });
  });

  it('refuse une action hors de son tour', () => {
    expect(() => newGame(3).bid(Seat.of(2), Bid.pass())).toThrow("Ce n'est pas votre tour");
  });

  it('redistribue quand tout le monde passe deux fois', () => {
    const game = newGame(4);
    Seat.of(1).roundFromHere().forEach((seat) => game.bid(seat, Bid.pass()));
    expect(game.snapshotFor(Seat.of(0)).biddingRound).toBe(2);
    Seat.of(1).roundFromHere().forEach((seat) => game.bid(seat, Bid.pass()));
    const snapshot = game.snapshotFor(Seat.of(0));
    expect(snapshot.dealer).toBe(1);
    expect(snapshot.biddingRound).toBe(1);
    expect(snapshot.announcement?.text).toContain('nouvelle donne');
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8])('quatre robots terminent une partie (graine %i)', (seed) => {
    const game = newGame(seed, 500);
    playToTheEnd(game);
    const snapshot = game.snapshotFor(Seat.of(0));
    expect(snapshot.phase).toBe('gameOver');
    expect(snapshot.winner).not.toBeNull();
    expect(Math.max(...snapshot.scores)).toBeGreaterThanOrEqual(500);
  });
});
