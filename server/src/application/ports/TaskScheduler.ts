/** Planifie des tâches différées identifiées par une clé (une seule tâche par clé). */
export interface TaskScheduler {
  schedule(key: string, delayMs: number, task: () => void): void;
  cancel(key: string): void;
}
