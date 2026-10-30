import { Points } from '../../domain/card/Points';
import { Shuffler } from '../../domain/card/Shuffler';
import { Game } from '../../domain/game/Game';
import { GameSettings } from '../../domain/game/GameSettings';
import { CardDealer } from '../../domain/play/CardDealer';
import { TableFormat } from '../../domain/table/TableFormat';

/** Crée une partie avec un donneur tiré au sort. */
export class NewGameFactory {
  constructor(private readonly shuffler: Shuffler) {}

  create = (target: Points, format: TableFormat): Game => {
    const firstDealer = this.shuffler.shuffle(format.seats())[0] ?? format.seat(0);
    return Game.start(new GameSettings(target, new CardDealer(this.shuffler)), firstDealer);
  };
}
