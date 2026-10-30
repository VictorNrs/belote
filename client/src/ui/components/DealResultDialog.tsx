import { ReactNode } from 'react';
import { DealResultView } from '@belote/shared';
import { suitSymbol } from '../../domain/cardFace';
import { outcomeLabel } from '../../domain/dealOutcome';
import { teamLabel, teamsFromMyView } from '../../domain/tableLayout';
import { Dialog } from './Dialog';

interface DealResultDialogProps {
  result: DealResultView;
  mySeat: number;
  takerName: string;
  scores: number[];
  footer?: ReactNode;
}

export function DealResultSummary({ result, mySeat, takerName, scores }: Omit<DealResultDialogProps, 'footer'>) {
  const teams = teamsFromMyView(mySeat);
  return (
    <>
      <p className="result__outcome">
        {takerName} a pris à {suitSymbol(result.contract.trump)} — <strong>{outcomeLabel(result.outcome)}</strong>
      </p>
      <table className="result__table">
        <thead>
          <tr>
            <th />
            {teams.map((team) => (
              <th key={team}>{teamLabel(team, mySeat)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Points aux cartes</td>
            {teams.map((team) => (
              <td key={team}>{result.cardPoints[team]}</td>
            ))}
          </tr>
          <tr>
            <td>Belote</td>
            {teams.map((team) => (
              <td key={team}>{result.beloteTeam === team ? '20' : '—'}</td>
            ))}
          </tr>
          <tr className="result__scored">
            <td>Marqués</td>
            {teams.map((team) => (
              <td key={team}>+{result.scored[team]}</td>
            ))}
          </tr>
          <tr className="result__total">
            <td>Total</td>
            {teams.map((team) => (
              <td key={team}>{scores[team]}</td>
            ))}
          </tr>
        </tbody>
      </table>
      {result.pendingLitige > 0 && <p className="result__note">{result.pendingLitige} points en réserve pour la prochaine donne.</p>}
    </>
  );
}

export function DealResultDialog(props: DealResultDialogProps) {
  return (
    <Dialog title="Fin de la donne">
      <DealResultSummary {...props} />
      {props.footer ?? (
        <div className="result__next">
          <span>Donne suivante…</span>
          <span className="progress" />
        </div>
      )}
    </Dialog>
  );
}
