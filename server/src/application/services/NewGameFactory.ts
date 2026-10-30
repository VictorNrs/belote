import { Points } from '../../domain/card/Points';
import { Shuffler } from '../../domain/card/Shuffler';
import { Game } from '../../domain/game/Game';
import { GameSettings } from '../../domain/game/GameSettings';
import { CardDealer } from '../../domain/play/CardDealer';
import { Seat } from '../../domain/table/Seat';

/** Crée une partie avec un donneur tiré au sort. */
export class NewGameFactory {
  constructor(private readonly shuffler: Shuffler) {}

  create = (target: Points): Game => {
    const firstDealer = this.shuffler.shuffle(Seat.all())[0] ?? Seat.of(0);
    return Game.start(new GameSettings(target, new CardDealer(this.shuffler)), firstDealer);
  };
}
