import { CardCode, RankCode, SuitCode } from '@belote/shared';

const RANK_LABELS: Record<RankCode, string> = {
  '7': '7',
  '8': '8',
  '9': '9',
  '10': '10',
  J: 'V',
  Q: 'D',
  K: 'R',
  A: 'A',
};

const SUIT_SYMBOLS: Record<SuitCode, string> = { S: '♠', H: '♥', D: '♦', C: '♣' };
const SUIT_NAMES: Record<SuitCode, string> = { S: 'Pique', H: 'Cœur', D: 'Carreau', C: 'Trèfle' };

export type FigureRank = 'J' | 'Q' | 'K';
const FIGURES: readonly string[] = ['J', 'Q', 'K'];

export const ALL_SUITS: readonly SuitCode[] = ['S', 'H', 'C', 'D'];

export interface CardFace {
  rank: string;
  symbol: string;
  isRed: boolean;
  label: string;
  /** Valet, dame ou roi : la carte porte un portrait. */
  figure: FigureRank | null;
}

export const suitOf = (card: CardCode): SuitCode => card.slice(-1) as SuitCode;
export const suitSymbol = (suit: SuitCode): string => SUIT_SYMBOLS[suit];
export const suitName = (suit: SuitCode): string => SUIT_NAMES[suit];
export const isRedSuit = (suit: SuitCode): boolean => suit === 'H' || suit === 'D';

/** Traduit un code carte ("JH") en éléments d'affichage (« V ♥ »). */
export function cardFace(card: CardCode): CardFace {
  const suit = suitOf(card);
  const rankCode = card.slice(0, -1) as RankCode;
  const rank = RANK_LABELS[rankCode];
  const figure = FIGURES.includes(rankCode) ? (rankCode as FigureRank) : null;
  return { rank, symbol: SUIT_SYMBOLS[suit], isRed: isRedSuit(suit), label: `${rank} de ${SUIT_NAMES[suit]}`, figure };
}
