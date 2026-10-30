import { RoomView } from '@belote/shared';
import { isTeamGame, myTeam, otherSeats } from './tableLayout';

export interface ScoreColumn {
  team: number;
  label: string;
  isMine: boolean;
}

function teamColumns(room: RoomView): ScoreColumn[] {
  const mine = myTeam(room);
  return [
    { team: mine, label: 'Nous', isMine: true },
    { team: 1 - mine, label: 'Eux', isMine: false },
  ];
}

function soloColumns(room: RoomView): ScoreColumn[] {
  const others = otherSeats(room).map((seat) => ({ team: seat, label: room.seats[seat]?.name ?? '—', isMine: false }));
  return [{ team: room.mySeat, label: 'Vous', isMine: true }, ...others];
}

/** Colonnes de score vues depuis ma place : mon camp d'abord. */
export const scoreColumns = (room: RoomView): ScoreColumn[] => (isTeamGame(room) ? teamColumns(room) : soloColumns(room));

/** Libellé du camp gagnant de la partie. */
export function winnerLabel(room: RoomView, winner: number): string {
  if (winner === myTeam(room)) return '🏆 Victoire !';
  if (isTeamGame(room)) return 'Défaite…';
  return `${room.seats[winner]?.name ?? '—'} gagne la partie`;
}
