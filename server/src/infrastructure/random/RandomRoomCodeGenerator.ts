import { RoomCodeGenerator } from '../../application/ports/RoomCodeGenerator';
import { RoomCode } from '../../domain/room/RoomCode';

export class RandomRoomCodeGenerator implements RoomCodeGenerator {
  constructor(private readonly random: () => number = Math.random) {}

  generate(): RoomCode {
    const letters = Array.from({ length: RoomCode.LENGTH }, () => this.randomLetter());
    return RoomCode.of(letters.join(''));
  }

  private randomLetter(): string {
    return RoomCode.ALPHABET.charAt(Math.floor(this.random() * RoomCode.ALPHABET.length));
  }
}
