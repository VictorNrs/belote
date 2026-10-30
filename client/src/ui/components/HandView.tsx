import { CardCode } from '@belote/shared';
import { CSSProperties, useEffect, useState } from 'react';
import { useSwipeUp } from '../hooks/useSwipeUp';
import { PlayingCard } from './PlayingCard';

interface HandViewProps {
  cards: CardCode[];
  legalCards: CardCode[];
  canPlay: boolean;
  onPlay(card: CardCode): void;
}

interface HandCardProps {
  card: CardCode;
  index: number;
  playable: boolean;
  dimmed: boolean;
  selected: boolean;
  onTap(): void;
  onPlay(): void;
}

function HandCard({ card, index, playable, dimmed, selected, onTap, onPlay }: HandCardProps) {
  const swipe = useSwipeUp(() => playable && onPlay());
  const tap = () => !swipe.consumeSwipe() && onTap();
  return (
    <span className="hand__slot" style={{ '--i': index } as CSSProperties} onPointerDown={swipe.onPointerDown} onPointerUp={swipe.onPointerUp}>
      <PlayingCard card={card} playable={playable} dimmed={dimmed} selected={selected} onSelect={playable ? tap : undefined} />
    </span>
  );
}

/** Main du joueur : un premier toucher sélectionne la carte, un second la joue ; glisser vers le haut la joue aussitôt. */
export function HandView({ cards, legalCards, canPlay, onPlay }: HandViewProps) {
  const [selected, setSelected] = useState<CardCode | null>(null);
  useEffect(() => setSelected(null), [canPlay]);

  const play = (card: CardCode) => {
    setSelected(null);
    onPlay(card);
  };

  return (
    <div className="hand-area">
      <p className="hand__hint">{selected ? 'Touchez à nouveau pour jouer, ou glissez vers le haut' : ' '}</p>
      <div className="hand" style={{ '--count': Math.max(cards.length, 1) } as CSSProperties}>
        {cards.map((card, index) => {
          const playable = canPlay && legalCards.includes(card);
          const isSelected = selected === card;
          return (
            <HandCard
              key={card}
              card={card}
              index={index}
              playable={playable}
              dimmed={canPlay && !playable}
              selected={isSelected}
              onTap={() => (isSelected ? play(card) : setSelected(card))}
              onPlay={() => play(card)}
            />
          );
        })}
      </div>
    </div>
  );
}
