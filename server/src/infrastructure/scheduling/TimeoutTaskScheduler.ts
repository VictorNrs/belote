import { TaskScheduler } from '../../application/ports/TaskScheduler';

export class TimeoutTaskScheduler implements TaskScheduler {
  private readonly timers = new Map<string, NodeJS.Timeout>();

  schedule(key: string, delayMs: number, task: () => void): void {
    this.cancel(key);
    this.timers.set(key, setTimeout(() => this.run(key, task), delayMs));
  }

  cancel(key: string): void {
    clearTimeout(this.timers.get(key));
    this.timers.delete(key);
  }

  private run(key: string, task: () => void): void {
    this.timers.delete(key);
    try {
      task();
    } catch (error) {
      console.error(`Échec de la tâche planifiée ${key}`, error);
    }
  }
}
