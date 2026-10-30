import { AnnouncementView, GameView, RoomView } from '@belote/shared';
import { useEffect, useState } from 'react';
import { RoomActions } from '../../application/useRoom';
import { otherSeats, positionOf } from '../../domain/tableLayout';
import { BiddingPanel } from '../components/BiddingPanel';
import { DealResultDialog } from '../components/DealResultDialog';
import { GameOverDialog } from '../components/GameOverDialog';
import { HandView } from '../components/HandView';
import { LastTrickDialog } from '../components/LastTrickDialog';
import { PlayerSpot } from '../components/PlayerSpot';
import { ScoreBar } from '../components/ScoreBar';
import { TrickView } from '../components/TrickView';
import { useFreshAnnouncement } from '../hooks/useFreshAnnouncement';

interface TableProps {
  room: RoomView;
  game: GameView;
  actions: RoomActions;
}

interface FeltProps extends TableProps {
  announcement: AnnouncementView | null;
  onShowLastTrick(): void;
}

const LEAVE_CONFIRMATION = 'Quitter la partie ? Un robot prendra votre place.';
const TURN_VIBRATION_MS = 40;

const nameOf = (room: RoomView, seat: number | null | undefined): string => (seat == null ? '—' : (room.seats[seat]?.name ?? '—'));

function Felt({ room, game, actions, announcement, onShowLastTrick }: FeltProps) {
  const bubbleFor = (seat: number) => (announcement?.seat === seat ? announcement.text : null);
  return (
    <section className="felt">
      {otherSeats(room).map((seat) => (
        <PlayerSpot key={seat} seat={seat} position={positionOf(seat, room)} player={room.seats[seat] ?? null} game={game} bubble={bubbleFor(seat)} />
      ))}
      <TrickView trick={game.trick} room={room} winner={game.trickWinner} />
      {game.phase === 'bidding' && <BiddingPanel game={game} mySeat={room.mySeat} bidderName={nameOf(room, game.turn)} onBid={actions.bid} />}
      {announcement?.seat === null && <div className="toast">{announcement.text}</div>}
      <button type="button" className="chip-button last-trick-button" onClick={onShowLastTrick} disabled={!game.lastTrick}>
        Dernier pli
      </button>
      <PlayerSpot seat={room.mySeat} position="bottom" player={room.seats[room.mySeat] ?? null} game={game} bubble={bubbleFor(room.mySeat)} />
    </section>
  );
}

function EndOfDealDialogs({ room, game, actions }: TableProps) {
  const takerName = nameOf(room, game.lastResult?.contract.taker);
  if (game.phase === 'gameOver' && game.winner !== null) {
    const props = { room, winner: game.winner, result: game.lastResult, scores: game.scores, takerName };
    return <GameOverDialog {...props} onReplay={() => actions.start()} onLeave={() => actions.leave()} />;
  }
  if (game.phase !== 'dealEnd' || !game.lastResult) return null;
  return <DealResultDialog result={game.lastResult} room={room} takerName={takerName} scores={game.scores} />;
}

/** Petite vibration (si le téléphone le permet) quand vient le tour du joueur. */
function useTurnVibration(isMyTurn: boolean): void {
  useEffect(() => {
    if (isMyTurn) navigator.vibrate?.(TURN_VIBRATION_MS);
  }, [isMyTurn]);
}

/** C'est à moi de parler (enchères) ou de jouer une carte. */
const isMyTurn = (room: RoomView, game: GameView): boolean => game.turn === room.mySeat && ['bidding', 'playing'].includes(game.phase);

export function TableScreen({ room, game, actions }: TableProps) {
  const [showLastTrick, setShowLastTrick] = useState(false);
  const announcement = useFreshAnnouncement(game.announcement);
  const myTurn = isMyTurn(room, game);
  const canPlay = myTurn && game.phase === 'playing';
  const leave = () => window.confirm(LEAVE_CONFIRMATION) && actions.leave();
  useTurnVibration(myTurn);
  return (
    <div className="table-screen">
      <ScoreBar room={room} game={game} takerName={nameOf(room, game.contract?.taker)} onLeave={leave} />
      <Felt room={room} game={game} actions={actions} announcement={announcement} onShowLastTrick={() => setShowLastTrick(true)} />
      <p className="turn-hint">{canPlay ? 'À vous de jouer !' : ' '}</p>
      <HandView cards={game.hand} legalCards={game.legalCards} canPlay={canPlay} onPlay={actions.play} />
      <EndOfDealDialogs room={room} game={game} actions={actions} />
      {showLastTrick && game.lastTrick && <LastTrickDialog trick={game.lastTrick} room={room} onClose={() => setShowLastTrick(false)} />}
    </div>
  );
}
