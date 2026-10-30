import { CardCode } from '@belote/shared';
import { CSSProperties } from 'react';
import { PlayingCard } from './PlayingCard';

interface HandViewProps {
  cards: CardCode[];
  legalCards: CardCode[];
  canPlay: boolean;
  onPlay(card: CardCode): void;
}

export function HandView({ cards, legalCards, canPlay, onPlay }: HandViewProps) {
  const style = { '--count': Math.max(cards.length, 1) } as CSSProperties;
  return (
    <div className="hand" style={style}>
      {cards.map((card) => {
        const playable = canPlay && legalCards.includes(card);
        return (
          <PlayingCard
            key={card}
            card={card}
            playable={playable}
            dimmed={canPlay && !playable}
            onSelect={playable ? () => onPlay(card) : undefined}
          />
        );
      })}
    </div>
  );
}
