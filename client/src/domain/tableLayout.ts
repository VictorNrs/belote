import { RoomView } from '@belote/shared';

export type TablePosition = 'bottom' | 'right' | 'top' | 'left';

type TableShape = Pick<RoomView, 'playerCount' | 'mySeat'>;

/** Le jeu tourne vers la droite : le joueur suivant est à droite (à 4, le partenaire est en face). */
const POSITIONS: Record<number, readonly TablePosition[]> = {
  3: ['bottom', 'right', 'left'],
  4: ['bottom', 'right', 'top', 'left'],
};

export function positionOf(seat: number, table: TableShape): TablePosition {
  const positions = POSITIONS[table.playerCount] ?? [];
  return positions[(seat - table.mySeat + table.playerCount) % table.playerCount] ?? 'bottom';
}

/** Les autres places, dans l'ordre du jeu à partir de la mienne. */
export const otherSeats = (table: TableShape): number[] =>
  Array.from({ length: table.playerCount - 1 }, (_, offset) => (table.mySeat + offset + 1) % table.playerCount);

/** À 4, on joue en équipes de deux ; à 3, chacun pour soi. */
export const isTeamGame = (table: TableShape): boolean => table.playerCount === 4;

/** Camp qui marque les points d'une place : l'équipe à 4, le joueur lui-même à 3. */
export const teamOf = (seat: number, table: TableShape): number => (isTeamGame(table) ? seat % 2 : seat);

export const myTeam = (table: TableShape): number => teamOf(table.mySeat, table);

/** Légende d'une place dans le salon : son équipe à 4, son numéro à 3. */
export function seatCaption(seat: number, table: TableShape): string {
  if (!isTeamGame(table)) return `Joueur ${seat + 1}`;
  return teamOf(seat, table) === myTeam(table) ? 'Nous' : 'Eux';
}

export const tableDescription = (table: TableShape): string =>
  isTeamGame(table) ? 'Belote à 4 : les partenaires sont assis face à face.' : 'Belote à 3 : chacun pour soi, 24 cartes.';
