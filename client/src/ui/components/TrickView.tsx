import { PlayedCardView, RoomView } from '@belote/shared';
import { positionOf } from '../../domain/tableLayout';
import { PlayingCard } from './PlayingCard';

interface TrickViewProps {
  trick: PlayedCardView[];
  room: RoomView;
}

export function TrickView({ trick, room }: TrickViewProps) {
  return (
    <div className="trick">
      {trick.map(({ seat, card }) => (
        <div key={card} className={`trick__slot trick__slot--${positionOf(seat, room)}`}>
          <PlayingCard card={card} size="table" />
        </div>
      ))}
    </div>
  );
}
