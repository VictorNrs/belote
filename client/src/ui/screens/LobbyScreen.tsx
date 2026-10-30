import { RoomView, SeatView } from '@belote/shared';
import { useState } from 'react';
import { RoomActions } from '../../application/useRoom';
import { isTeamGame, seatCaption, tableDescription } from '../../domain/tableLayout';
import { classNames } from '../classNames';

interface LobbyProps {
  room: RoomView;
  actions: RoomActions;
}

interface SeatCardProps extends LobbyProps {
  seat: number;
  occupant: SeatView | null;
}

function FreeSeat({ seat, room, actions }: Omit<SeatCardProps, 'occupant'>) {
  return (
    <>
      <span className="seat__name seat__name--free">Place libre</span>
      <div className="seat__actions">
        <button type="button" className="button button--small" onClick={() => actions.sit(seat)}>
          S'asseoir
        </button>
        {room.isHost && (
          <button type="button" className="button button--small" onClick={() => actions.addBot(seat)}>
            + Robot
          </button>
        )}
      </div>
    </>
  );
}

function OccupiedSeat({ seat, occupant, room, actions }: SeatCardProps & { occupant: SeatView }) {
  const canRemoveBot = occupant.isBot && room.isHost;
  return (
    <>
      <span className="seat__name">
        {occupant.isHost && '👑 '}
        {occupant.name}
        {occupant.isBot && ' 🤖'}
        {seat === room.mySeat && ' (vous)'}
      </span>
      {canRemoveBot && (
        <button type="button" className="button button--small" onClick={() => actions.removeBot(seat)}>
          Retirer
        </button>
      )}
    </>
  );
}

function SeatCard({ seat, occupant, room, actions }: SeatCardProps) {
  return (
    <li className={classNames('seat', isTeamGame(room) && `seat--team${seat % 2}`, seat === room.mySeat && 'seat--mine')}>
      <span className="seat__team">{seatCaption(seat, room)}</span>
      {occupant ? (
        <OccupiedSeat seat={seat} occupant={occupant} room={room} actions={actions} />
      ) : (
        <FreeSeat seat={seat} room={room} actions={actions} />
      )}
    </li>
  );
}

function ShareCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/?salle=${code}`;
  const share = async () => {
    if (navigator.share) return navigator.share({ title: 'Belote', text: `Rejoins ma table de belote : ${code}`, url: link }).catch(() => undefined);
    await navigator.clipboard?.writeText(link).catch(() => undefined);
    setCopied(true);
  };
  return (
    <button type="button" className="room-code" onClick={share}>
      <span className="room-code__label">Code de la table</span>
      <strong className="room-code__value">{code}</strong>
      <span className="room-code__hint">{copied ? 'Lien copié !' : 'Toucher pour partager'}</span>
    </button>
  );
}

export function LobbyScreen({ room, actions }: LobbyProps) {
  const isFull = room.seats.every((seat) => seat !== null);
  return (
    <main className="lobby">
      <ShareCode code={room.code} />
      <p className="lobby__info">
        Partie en {room.target} points. {tableDescription(room)}
      </p>
      <ul className="seats">
        {room.seats.map((occupant, seat) => (
          <SeatCard key={seat} seat={seat} occupant={occupant} room={room} actions={actions} />
        ))}
      </ul>
      {room.isHost && (
        <button type="button" className="button button--primary button--block" disabled={!isFull} onClick={() => actions.start()}>
          {isFull ? 'Lancer la partie' : `En attente de ${room.playerCount} joueurs…`}
        </button>
      )}
      {!room.isHost && <p className="lobby__info">En attente du lancement par l'hôte…</p>}
      <button type="button" className="button button--ghost button--block" onClick={() => actions.leave()}>
        Quitter la table
      </button>
    </main>
  );
}
