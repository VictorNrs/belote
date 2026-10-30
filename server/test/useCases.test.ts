import { RoomView } from '@belote/shared';
import { beforeEach, describe, expect, it } from 'vitest';
import { BeloteUseCases, createUseCases } from '../src/application/BeloteUseCases';
import { RoomPublisher } from '../src/application/ports/RoomPublisher';
import { TaskScheduler } from '../src/application/ports/TaskScheduler';
import { SimpleBot } from '../src/domain/bot/SimpleBot';
import { PlayerId } from '../src/domain/room/PlayerId';
import { InMemoryRoomRepository } from '../src/infrastructure/persistence/InMemoryRoomRepository';
import { RandomRoomCodeGenerator } from '../src/infrastructure/random/RandomRoomCodeGenerator';
import { seededRandom, seededShuffler } from './helpers';

class RecordingPublisher implements RoomPublisher {
  readonly views = new Map<string, RoomView>();

  publish(playerId: PlayerId, view: RoomView): void {
    this.views.set(playerId.toString(), view);
  }
}

/** Planificateur manuel : les tâches s'exécutent quand le test le décide. */
class ManualScheduler implements TaskScheduler {
  private readonly tasks = new Map<string, () => void>();

  schedule(key: string, _delayMs: number, task: () => void): void {
    this.tasks.set(key, task);
  }

  cancel(key: string): void {
    this.tasks.delete(key);
  }

  runAutomation(): boolean {
    const entry = [...this.tasks.entries()].find(([key]) => key.startsWith('automation:'));
    if (!entry) return false;
    this.tasks.delete(entry[0]);
    entry[1]();
    return true;
  }
}

const ALICE = 'alice-0001';
const BOB = 'bob-000002';

describe('Cas d’usage', () => {
  let publisher: RecordingPublisher;
  let scheduler: ManualScheduler;
  let useCases: BeloteUseCases;
  const viewOf = (playerId: string) => publisher.views.get(playerId) as RoomView;

  beforeEach(() => {
    publisher = new RecordingPublisher();
    scheduler = new ManualScheduler();
    useCases = createUseCases({
      rooms: new InMemoryRoomRepository(),
      publisher,
      scheduler,
      codes: new RandomRoomCodeGenerator(seededRandom(42)),
      shuffler: seededShuffler(42),
      bot: new SimpleBot(),
      delays: { botTurn: 0, collectTrick: 0, nextDeal: 0, abandonedRoom: 0 },
    });
  });

  it("crée une salle, accueille un second joueur et réserve le lancement à l'hôte", () => {
    const code = useCases.createRoom.execute({ playerId: ALICE, name: 'Alice', target: 1000, players: 4, withBots: false });
    useCases.joinRoom.execute({ playerId: BOB, name: 'Bob', code });
    expect(viewOf(BOB).mySeat).toBe(1);
    expect(viewOf(ALICE).seats.map((seat) => seat?.name ?? null)).toEqual(['Alice', 'Bob', null, null]);
    expect(() => useCases.startGame.execute({ playerId: BOB })).toThrow("Seul l'hôte");
    expect(() => useCases.startGame.execute({ playerId: ALICE })).toThrow('Il faut 4 joueurs');
  });

  it("change de place et complète la table avec des robots", () => {
    const code = useCases.createRoom.execute({ playerId: ALICE, name: 'Alice', target: 1000, players: 4, withBots: false });
    useCases.joinRoom.execute({ playerId: BOB, name: 'Bob', code });
    useCases.takeSeat.execute({ playerId: BOB, seat: 2 });
    useCases.addBot.execute({ playerId: ALICE, seat: 1 });
    useCases.addBot.execute({ playerId: ALICE, seat: 3 });
    useCases.startGame.execute({ playerId: ALICE });
    expect(viewOf(BOB).mySeat).toBe(2);
    expect(viewOf(ALICE).game?.phase).toBe('bidding');
  });

  it("un robot reprend la place d'un joueur qui quitte la partie, et l'hôte est transmis", () => {
    const code = useCases.createRoom.execute({ playerId: ALICE, name: 'Alice', target: 1000, players: 4, withBots: false });
    useCases.joinRoom.execute({ playerId: BOB, name: 'Bob', code });
    [2, 3].forEach((seat) => useCases.addBot.execute({ playerId: ALICE, seat }));
    useCases.startGame.execute({ playerId: ALICE });
    useCases.leaveRoom.execute({ playerId: ALICE });
    expect(viewOf(BOB).seats[0]).toMatchObject({ isBot: true });
    expect(viewOf(BOB).isHost).toBe(true);
  });

  it.each([4, 3])('une partie à %i contre les robots se joue jusqu’au bout', (players) => {
    useCases.createRoom.execute({ playerId: ALICE, name: 'Alice', target: 500, players, withBots: true });
    expect(viewOf(ALICE).seats).toHaveLength(players);
    for (let step = 0; step < 5000 && viewOf(ALICE).game?.phase !== 'gameOver'; step++) {
      if (scheduler.runAutomation()) continue;
      playHumanTurn();
    }
    expect(viewOf(ALICE).game?.phase).toBe('gameOver');
    const scoringCamps = players === 4 ? 2 : 3;
    expect(viewOf(ALICE).game?.scores).toHaveLength(scoringCamps);
  });

  it('une table à 3 est complète avec 3 joueurs', () => {
    const code = useCases.createRoom.execute({ playerId: ALICE, name: 'Alice', target: 1000, players: 3, withBots: false });
    useCases.joinRoom.execute({ playerId: BOB, name: 'Bob', code });
    useCases.addBot.execute({ playerId: ALICE, seat: 2 });
    expect(() => useCases.joinRoom.execute({ playerId: 'carol-00003', name: 'Carol', code })).toThrow('La table est complète');
    useCases.startGame.execute({ playerId: ALICE });
    expect(viewOf(BOB)).toMatchObject({ playerCount: 3, mySeat: 1 });
    expect(viewOf(BOB).game?.handSizes).toEqual([5, 5, 5]);
  });

  it('refuse un nombre de joueurs autre que 3 ou 4', () => {
    expect(() => useCases.createRoom.execute({ playerId: ALICE, name: 'Alice', target: 1000, players: 2, withBots: false })).toThrow('3 ou à 4');
  });

  /** Le joueur humain prend si on lui propose au premier tour, sinon passe, et joue sa première carte autorisée. */
  function playHumanTurn(): void {
    const game = viewOf(ALICE).game;
    if (game?.phase === 'bidding') return useCases.placeBid.execute({ playerId: ALICE, take: game.biddingRound === 1, suit: null });
    useCases.playCard.execute({ playerId: ALICE, card: game?.legalCards[0] as string });
  }
});
