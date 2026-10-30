import { RoomView } from '@belote/shared';
import { useEffect } from 'react';
import { RoomActions, useRoom } from '../application/useRoom';
import { HomeScreen } from './screens/HomeScreen';
import { LobbyScreen } from './screens/LobbyScreen';
import { TableScreen } from './screens/TableScreen';

const ERROR_DISPLAY_MS = 3500;

function CurrentScreen({ room, actions, connected }: { room: RoomView | null; actions: RoomActions; connected: boolean }) {
  if (!room) return <HomeScreen actions={actions} connected={connected} />;
  if (!room.game) return <LobbyScreen room={room} actions={actions} />;
  return <TableScreen room={room} game={room.game} actions={actions} />;
}

export function App() {
  const { room, connected, error, clearError, actions } = useRoom();
  const roomCode = room?.code;

  useEffect(() => {
    if (roomCode) window.history.replaceState(null, '', window.location.pathname);
  }, [roomCode]);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(clearError, ERROR_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [error, clearError]);

  return (
    <div className="app">
      {!connected && <div className="banner">Connexion au serveur…</div>}
      <CurrentScreen room={room} actions={actions} connected={connected} />
      {error && (
        <button type="button" className="toast toast--error" onClick={clearError}>
          {error}
        </button>
      )}
    </div>
  );
}
