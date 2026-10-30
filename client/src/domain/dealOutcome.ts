import { DealOutcome } from '@belote/shared';

const OUTCOME_LABELS: Record<DealOutcome, string> = {
  made: 'Contrat rempli',
  failed: 'Dedans !',
  capot: 'Capot !',
  capotAgainst: 'Capot de la défense !',
  litige: 'Litige : points mis en réserve',
};

export const outcomeLabel = (outcome: DealOutcome): string => OUTCOME_LABELS[outcome];
