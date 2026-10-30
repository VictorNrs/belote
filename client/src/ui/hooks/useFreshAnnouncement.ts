import { AnnouncementView } from '@belote/shared';
import { useEffect, useRef, useState } from 'react';

const DISPLAY_MS = 2500;

/** Affiche brièvement chaque nouvelle annonce (belote, redistribution...), sans rejouer celle déjà présente à l'arrivée. */
export function useFreshAnnouncement(announcement: AnnouncementView | null): AnnouncementView | null {
  const initialId = useRef(announcement?.id ?? 0);
  const [visible, setVisible] = useState<AnnouncementView | null>(null);

  useEffect(() => {
    if (!announcement || announcement.id === initialId.current) return;
    setVisible(announcement);
    const timer = setTimeout(() => setVisible(null), DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [announcement]);

  return visible;
}
