import { Shuffler } from '../../domain/card/Shuffler';

/** Mélange de Fisher-Yates. */
export class MathRandomShuffler implements Shuffler {
  constructor(private readonly random: () => number = Math.random) {}

  shuffle<T>(items: readonly T[]): T[] {
    const shuffled = [...items];
    shuffled.forEach((_, index) => this.swapWithEarlier(shuffled, shuffled.length - 1 - index));
    return shuffled;
  }

  private swapWithEarlier<T>(items: T[], index: number): void {
    const other = Math.floor(this.random() * (index + 1));
    [items[index], items[other]] = [items[other] as T, items[index] as T];
  }
}
