import { GAME_TARGETS, PLAYER_COUNTS, PlayerCount } from '@belote/shared';
import { FormEvent, useState } from 'react';
import { useServices } from '../../application/GameContext';
import { RoomActions } from '../../application/useRoom';
import { Segmented } from '../components/Segmented';

interface HomeScreenProps {
  actions: RoomActions;
  connected: boolean;
}

const TARGET_OPTIONS = GAME_TARGETS.map((value) => ({ value: value as number, label: String(value) }));
const PLAYER_OPTIONS = PLAYER_COUNTS.map((value) => ({ value, label: `À ${value} joueurs` }));

const roomCodeFromUrl = (): string => new URLSearchParams(window.location.search).get('salle')?.toUpperCase() ?? '';

function JoinForm({ actions, canAct }: { actions: RoomActions; canAct: boolean }) {
  const [code, setCode] = useState(roomCodeFromUrl);
  const join = (event: FormEvent) => {
    event.preventDefault();
    void actions.joinRoom(code);
  };
  return (
    <form className="panel" onSubmit={join}>
      <span className="field__label">Rejoindre une table</span>
      <div className="join">
        <input
          className="input input--code"
          value={code}
          maxLength={4}
          placeholder="CODE"
          autoCapitalize="characters"
          onChange={(event) => setCode(event.target.value.toUpperCase())}
        />
        <button type="submit" className="button button--primary" disabled={!canAct || code.length !== 4}>
          Rejoindre
        </button>
      </div>
    </form>
  );
}

export function HomeScreen({ actions, connected }: HomeScreenProps) {
  const { profile } = useServices();
  const [name, setName] = useState(profile.name());
  const [target, setTarget] = useState<number>(1000);
  const [players, setPlayers] = useState<PlayerCount>(4);
  const canAct = connected && name.trim().length > 0;

  const updateName = (value: string) => {
    setName(value);
    profile.rememberName(value);
  };

  return (
    <main className="home">
      <h1 className="home__title">
        Belote <span className="home__suits">♠ ♥ ♣ ♦</span>
      </h1>
      <label className="field">
        <span className="field__label">Votre pseudo</span>
        <input className="input" value={name} maxLength={20} placeholder="Ex. : Camille" onChange={(event) => updateName(event.target.value)} />
      </label>

      <section className="panel">
        <span className="field__label">Nouvelle partie</span>
        <Segmented<PlayerCount> label="Nombre de joueurs" options={PLAYER_OPTIONS} value={players} onChange={setPlayers} />
        <Segmented label="Partie en" options={TARGET_OPTIONS} value={target} onChange={setTarget} />
        <button
          type="button"
          className="button button--primary button--block"
          disabled={!canAct}
          onClick={() => actions.createRoom({ target, players, withBots: true })}
        >
          Jouer contre des robots
        </button>
        <button type="button" className="button button--block" disabled={!canAct} onClick={() => actions.createRoom({ target, players, withBots: false })}>
          Créer une table entre amis
        </button>
      </section>

      <JoinForm actions={actions} canAct={canAct} />
    </main>
  );
}
