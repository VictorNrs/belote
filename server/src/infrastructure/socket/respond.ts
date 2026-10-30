import { Ack } from '@belote/shared';
import { ApplicationError } from '../../application/ApplicationError';
import { DomainError } from '../../domain/shared/DomainError';

const isExpected = (error: unknown): error is Error => error instanceof DomainError || error instanceof ApplicationError;

function messageOf(error: unknown): string {
  if (isExpected(error)) return error.message;
  console.error(error);
  return 'Une erreur inattendue est survenue';
}

/** Exécute une action et renvoie son résultat (ou l'erreur métier) au client via l'acquittement Socket.io. */
export function respond<T>(ack: Ack<T> | undefined, action: () => T): void {
  const reply = typeof ack === 'function' ? ack : () => undefined;
  try {
    reply({ ok: true, data: action() });
  } catch (error) {
    reply({ ok: false, error: messageOf(error) });
  }
}
