import { createServer } from 'node:http';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from 'socket.io';
import { createUseCases } from './application/BeloteUseCases';
import { SimpleBot } from './domain/bot/SimpleBot';
import { createHttpApp } from './infrastructure/http/createHttpApp';
import { InMemoryRoomRepository } from './infrastructure/persistence/InMemoryRoomRepository';
import { MathRandomShuffler } from './infrastructure/random/MathRandomShuffler';
import { RandomRoomCodeGenerator } from './infrastructure/random/RandomRoomCodeGenerator';
import { TimeoutTaskScheduler } from './infrastructure/scheduling/TimeoutTaskScheduler';
import { BeloteServer } from './infrastructure/socket/BeloteServer';
import { SocketGateway } from './infrastructure/socket/SocketGateway';
import { SocketRoomPublisher } from './infrastructure/socket/SocketRoomPublisher';

// Racine de composition : c'est le seul endroit qui connaît toutes les implémentations concrètes.
const port = Number(process.env.PORT ?? 3001);
const clientDistPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../client/dist');

const httpServer = createServer(createHttpApp(clientDistPath));
const io: BeloteServer = new Server(httpServer, { cors: { origin: true } });

const useCases = createUseCases({
  rooms: new InMemoryRoomRepository(),
  publisher: new SocketRoomPublisher(io),
  scheduler: new TimeoutTaskScheduler(),
  codes: new RandomRoomCodeGenerator(),
  shuffler: new MathRandomShuffler(),
  bot: new SimpleBot(),
  delays: { botTurn: 900, collectTrick: 1400, nextDeal: 6000, abandonedRoom: 30 * 60 * 1000 },
});

new SocketGateway(io, useCases).listen();

httpServer.listen(port, () => {
  console.log(`Serveur de belote démarré sur http://localhost:${port}`);
});
