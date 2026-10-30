import { DealResultView, RoomView } from '@belote/shared';
import { suitSymbol } from '../../domain/cardFace';
import { outcomeLabel } from '../../domain/dealOutcome';
import { ScoreColumn, scoreColumns } from '../../domain/scoreColumns';
import { Dialog } from './Dialog';

interface DealResultProps {
  result: DealResultView;
  room: RoomView;
  takerName: string;
  scores: number[];
}

function ResultRow({ label, columns, value, className }: { label: string; columns: ScoreColumn[]; value(team: number): string; className?: string }) {
  return (
    <tr className={className}>
      <td>{label}</td>
      {columns.map(({ team }) => (
        <td key={team}>{value(team)}</td>
      ))}
    </tr>
  );
}

export function DealResultSummary({ result, room, takerName, scores }: DealResultProps) {
  const columns = scoreColumns(room);
  return (
    <>
      <p className="result__outcome">
        {takerName} a pris à {suitSymbol(result.contract.trump)} — <strong>{outcomeLabel(result.outcome)}</strong>
      </p>
      <table className="result__table">
        <thead>
          <tr>
            <th />
            {columns.map(({ team, label }) => (
              <th key={team}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <ResultRow label="Points aux cartes" columns={columns} value={(team) => String(result.cardPoints[team] ?? 0)} />
          <ResultRow label="Belote" columns={columns} value={(team) => (result.beloteTeam === team ? '20' : '—')} />
          <ResultRow label="Marqués" columns={columns} value={(team) => `+${result.scored[team] ?? 0}`} className="result__scored" />
          <ResultRow label="Total" columns={columns} value={(team) => String(scores[team] ?? 0)} className="result__total" />
        </tbody>
      </table>
      {result.pendingLitige > 0 && <p className="result__note">{result.pendingLitige} points en réserve pour la prochaine donne.</p>}
    </>
  );
}

export function DealResultDialog(props: DealResultProps) {
  return (
    <Dialog title="Fin de la donne">
      <DealResultSummary {...props} />
      <div className="result__next">
        <span>Donne suivante…</span>
        <span className="progress" />
      </div>
    </Dialog>
  );
}
