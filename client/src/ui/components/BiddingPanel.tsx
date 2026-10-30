import { BidPayload, GameView, SuitCode } from '@belote/shared';
import { ALL_SUITS, isRedSuit, suitName, suitOf, suitSymbol } from '../../domain/cardFace';
import { classNames } from '../classNames';
import { PlayingCard } from './PlayingCard';

interface BiddingPanelProps {
  game: GameView;
  mySeat: number;
  bidderName: string;
  onBid(payload: BidPayload): void;
}

interface BidChoicesProps {
  proposedSuit: SuitCode;
  isFirstRound: boolean;
  onBid(payload: BidPayload): void;
}

function SuitChoices({ excluded, onBid }: { excluded: SuitCode; onBid(payload: BidPayload): void }) {
  return (
    <>
      {ALL_SUITS.filter((suit) => suit !== excluded).map((suit) => (
        <button
          key={suit}
          type="button"
          className={classNames('button', 'button--suit', isRedSuit(suit) && 'button--red')}
          onClick={() => onBid({ take: true, suit })}
          aria-label={`Prendre à ${suitName(suit)}`}
        >
          {suitSymbol(suit)}
        </button>
      ))}
    </>
  );
}

function BidChoices({ proposedSuit, isFirstRound, onBid }: BidChoicesProps) {
  return (
    <div className="bidding__actions">
      {isFirstRound && (
        <button type="button" className="button button--primary" onClick={() => onBid({ take: true, suit: null })}>
          Prendre
        </button>
      )}
      {!isFirstRound && <SuitChoices excluded={proposedSuit} onBid={onBid} />}
      <button type="button" className="button" onClick={() => onBid({ take: false, suit: null })}>
        Passer
      </button>
    </div>
  );
}

export function BiddingPanel({ game, mySeat, bidderName, onBid }: BiddingPanelProps) {
  if (!game.proposedCard) return null;
  const proposedSuit = suitOf(game.proposedCard);
  const isFirstRound = game.biddingRound === 1;
  const hint = isFirstRound ? `Tour 1 : prendre à ${suitName(proposedSuit)} ?` : 'Tour 2 : choisir une autre couleur ?';
  return (
    <div className="bidding">
      <PlayingCard card={game.proposedCard} size="table" />
      <p className="bidding__hint">{hint}</p>
      {game.turn === mySeat ? (
        <BidChoices proposedSuit={proposedSuit} isFirstRound={isFirstRound} onBid={onBid} />
      ) : (
        <p className="bidding__waiting">{bidderName} réfléchit…</p>
      )}
    </div>
  );
}
