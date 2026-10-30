import { ReactElement } from 'react';
import { FigureRank } from '../../domain/cardFace';

interface FaceFigureProps {
  figure: FigureRank;
  isRed: boolean;
  symbol: string;
}

const SKIN = '#f3d6b6';
const GOLD = '#e2b33c';
const INK = '#2b2118';

function Crown() {
  return (
    <>
      <path d="M21 13 L23 5 L26.5 10 L30 3 L33.5 10 L37 5 L39 13 Z" fill={GOLD} stroke={INK} strokeWidth="0.6" />
      <circle cx="30" cy="3.5" r="1.2" fill="#c62828" />
      <path d="M24 26 Q30 34 36 26 Q35 31 30 32 Q25 31 24 26 Z" fill="#7a4b2a" />
    </>
  );
}

function Tiara() {
  return (
    <>
      <path d="M21 22 Q19 10 30 9 Q41 10 39 22 Q38 15 30 14 Q22 15 21 22 Z" fill="#8a3b1e" />
      <path d="M23 11 Q30 5 37 11 L35 12 Q30 9 25 12 Z" fill={GOLD} stroke={INK} strokeWidth="0.5" />
      <circle cx="30" cy="8" r="1.1" fill="#2e7dd7" />
    </>
  );
}

function Cap() {
  return (
    <>
      <path d="M20 14 Q30 4 40 14 Z" fill="#2f6b3a" stroke={INK} strokeWidth="0.6" />
      <path d="M38 12 Q46 4 44 13" fill="none" stroke="#d9d2c3" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M23 16 Q30 13 37 16" fill="none" stroke="#6b4423" strokeWidth="2.2" />
    </>
  );
}

const HEADWEAR: Record<FigureRank, () => ReactElement> = { K: Crown, Q: Tiara, J: Cap };

/** Moitié de figure : buste et tête, dessinée dans un repère de 60 × 42. */
function HalfFigure({ figure, robe }: { figure: FigureRank; robe: string }) {
  const Headwear = HEADWEAR[figure];
  return (
    <g>
      <path d="M12 42 Q14 30 30 28 Q46 30 48 42 Z" fill={robe} stroke={INK} strokeWidth="0.6" />
      <path d="M22 30 L30 36 L38 30" fill="none" stroke={GOLD} strokeWidth="1.6" />
      <circle cx="30" cy="20" r="7.5" fill={SKIN} stroke={INK} strokeWidth="0.6" />
      <circle cx="27.3" cy="19.5" r="0.8" fill={INK} />
      <circle cx="32.7" cy="19.5" r="0.8" fill={INK} />
      <path d="M28 23.5 Q30 25 32 23.5" fill="none" stroke="#a5523a" strokeWidth="0.7" />
      <Headwear />
    </g>
  );
}

/** Portrait à deux têtes des valets, dames et rois (illustration originale). */
export function FaceFigure({ figure, isRed, symbol }: FaceFigureProps) {
  const robe = isRed ? '#c62828' : '#24467a';
  return (
    <svg className="card__figure" viewBox="0 0 60 84" aria-hidden="true">
      <rect x="1" y="1" width="58" height="82" rx="4" fill="#fbf3df" stroke={robe} strokeWidth="1.4" />
      <HalfFigure figure={figure} robe={robe} />
      <g transform="rotate(180 30 42)">
        <HalfFigure figure={figure} robe={robe} />
      </g>
      <line x1="4" y1="42" x2="56" y2="42" stroke={robe} strokeWidth="0.6" strokeDasharray="2 2" />
      <text x="7" y="13" className="card__figure-suit" fill={isRed ? '#c62828' : '#1b1b1f'}>
        {symbol}
      </text>
    </svg>
  );
}
