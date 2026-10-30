import { GAME_TARGETS } from '@belote/shared';
import { FormEvent, useState } from 'react';
import { useServices } from '../../application/GameContext';
import { RoomActions } from '../../application/useRoom';
import { classNames } from '../classNames';

interface HomeScreenProps {
  actions: RoomActions;
  connected: boolean;
}

const roomCodeFromUrl = (): string => new URLSearchParams(window.location.search).get('salle')?.toUpperCase() ?? '';

function TargetPicker({ target, onChange }: { target: number; onChange(target: number): void }) {
  return (
    <div className="segmented" role="radiogroup" aria-label="Partie en">
      {GAME_TARGETS.map((value) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={value === target}
          className={classNames('segmented__option', value === target && 'segmented__option--active')}
          onClick={() => onChange(value)}
        >
          {value}
        </button>
      ))}
    </div>
  );
}

export function HomeScreen({ actions, connected }: HomeScreenProps) {
  const { profile } = useServices();
  const [name, setName] = useState(profile.name());
  const [code, setCode] = useState(roomCodeFromUrl);
  const [target, setTarget] = useState<number>(1000);
  const canAct = connected && name.trim().length > 0;

  const updateName = (value: string) => {
    setName(value);
    profile.rememberName(value);
  };

  const join = (event: FormEvent) => {
    event.preventDefault();
    void actions.joinRoom(code);
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
        <span className="field__label">Partie en</span>
        <TargetPicker target={target} onChange={setTarget} />
        <button type="button" className="button button--primary button--block" disabled={!canAct} onClick={() => actions.createRoom(target, true)}>
          Jouer contre des robots
        </button>
        <button type="button" className="button button--block" disabled={!canAct} onClick={() => actions.createRoom(target, false)}>
          Créer une table entre amis
        </button>
      </section>

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
    </main>
  );
}
