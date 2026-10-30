import { PlayerProfile } from '../application/PlayerProfile';

const ID_KEY = 'belote.playerId';
const NAME_KEY = 'belote.playerName';

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Stockage indisponible (navigation privée) : le profil ne vivra que le temps de la page.
  }
}

function randomId(): string {
  const random = () => Math.random().toString(36).slice(2);
  return typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${random()}${random()}`;
}

/** Profil conservé dans le navigateur : l'identifiant permet de retrouver sa place après un rechargement. */
export class LocalPlayerProfile implements PlayerProfile {
  private readonly id: string;
  private currentName: string;

  constructor() {
    this.id = read(ID_KEY) ?? randomId();
    this.currentName = read(NAME_KEY) ?? '';
    write(ID_KEY, this.id);
  }

  playerId(): string {
    return this.id;
  }

  name(): string {
    return this.currentName;
  }

  rememberName(name: string): void {
    this.currentName = name.trim();
    write(NAME_KEY, this.currentName);
  }
}
