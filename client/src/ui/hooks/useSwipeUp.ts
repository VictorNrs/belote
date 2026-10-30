import { PointerEvent, useRef } from 'react';

const SWIPE_DISTANCE_PX = 40;

interface SwipeHandlers {
  onPointerDown(event: PointerEvent): void;
  onPointerUp(event: PointerEvent): void;
  /** Vrai si le dernier geste était un glissement : le clic qui suit doit alors être ignoré. */
  consumeSwipe(): boolean;
}

/** Détecte un glissement du doigt vers le haut (pour lancer une carte sur la table). */
export function useSwipeUp(onSwipe: () => void): SwipeHandlers {
  const startY = useRef<number | null>(null);
  const swiped = useRef(false);

  return {
    onPointerDown: (event) => {
      startY.current = event.clientY;
      swiped.current = false;
    },
    onPointerUp: (event) => {
      const distance = (startY.current ?? event.clientY) - event.clientY;
      startY.current = null;
      if (distance < SWIPE_DISTANCE_PX) return;
      swiped.current = true;
      onSwipe();
    },
    consumeSwipe: () => {
      const wasSwipe = swiped.current;
      swiped.current = false;
      return wasSwipe;
    },
  };
}
