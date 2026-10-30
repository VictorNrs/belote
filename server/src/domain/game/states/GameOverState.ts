import { DomainError } from '../../shared/DomainError';
import { GameState } from '../GameState';
import { GamePhase } from '../GameSnapshot';
import { DealEndState } from './DealEndState';

/** Une équipe a atteint l'objectif : la partie est terminée. */
export class GameOverState extends DealEndState {
  override phase(): GamePhase {
    return 'gameOver';
  }

  override advance(): GameState {
    throw new DomainError('La partie est terminée');
  }
}
