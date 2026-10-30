import { AnnouncementView, GameView, RoomView } from '@belote/shared';
import { useState } from 'react';
import { RoomActions } from '../../application/useRoom';
import { positionOf } from '../../domain/tableLayout';
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

const LEAVE_CONFIRMATION = 'Quitter la partie ? Un robot prendra votre place.';

const nameOf = (room: RoomView, seat: number | null | undefined): string => (seat == null ? '—' : (room.seats[seat]?.name ?? '—'));

function Felt({ room, game, actions, announcement }: TableProps & { announcement: AnnouncementView | null }) {
  const others = [1, 2, 3].map((offset) => (room.mySeat + offset) % 4);
  const bubbleFor = (seat: number) => (announcement?.seat === seat ? announcement.text : null);
  return (
    <section className="felt">
      {others.map((seat) => (
        <PlayerSpot key={seat} seat={seat} position={positionOf(seat, room.mySeat)} player={room.seats[seat] ?? null} game={game} bubble={bubbleFor(seat)} />
      ))}
      <TrickView trick={game.trick} mySeat={room.mySeat} />
      {game.phase === 'bidding' && <BiddingPanel game={game} mySeat={room.mySeat} bidderName={nameOf(room, game.turn)} onBid={actions.bid} />}
      {announcement?.seat === null && <div className="toast">{announcement.text}</div>}
      <PlayerSpot seat={room.mySeat} position="bottom" player={room.seats[room.mySeat] ?? null} game={game} bubble={bubbleFor(room.mySeat)} />
    </section>
  );
}

function EndOfDealDialogs({ room, game, actions }: TableProps) {
  const takerName = nameOf(room, game.lastResult?.contract.taker);
  const leave = () => actions.leave();
  if (game.phase === 'gameOver' && game.winner !== null) {
    const props = { winner: game.winner, result: game.lastResult, scores: game.scores, mySeat: room.mySeat, takerName, isHost: room.isHost };
    return <GameOverDialog {...props} onReplay={() => actions.start()} onLeave={leave} />;
  }
  if (game.phase !== 'dealEnd' || !game.lastResult) return null;
  return <DealResultDialog result={game.lastResult} mySeat={room.mySeat} takerName={takerName} scores={game.scores} />;
}

export function TableScreen({ room, game, actions }: TableProps) {
  const [showLastTrick, setShowLastTrick] = useState(false);
  const announcement = useFreshAnnouncement(game.announcement);
  const isMyTurn = game.phase === 'playing' && game.turn === room.mySeat;
  const leave = () => window.confirm(LEAVE_CONFIRMATION) && actions.leave();
  return (
    <div className="table-screen">
      <ScoreBar
        game={game}
        mySeat={room.mySeat}
        takerName={game.contract ? nameOf(room, game.contract.taker) : null}
        onShowLastTrick={() => setShowLastTrick(true)}
        onLeave={leave}
      />
      <Felt room={room} game={game} actions={actions} announcement={announcement} />
      <p className="turn-hint">{isMyTurn ? 'À vous de jouer !' : ' '}</p>
      <HandView cards={game.hand} legalCards={game.legalCards} canPlay={isMyTurn} onPlay={actions.play} />
      <EndOfDealDialogs room={room} game={game} actions={actions} />
      {showLastTrick && game.lastTrick && (
        <LastTrickDialog trick={game.lastTrick} mySeat={room.mySeat} seats={room.seats} onClose={() => setShowLastTrick(false)} />
      )}
    </div>
  );
}
