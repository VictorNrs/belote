export type TablePosition = 'bottom' | 'right' | 'top' | 'left';

const SEAT_COUNT = 4;

/** Le jeu tourne vers la droite : le joueur suivant est à droite, le partenaire en face. */
const POSITIONS: readonly TablePosition[] = ['bottom', 'right', 'top', 'left'];

export function positionOf(seat: number, mySeat: number): TablePosition {
  return POSITIONS[(seat - mySeat + SEAT_COUNT) % SEAT_COUNT] ?? 'bottom';
}

export const teamOf = (seat: number): number => seat % 2;

/** Libellé d'équipe vu depuis la place du joueur : « Nous » ou « Eux ». */
export const teamLabel = (team: number, mySeat: number): string => (team === teamOf(mySeat) ? 'Nous' : 'Eux');

/** Index des équipes dans l'ordre d'affichage : la mienne d'abord. */
export const teamsFromMyView = (mySeat: number): [number, number] => [teamOf(mySeat), 1 - teamOf(mySeat)] as [number, number];
