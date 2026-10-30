/** Port de stockage du profil local du joueur. */
export interface PlayerProfile {
  playerId(): string;
  name(): string;
  rememberName(name: string): void;
}
