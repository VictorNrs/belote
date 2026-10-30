import { DealResultView } from '@belote/shared';
import { teamOf } from '../../domain/tableLayout';
import { DealResultSummary } from './DealResultDialog';
import { Dialog } from './Dialog';

interface GameOverDialogProps {
  winner: number;
  result: DealResultView | null;
  scores: number[];
  mySeat: number;
  takerName: string;
  isHost: boolean;
  onReplay(): void;
  onLeave(): void;
}

export function GameOverDialog({ winner, result, scores, mySeat, takerName, isHost, onReplay, onLeave }: GameOverDialogProps) {
  const hasWon = winner === teamOf(mySeat);
  return (
    <Dialog title={hasWon ? '🏆 Victoire !' : 'Défaite…'}>
      {result && <DealResultSummary result={result} mySeat={mySeat} takerName={takerName} scores={scores} />}
      <div className="dialog__actions">
        {isHost && (
          <button type="button" className="button button--primary" onClick={onReplay}>
            Rejouer
          </button>
        )}
        {!isHost && <p className="result__note">L'hôte peut relancer une partie.</p>}
        <button type="button" className="button" onClick={onLeave}>
          Quitter
        </button>
      </div>
    </Dialog>
  );
}
