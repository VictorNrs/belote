import { GameView } from '@belote/shared';
import { isRedSuit, suitSymbol } from '../../domain/cardFace';
import { teamLabel, teamsFromMyView } from '../../domain/tableLayout';
import { classNames } from '../classNames';

interface ScoreBarProps {
  game: GameView;
  mySeat: number;
  takerName: string | null;
  onShowLastTrick(): void;
  onLeave(): void;
}

export function ScoreBar({ game, mySeat, takerName, onShowLastTrick, onLeave }: ScoreBarProps) {
  const trump = game.contract?.trump;
  return (
    <header className="scorebar">
      <div className="scorebar__scores">
        {teamsFromMyView(mySeat).map((team) => (
          <span key={team} className={classNames('score', team === mySeat % 2 && 'score--mine')}>
            <span className="score__label">{teamLabel(team, mySeat)}</span>
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
        <button type="button" className="icon-button" onClick={onShowLastTrick} disabled={!game.lastTrick} aria-label="Voir le dernier pli">
          ↺
        </button>
        <button type="button" className="icon-button" onClick={onLeave} aria-label="Quitter la partie">
          ✕
        </button>
      </div>
    </header>
  );
}
