import { useState, useEffect, useCallback, useRef } from "react";
import { joinRoom, selfId } from "trystero";
import type { Room } from "trystero";

const APP_ID = "where-city-quiz-game";

export type MultiplayerRole = "host" | "player";

interface PeerInfo {
  id: string;
  name: string;
}

// Messages from host → players
interface GameSync {
  type: "game-sync";
  clueText: string;
  clueIndex: number;
  pointValue: number;
  revealed: boolean;
  cityName?: string;
  country?: string;
  earnedPoints?: number | null;
  buzzWinner?: string | null;
  players: { id: string; name: string; score: number }[];
}

// Messages from player → host
interface BuzzMessage {
  type: "buzz";
  playerId: string;
  playerName: string;
}

interface JoinMessage {
  type: "join";
  playerName: string;
}

type HostMessage = GameSync | { type: "buzz-result"; winnerId: string; winnerName: string } | { type: "buzz-reset" };
type PlayerMessage = BuzzMessage | JoinMessage;

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function useMultiplayer() {
  const [role, setRole] = useState<MultiplayerRole | null>(null);
  const [roomCode, setRoomCode] = useState<string>("");
  const [connected, setConnected] = useState(false);
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [gameSync, setGameSync] = useState<GameSync | null>(null);
  const [buzzWinner, setBuzzWinner] = useState<string | null>(null);
  const [hasBuzzed, setHasBuzzed] = useState(false);

  const roomRef = useRef<Room | null>(null);
  const sendHostRef = useRef<((data: HostMessage, peerId?: string) => void) | null>(null);
  const sendPlayerRef = useRef<((data: PlayerMessage, peerId?: string) => void) | null>(null);
  const playerNameRef = useRef<string>("");
  const peersRef = useRef<PeerInfo[]>([]);

  const cleanup = useCallback(() => {
    roomRef.current?.leave();
    roomRef.current = null;
    sendHostRef.current = null;
    sendPlayerRef.current = null;
    setRole(null);
    setConnected(false);
    setPeers([]);
    setGameSync(null);
    setBuzzWinner(null);
    setHasBuzzed(false);
  }, []);

  const hostGame = useCallback(() => {
    const code = generateRoomCode();
    setRoomCode(code);
    setRole("host");

    const room = joinRoom({ appId: APP_ID }, code.toLowerCase());
    roomRef.current = room;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [sendHost, getPlayer] = room.makeAction<any>("msg");
    sendHostRef.current = sendHost;

    room.onPeerJoin(() => {
      setConnected(true);
    });

    room.onPeerLeave((id) => {
      peersRef.current = peersRef.current.filter((p) => p.id !== id);
      setPeers([...peersRef.current]);
    });

    (getPlayer as (cb: (data: PlayerMessage, peerId: string) => void) => void)((data, peerId) => {
      if (data.type === "join") {
        const newPeer = { id: peerId, name: data.playerName };
        peersRef.current = [...peersRef.current.filter((p) => p.id !== peerId), newPeer];
        setPeers([...peersRef.current]);
      } else if (data.type === "buzz") {
        // First buzz wins
        setBuzzWinner((prev) => {
          if (prev) return prev; // already have a winner
          // Notify all players
          sendHostRef.current?.({ type: "buzz-result", winnerId: data.playerId, winnerName: data.playerName });
          return data.playerName;
        });
      }
    });
  }, []);

  const joinGame = useCallback((code: string, playerName: string) => {
    setRoomCode(code);
    setRole("player");
    playerNameRef.current = playerName;

    const room = joinRoom({ appId: APP_ID }, code.toLowerCase());
    roomRef.current = room;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [sendPlayer, getHost] = room.makeAction<any>("msg");
    sendPlayerRef.current = sendPlayer;

    room.onPeerJoin(() => {
      setConnected(true);
      // Send our name to host
      sendPlayerRef.current?.({ type: "join", playerName });
    });

    room.onPeerLeave(() => {});

    (getHost as (cb: (data: HostMessage, peerId: string) => void) => void)((data) => {
      if (data.type === "game-sync") {
        setGameSync(data);
      } else if (data.type === "buzz-result") {
        setBuzzWinner(data.winnerName);
      } else if (data.type === "buzz-reset") {
        setBuzzWinner(null);
        setHasBuzzed(false);
      }
    });
  }, []);

  const syncGameState = useCallback((sync: GameSync) => {
    sendHostRef.current?.(sync);
    setGameSync(sync);
  }, []);

  const buzz = useCallback(() => {
    if (hasBuzzed) return;
    setHasBuzzed(true);
    sendPlayerRef.current?.({
      type: "buzz",
      playerId: selfId,
      playerName: playerNameRef.current,
    });
  }, [hasBuzzed]);

  const resetBuzz = useCallback(() => {
    setBuzzWinner(null);
    setHasBuzzed(false);
    sendHostRef.current?.({ type: "buzz-reset" });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      roomRef.current?.leave();
    };
  }, []);

  return {
    role,
    roomCode,
    connected,
    peers,
    gameSync,
    buzzWinner,
    hasBuzzed,
    hostGame,
    joinGame,
    syncGameState,
    buzz,
    resetBuzz,
    cleanup,
    selfId,
  };
}
