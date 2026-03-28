import { useState } from "react";

interface PeerInfo {
  id: string;
  name: string;
}

interface AvailableGame {
  roomCode: string;
  hostName: string;
  playerCount: number;
}

interface MultiplayerLobbyProps {
  mode: "host" | "player" | null;
  roomCode: string;
  connected: boolean;
  peers: PeerInfo[];
  initialRoomCode?: string | null;
  availableGames?: AvailableGame[];
  onHost: () => void;
  onJoin: (code: string, name: string) => void;
  onStart: () => void;
  onBack: () => void;
}

export function MultiplayerLobby({
  mode,
  roomCode,
  connected,
  peers,
  initialRoomCode,
  availableGames = [],
  onHost,
  onJoin,
  onStart,
  onBack,
}: MultiplayerLobbyProps) {
  const [joinCode, setJoinCode] = useState(initialRoomCode ?? "");
  const [playerName, setPlayerName] = useState("");
  const [step, setStep] = useState<"choose" | "hosting" | "joining">(
    initialRoomCode
      ? "joining"
      : mode === "host"
        ? "hosting"
        : mode === "player"
          ? "joining"
          : "choose",
  );

  if (step === "hosting") {
    return (
      <div className="flex flex-col items-center gap-6 p-8 w-full max-w-sm mx-auto animate-slide-up">
        <h2 className="text-2xl font-bold text-white">Väntar på spelare</h2>

        <div className="bg-card border border-card-border rounded-2xl p-6 w-full text-center">
          <p className="text-xs text-muted uppercase tracking-widest mb-3">
            Rumskod
          </p>
          <p
            data-testid="room-code"
            className="text-5xl font-black text-white tracking-[0.2em]"
          >
            {roomCode}
          </p>
          {roomCode && (
            <button
              onClick={() => {
                const url = `${window.location.origin}/?room=${roomCode}`;
                navigator.clipboard?.writeText(url);
              }}
              className="mt-3 text-xs text-muted hover:text-text-dim transition-colors"
            >
              Kopiera länk
            </button>
          )}
        </div>

        <div className="w-full">
          <p className="text-xs text-muted uppercase tracking-widest mb-2">
            Anslutna ({peers.length})
          </p>
          {peers.length === 0 ? (
            <p className="text-muted text-sm text-center py-4">
              Väntar på att spelare ska ansluta...
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {peers.map((peer) => (
                <div
                  key={peer.id}
                  className="bg-card-border/40 rounded-xl px-4 py-2.5 text-text text-sm"
                >
                  {peer.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 w-full mt-2">
          <button
            onClick={onBack}
            className="flex-1 py-4 bg-card-border/50 text-text-dim rounded-2xl text-base font-medium border border-card-border"
          >
            Avbryt
          </button>
          <button
            data-testid="start-multiplayer"
            onClick={onStart}
            disabled={peers.length === 0}
            className="flex-1 py-4 bg-white text-black rounded-2xl text-base font-semibold disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            Starta
          </button>
        </div>
      </div>
    );
  }

  if (step === "joining") {
    return (
      <div className="flex flex-col items-center gap-6 p-8 w-full max-w-sm mx-auto animate-slide-up">
        <h2 className="text-2xl font-bold text-white">Gå med i spel</h2>

        {/* Auto-discovered games */}
        {availableGames.length > 0 && !connected && (
          <div className="w-full">
            <p className="text-xs text-muted uppercase tracking-widest mb-2">
              Spel på nätverket
            </p>
            <div className="flex flex-col gap-2">
              {availableGames.map((game) => (
                <button
                  key={game.roomCode}
                  data-testid={`discovered-${game.roomCode}`}
                  onClick={() => {
                    setJoinCode(game.roomCode);
                    if (playerName.trim()) {
                      onJoin(game.roomCode, playerName.trim());
                    }
                  }}
                  className="w-full bg-card border border-card-border rounded-xl px-4 py-3 text-left hover:border-text-dim/30 transition-all active:scale-[0.98] animate-fade-in"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{game.roomCode}</span>
                    <span className="text-xs text-muted">{game.playerCount} spelare</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <input
          data-testid="join-name"
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Ditt namn"
          className="w-full bg-card border border-card-border rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-text-dim transition-colors text-center"
          autoFocus
        />

        <input
          data-testid="join-code"
          type="text"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
          placeholder="ABCD"
          maxLength={4}
          className="w-full bg-card border border-card-border rounded-xl px-4 py-4 text-white placeholder:text-muted focus:outline-none focus:border-text-dim transition-colors text-center text-3xl font-bold tracking-[0.3em] uppercase"
        />

        {connected && (
          <p className="text-success text-sm animate-fade-in">Ansluten! Väntar på att spelet ska börja...</p>
        )}

        <div className="flex gap-3 w-full mt-2">
          <button
            onClick={() => { setStep("choose"); onBack(); }}
            className="flex-1 py-4 bg-card-border/50 text-text-dim rounded-2xl text-base font-medium border border-card-border"
          >
            Tillbaka
          </button>
          <button
            data-testid="join-submit"
            onClick={() => {
              if (joinCode.length === 4 && playerName.trim()) {
                onJoin(joinCode, playerName.trim());
              }
            }}
            disabled={joinCode.length !== 4 || !playerName.trim() || connected}
            className="flex-1 py-4 bg-white text-black rounded-2xl text-base font-semibold disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {connected ? "Ansluten" : "Anslut"}
          </button>
        </div>
      </div>
    );
  }

  // Choose host or join
  return (
    <div className="flex flex-col items-center gap-6 p-8 w-full max-w-sm mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold text-white">Multiplayer</h2>
      <p className="text-muted text-sm">Spela med egna enheter</p>

      <div className="flex flex-col gap-3 w-full">
        <button
          data-testid="mp-host"
          onClick={() => {
            onHost();
            setStep("hosting");
          }}
          className="bg-card border border-card-border rounded-2xl p-5 text-left hover:border-text-dim/30 transition-all active:scale-[0.98]"
        >
          <h3 className="text-lg font-semibold text-white">Skapa spel</h3>
          <p className="text-sm text-muted mt-0.5">
            Du läser ledtrådarna — andra buzzer in.
          </p>
        </button>

        <button
          data-testid="mp-join"
          onClick={() => setStep("joining")}
          className="bg-card border border-card-border rounded-2xl p-5 text-left hover:border-text-dim/30 transition-all active:scale-[0.98]"
        >
          <h3 className="text-lg font-semibold text-white">Gå med</h3>
          <p className="text-sm text-muted mt-0.5">
            Ange rumskod och buzza för att svara.
          </p>
        </button>
      </div>

      <button
        onClick={onBack}
        className="py-3 text-muted text-sm hover:text-text-dim transition-colors"
      >
        Tillbaka
      </button>
    </div>
  );
}
