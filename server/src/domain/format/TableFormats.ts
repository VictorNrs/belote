import { DomainError } from '../shared/DomainError';
import { TableFormat } from '../table/TableFormat';
import { FourPlayerFormat } from './FourPlayerFormat';
import { ThreePlayerFormat } from './ThreePlayerFormat';

const FORMATS: readonly TableFormat[] = [new ThreePlayerFormat(), new FourPlayerFormat()];

export const TableFormats = {
  FOUR_PLAYERS: FORMATS[1] as TableFormat,
  THREE_PLAYERS: FORMATS[0] as TableFormat,

  forPlayerCount(count: number): TableFormat {
    const format = FORMATS.find((candidate) => candidate.playerCount() === count);
    if (!format) throw new DomainError('La belote se joue à 3 ou à 4 joueurs');
    return format;
  },
};
