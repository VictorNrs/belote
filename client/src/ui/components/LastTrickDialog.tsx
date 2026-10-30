import { SeatView, TrickView as TrickData } from '@belote/shared';
import { Dialog } from './Dialog';
import { TrickView } from './TrickView';

interface LastTrickDialogProps {
  trick: TrickData;
  mySeat: number;
  seats: (SeatView | null)[];
  onClose(): void;
}

export function LastTrickDialog({ trick, mySeat, seats, onClose }: LastTrickDialogProps) {
  return (
    <Dialog title="Dernier pli" onClose={onClose}>
      <div className="last-trick">
        <TrickView trick={trick.cards} mySeat={mySeat} />
      </div>
      <p className="result__note">Remporté par {seats[trick.winner]?.name ?? '—'}</p>
      <button type="button" className="button button--primary button--block" onClick={onClose}>
        Fermer
      </button>
    </Dialog>
  );
}
