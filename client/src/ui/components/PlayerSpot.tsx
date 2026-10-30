import { GameView, SeatView } from '@belote/shared';
import { suitSymbol } from '../../domain/cardFace';
import { TablePosition } from '../../domain/tableLayout';
import { classNames } from '../classNames';
import { CardBack } from './PlayingCard';

interface PlayerSpotProps {
  seat: number;
  position: TablePosition;
  player: SeatView | null;
  game: GameView;
  bubble: string | null;
}

function Badges({ seat, game }: { seat: number; game: GameView }) {
  const contract = game.contract?.taker === seat ? game.contract : null;
  return (
    <span className="spot__badges">
      {game.dealer === seat && <span className="badge">Donneur</span>}
      {contract && <span className="badge badge--taker">Preneur {suitSymbol(contract.trump)}</span>}
    </span>
  );
}

function HiddenCards({ count }: { count: number }) {
  return (
    <span className="spot__cards">
      {Array.from({ length: count }, (_, index) => (
        <CardBack key={index} />
      ))}
    </span>
  );
}

function PlayerName({ player }: { player: SeatView | null }) {
  if (!player) return <span className="spot__name">—</span>;
  return (
    <span className="spot__name">
      {player.name}
      {player.isBot && ' 🤖'}
      {!player.connected && <span className="spot__offline"> (hors ligne)</span>}
    </span>
  );
}

function bubbleText({ seat, game, bubble }: PlayerSpotProps): string | null {
  const hasPassed = game.phase === 'bidding' && game.passedSeats.includes(seat);
  return bubble ?? (hasPassed ? 'Passe' : null);
}

export function PlayerSpot(props: PlayerSpotProps) {
  const { seat, position, player, game } = props;
  const bubble = bubbleText(props);
  return (
    <div className={classNames('spot', `spot--${position}`, game.turn === seat && 'spot--active')}>
      {bubble && <span className="bubble">{bubble}</span>}
      {position !== 'bottom' && <HiddenCards count={game.handSizes[seat] ?? 0} />}
      <PlayerName player={player} />
      <Badges seat={seat} game={game} />
    </div>
  );
}
