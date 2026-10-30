import { PlayedCardView } from '@belote/shared';
import { positionOf } from '../../domain/tableLayout';
import { PlayingCard } from './PlayingCard';

interface TrickViewProps {
  trick: PlayedCardView[];
  mySeat: number;
}

export function TrickView({ trick, mySeat }: TrickViewProps) {
  return (
    <div className="trick">
      {trick.map(({ seat, card }) => (
        <div key={card} className={`trick__slot trick__slot--${positionOf(seat, mySeat)}`}>
          <PlayingCard card={card} size="table" />
        </div>
      ))}
    </div>
  );
}
