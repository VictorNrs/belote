import { GameView, RoomView } from '@belote/shared';
import { isRedSuit, suitSymbol } from '../../domain/cardFace';
import { scoreColumns } from '../../domain/scoreColumns';
import { classNames } from '../classNames';

interface ScoreBarProps {
  room: RoomView;
  game: GameView;
  takerName: string | null;
  onLeave(): void;
}

export function ScoreBar({ room, game, takerName, onLeave }: ScoreBarProps) {
  const trump = game.contract?.trump;
  return (
    <header className="scorebar">
      <div className="scorebar__scores">
        {scoreColumns(room).map(({ team, label, isMine }) => (
          <span key={team} className={classNames('score', isMine && 'score--mine')}>
            <span className="score__label">{label}</span>
            <strong>{game.scores[team]}</strong>
            <span className="score__tricks">{game.tricksWon[team]} pli(s)</span>
          </span>
        ))}
        <span className="scorebar__target">/ {game.target}</span>
      </div>
      <div className="scorebar__info">
        {trump && (
          <span className={classNames('trump', isRedSuit(trump) && 'trump--red')} title={`Pris par ${takerName ?? ''}`}>
            Atout {suitSymbol(trump)}
          </span>
        )}
        <button type="button" className="icon-button" onClick={onLeave} aria-label="Quitter la partie">
          ✕
        </button>
      </div>
    </header>
  );
}
