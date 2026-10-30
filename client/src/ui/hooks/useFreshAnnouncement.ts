import { AnnouncementView } from '@belote/shared';
import { useEffect, useRef, useState } from 'react';

const DISPLAY_MS = 2500;

/**
 * Affiche brièvement chaque nouvelle annonce (belote, redistribution...).
 * Le serveur renvoie la dernière annonce avec chaque état de la partie : seul un changement d'identifiant
 * déclenche l'affichage, et celle déjà présente à l'arrivée sur la table n'est pas rejouée.
 */
export function useFreshAnnouncement(announcement: AnnouncementView | null): AnnouncementView | null {
  const lastShownId = useRef(announcement?.id ?? 0);
  const [visible, setVisible] = useState<AnnouncementView | null>(null);

  useEffect(() => {
    if (!announcement || announcement.id === lastShownId.current) return;
    lastShownId.current = announcement.id;
    setVisible(announcement);
  }, [announcement]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(null), DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [visible]);

  return visible;
}
