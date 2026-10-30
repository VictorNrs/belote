import { AnnounceRule } from '../announce/AnnounceRule';
import { Points } from '../card/Points';
import { Game } from '../game/Game';
import { TableFormat } from '../table/TableFormat';

/** Réglages choisis à la création de la salle. */
export interface RoomRules {
  target: Points;
  format: TableFormat;
  announces: AnnounceRule;
}

export type GameFactory = (rules: RoomRules) => Game;
