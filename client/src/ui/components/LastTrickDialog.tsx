import { RoomView, TrickView as TrickData } from '@belote/shared';
import { Dialog } from './Dialog';
import { TrickView } from './TrickView';

interface LastTrickDialogProps {
  trick: TrickData;
  room: RoomView;
  onClose(): void;
}

export function LastTrickDialog({ trick, room, onClose }: LastTrickDialogProps) {
  return (
    <Dialog title="Dernier pli" onClose={onClose}>
      <div className="last-trick">
        <TrickView trick={trick.cards} room={room} />
      </div>
      <p className="result__note">Remporté par {room.seats[trick.winner]?.name ?? '—'}</p>
      <button type="button" className="button button--primary button--block" onClick={onClose}>
        Fermer
      </button>
    </Dialog>
  );
}
