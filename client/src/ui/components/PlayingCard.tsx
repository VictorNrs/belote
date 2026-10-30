import { CardCode } from '@belote/shared';
import { cardFace } from '../../domain/cardFace';
import { classNames } from '../classNames';

type CardSize = 'hand' | 'table' | 'mini';

interface CardLook {
  size?: CardSize;
  playable?: boolean;
  dimmed?: boolean;
}

interface PlayingCardProps extends CardLook {
  card: CardCode;
  onSelect?: () => void;
}

const cardClassName = (isRed: boolean, { size = 'hand', playable, dimmed }: CardLook): string =>
  classNames('card', `card--${size}`, isRed && 'card--red', playable && 'card--playable', dimmed && 'card--dimmed');

export function PlayingCard({ card, onSelect, ...look }: PlayingCardProps) {
  const face = cardFace(card);
  return (
    <button type="button" className={cardClassName(face.isRed, look)} onClick={onSelect} disabled={!onSelect} aria-label={face.label}>
      <span className="card__corner">
        <span>{face.rank}</span>
        <span>{face.symbol}</span>
      </span>
      <span className="card__pip">{face.symbol}</span>
    </button>
  );
}

export function CardBack({ size = 'mini' }: { size?: CardSize }) {
  return <span className={classNames('card', 'card--back', `card--${size}`)} aria-hidden="true" />;
}
