import { CardCode } from '@belote/shared';
import { CSSProperties } from 'react';
import { CardFace, cardFace } from '../../domain/cardFace';
import { classNames } from '../classNames';
import { FaceFigure } from './FaceFigure';

type CardSize = 'hand' | 'table' | 'mini';

interface CardLook {
  size?: CardSize;
  playable?: boolean;
  dimmed?: boolean;
  selected?: boolean;
}

interface PlayingCardProps extends CardLook {
  card: CardCode;
  style?: CSSProperties;
  onSelect?: () => void;
}

const cardClassName = (isRed: boolean, { size = 'hand', playable, dimmed, selected }: CardLook): string =>
  classNames('card', `card--${size}`, isRed && 'card--red', playable && 'card--playable', dimmed && 'card--dimmed', selected && 'card--selected');

function CardCenter({ face }: { face: CardFace }) {
  if (face.figure) return <FaceFigure figure={face.figure} isRed={face.isRed} symbol={face.symbol} />;
  return <span className="card__pip">{face.symbol}</span>;
}

export function PlayingCard({ card, style, onSelect, ...look }: PlayingCardProps) {
  const face = cardFace(card);
  return (
    <button type="button" className={cardClassName(face.isRed, look)} style={style} onClick={onSelect} disabled={!onSelect} aria-label={face.label}>
      <CardCenter face={face} />
      <span className="card__corner">
        <span>{face.rank}</span>
        <span>{face.symbol}</span>
      </span>
    </button>
  );
}

export function CardBack({ size = 'mini' }: { size?: CardSize }) {
  return <span className={classNames('card', 'card--back', `card--${size}`)} aria-hidden="true" />;
}
