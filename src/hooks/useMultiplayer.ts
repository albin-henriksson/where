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
  currentReader?: string;
  imageUrl?: string;
  hintVoteCount?: number;
  totalNonReaders?: number;
  showSummary?: boolean;
  lastRoundPoints?: number;
  lastRoundWinner?: string | null;
  summaryCityName?: string;
  summaryCountry?: string;
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

type HostMessage =
  | GameSync
  | { type: "buzz-result"; winnerId: string; winnerName: string }
  | { type: "buzz-reset" }
  | { type: "buzz-reset-full" }
  | { type: "buzz-wrong"; lockedPlayerId: string };
interface ReaderActionMessage {
  type: "reader-action";
  action: "next-clue" | "correct" | "skip" | "buzz-correct" | "buzz-wrong";
}

interface VoteNextHintMessage {
  type: "vote-next-hint";
  playerName: string;
}

type PlayerMessage = BuzzMessage | JoinMessage | ReaderActionMessage | VoteNextHintMessage;

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
  const [buzzWinnerId, setBuzzWinnerId] = useState<string | null>(null);
  const [hasBuzzed, setHasBuzzed] = useState(false);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [hostName, setHostName] = useState<string>("");
  const [hintVotes, setHintVotes] = useState<Set<string>>(new Set());
  const [pendingReaderAction, setPendingReaderAction] = useState<ReaderActionMessage["action"] | null>(null);
  const lockedOutRef = useRef<Set<string>>(new Set());

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
    setBuzzWinnerId(null);
    setHasBuzzed(false);
    setIsLockedOut(false);
    setHostName("");
    setHintVotes(new Set());
    setPendingReaderAction(null);
    lockedOutRef.current = new Set();
  }, []);

  const hostGame = useCallback((name: string) => {
    const code = generateRoomCode();
    setRoomCode(code);
    setRole("host");
    setHostName(name);
    playerNameRef.current = name;

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
        // Check if already have a winner or player is locked out
        if (lockedOutRef.current.has(data.playerId)) return;
        setBuzzWinner((prev) => {
          if (prev) return prev;
          setBuzzWinnerId(data.playerId);
          sendHostRef.current?.({ type: "buzz-result", winnerId: data.playerId, winnerName: data.playerName });
          return data.playerName;
        });
      } else if (data.type === "reader-action") {
        setPendingReaderAction(data.action);
      } else if (data.type === "vote-next-hint") {
        setHintVotes((prev) => new Set([...prev, data.playerName]));
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
        setBuzzWinnerId(null);
        setHasBuzzed(false);
      } else if (data.type === "buzz-reset-full") {
        setBuzzWinner(null);
        setBuzzWinnerId(null);
        setHasBuzzed(false);
        setIsLockedOut(false);
      } else if (data.type === "buzz-wrong") {
        // If I was the one who buzzed wrong, lock me out
        if (data.lockedPlayerId === selfId) {
          setIsLockedOut(true);
        }
        setBuzzWinner(null);
        setBuzzWinnerId(null);
        setHasBuzzed(false);
      }
    });
  }, []);

  const syncGameState = useCallback((sync: GameSync) => {
    sendHostRef.current?.(sync);
    setGameSync(sync);
  }, []);

  const buzz = useCallback(() => {
    if (hasBuzzed || isLockedOut) return;
    setHasBuzzed(true);
    sendPlayerRef.current?.({
      type: "buzz",
      playerId: selfId,
      playerName: playerNameRef.current,
    });
  }, [hasBuzzed, isLockedOut]);

  const wrongBuzz = useCallback(() => {
    if (!buzzWinnerId) return;
    lockedOutRef.current.add(buzzWinnerId);
    sendHostRef.current?.({ type: "buzz-wrong", lockedPlayerId: buzzWinnerId });
    setBuzzWinner(null);
    setBuzzWinnerId(null);
  }, [buzzWinnerId]);

  const resetBuzz = useCallback(() => {
    setBuzzWinner(null);
    setBuzzWinnerId(null);
    setHasBuzzed(false);
    // Don't clear lockedOut — that persists per card
    sendHostRef.current?.({ type: "buzz-reset" });
  }, []);

  const resetBuzzFull = useCallback(() => {
    setBuzzWinner(null);
    setBuzzWinnerId(null);
    setHasBuzzed(false);
    setIsLockedOut(false);
    lockedOutRef.current = new Set();
    sendHostRef.current?.({ type: "buzz-reset-full" });
  }, []);

  // Reader sends an action to the host
  const sendReaderAction = useCallback((action: ReaderActionMessage["action"]) => {
    sendPlayerRef.current?.({ type: "reader-action", action });
  }, []);

  // Consume pending reader action (host calls this)
  const consumeReaderAction = useCallback(() => {
    const action = pendingReaderAction;
    setPendingReaderAction(null);
    return action;
  }, [pendingReaderAction]);

  // Vote for next hint
  const voteNextHint = useCallback(() => {
    sendPlayerRef.current?.({ type: "vote-next-hint", playerName: playerNameRef.current });
    // If host is voting, add locally too
    if (role === "host") {
      setHintVotes((prev) => new Set([...prev, playerNameRef.current]));
    }
  }, [role]);

  const clearHintVotes = useCallback(() => {
    setHintVotes(new Set());
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
    buzzWinnerId,
    hasBuzzed,
    isLockedOut,
    hostName,
    hintVotes,
    pendingReaderAction,
    hostGame,
    joinGame,
    syncGameState,
    buzz,
    wrongBuzz,
    resetBuzz,
    resetBuzzFull,
    sendReaderAction,
    consumeReaderAction,
    voteNextHint,
    clearHintVotes,
    cleanup,
    selfId,
  };
}
