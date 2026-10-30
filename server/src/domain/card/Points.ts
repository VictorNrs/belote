export class Points {
  static readonly ZERO = new Points(0);

  constructor(private readonly amount: number) {}

  static sum(all: readonly Points[]): Points {
    return all.reduce((total, points) => total.plus(points), Points.ZERO);
  }

  plus(other: Points): Points {
    return new Points(this.amount + other.amount);
  }

  isGreaterThan(other: Points): boolean {
    return this.amount > other.amount;
  }

  isAtLeast(other: Points): boolean {
    return this.amount >= other.amount;
  }

  equals(other: Points): boolean {
    return this.amount === other.amount;
  }

  toNumber(): number {
    return this.amount;
  }
}
