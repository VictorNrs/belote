import { DealResultView, RoomView } from '@belote/shared';
import { winnerLabel } from '../../domain/scoreColumns';
import { DealResultSummary } from './DealResultDialog';
import { Dialog } from './Dialog';

interface GameOverDialogProps {
  room: RoomView;
  winner: number;
  result: DealResultView | null;
  scores: number[];
  takerName: string;
  onReplay(): void;
  onLeave(): void;
}

export function GameOverDialog({ room, winner, result, scores, takerName, onReplay, onLeave }: GameOverDialogProps) {
  return (
    <Dialog title={winnerLabel(room, winner)}>
      {result && <DealResultSummary result={result} room={room} takerName={takerName} scores={scores} />}
      <div className="dialog__actions">
        {room.isHost && (
          <button type="button" className="button button--primary" onClick={onReplay}>
            Rejouer
          </button>
        )}
        {!room.isHost && <p className="result__note">L'hôte peut relancer une partie.</p>}
        <button type="button" className="button" onClick={onLeave}>
          Quitter
        </button>
      </div>
    </Dialog>
  );
}
