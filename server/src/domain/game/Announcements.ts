import { Seat } from '../table/Seat';
import { AnnouncementSnapshot } from './GameSnapshot';

/** Dernière annonce faite à la table (belote, redistribution...), numérotée pour l'affichage. */
export class Announcements {
  static readonly NONE = new Announcements(0, null);

  private constructor(
    private readonly count: number,
    private readonly latest: AnnouncementSnapshot | null,
  ) {}

  announce(seat: Seat | null, text: string): Announcements {
    const id = this.count + 1;
    return new Announcements(id, { id, seat: seat?.toIndex() ?? null, text });
  }

  toSnapshot(): AnnouncementSnapshot | null {
    return this.latest;
  }
}
