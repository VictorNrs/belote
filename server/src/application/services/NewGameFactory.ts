import { Shuffler } from '../../domain/card/Shuffler';
import { Game } from '../../domain/game/Game';
import { GameSettings } from '../../domain/game/GameSettings';
import { CardDealer } from '../../domain/play/CardDealer';
import { RoomRules } from '../../domain/room/RoomRules';

/** Crée une partie avec un donneur tiré au sort. */
export class NewGameFactory {
  constructor(private readonly shuffler: Shuffler) {}

  create = (rules: RoomRules): Game => {
    const firstDealer = this.shuffler.shuffle(rules.format.seats())[0] ?? rules.format.seat(0);
    return Game.start(new GameSettings(rules.target, new CardDealer(this.shuffler), rules.announces), firstDealer);
  };
}
