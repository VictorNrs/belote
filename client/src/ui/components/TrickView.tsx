import { PlayedCardView, RoomView } from '@belote/shared';
import { positionOf } from '../../domain/tableLayout';
import { classNames } from '../classNames';
import { PlayingCard } from './PlayingCard';

interface TrickViewProps {
  trick: PlayedCardView[];
  room: RoomView;
  /** Quand le pli est complet : les cartes glissent vers le joueur qui le remporte. */
  winner?: number | null;
}

export function TrickView({ trick, room, winner = null }: TrickViewProps) {
  const collectTo = winner === null ? null : positionOf(winner, room);
  return (
    <div className={classNames('trick', collectTo && `trick--to-${collectTo}`)}>
      {trick.map(({ seat, card }) => (
        <div key={card} className={`trick__slot trick__slot--${positionOf(seat, room)}`}>
          <PlayingCard card={card} size="table" />
        </div>
      ))}
    </div>
  );
}
