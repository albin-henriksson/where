import { useEffect, useState, useCallback, useRef } from "react";
import { useGameSession } from "./useGameSession";
import { useGameState } from "./useGameState";
import { useMultiplayer } from "./useMultiplayer";
import { useLobbyDiscovery } from "./useLobbyDiscovery";
import type { CityCard, Player } from "../data/types";

export type AppScreen =
  | "start"
  | "mp-lobby"
  | "mp-waiting"
  | "mp-buzzer"
  | "mp-reader"
  | "playing"
  | "summary";

interface RoundResult {
  points: number;
  winnerName: string | null;
  cityName: string | null;
  country: string | null;
}

export interface Orchestrator {
  // Current screen
  screen: AppScreen;

  // Card state
  currentCard: CityCard | null;
  clueIndex: number;
  revealed: boolean;
  earnedPoints: number | null;
  cardsRemaining: number;

  // Game state
  isCompetition: boolean;
  players: Player[];
  showAnswer: boolean;

  // Multiplayer
  mpRole: "host" | "player" | null;
  roomCode: string;
  mpConnected: boolean;
  mpPeers: { id: string; name: string }[];
  buzzWinner: string | null;
  hasBuzzed: boolean;
  isLockedOut: boolean;
  initialRoomCode: string | null;
  availableGames: { roomCode: string; hostName: string; playerCount: number }[];
  currentReader: string | null;
  isReader: boolean;
  gameSync: {
    clueText: string;
    clueIndex: number;
    pointValue: number;
    revealed: boolean;
    cityName?: string;
    country?: string;
    earnedPoints?: number | null;
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
  } | null;
  playerName: string;
  isMultiplayer: boolean;

  // Round result (for summary)
  lastRound: RoundResult;

  // Command bar
  cmdBarOpen: boolean;

  // Actions
  startFreeplay: () => void;
  startCompetition: (names: string[]) => void;
  openMultiplayer: () => void;
  hostGame: (name: string) => void;
  joinGame: (code: string, name: string) => void;
  startMultiplayer: () => void;
  backToStart: () => void;

  nextClue: () => void;
  markCorrect: () => void;
  awardPoints: (playerId: string) => void;
  noOneGuessed: () => void;
  skipCard: () => void;
  nextCardFromSummary: () => void;

  buzzCorrect: () => void;
  buzzWrong: () => void;
  buzz: () => void;
  sendReaderAction: (action: "next-clue" | "correct" | "skip" | "buzz-correct" | "buzz-wrong") => void;
  voteNextHint: () => void;

  toggleCmdBar: () => void;
  closeCmdBar: () => void;
  resetScores: () => void;
  adjustScore: (playerId: string, delta: number) => void;
  addPlayer: (name: string) => void;
  newGame: () => void;
}

export function useGameOrchestrator(): Orchestrator {
  const game = useGameState();
  const session = useGameSession();
  const mp = useMultiplayer();
  const lobby = useLobbyDiscovery();

  const [mpScreen, setMpScreen] = useState<"lobby" | "playing" | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [lastRound, setLastRound] = useState<RoundResult>({ points: 0, winnerName: null, cityName: null, country: null });
  const [cmdBarOpen, setCmdBarOpen] = useState(false);
  const [initialRoomCode, setInitialRoomCode] = useState<string | null>(null);
  const [readerIndex, setReaderIndex] = useState(0);

  const prevClueIndex = useRef(session.clueIndex);
  const hasCheckedUrl = useRef(false);

  const isCompetition = game.mode === "competition";
  const isMultiplayerHost = mp.role === "host" && mpScreen === "playing";
  const isMultiplayerPlayer = mp.role === "player";
  const isMultiplayer = isMultiplayerHost || isMultiplayerPlayer;

  // All participants: host + peers (host is included in rotation)
  const allParticipants = isMultiplayerHost
    ? [mp.hostName, ...mp.peers.map((p) => p.name)]
    : [];

  // Current reader rotates among ALL participants (host included)
  const currentReader = isMultiplayerHost && allParticipants.length > 0
    ? allParticipants[readerIndex % allParticipants.length] ?? null
    : null;

  // Am I the reader? (works for both host and player devices)
  const isHostReader = isMultiplayerHost && currentReader === mp.hostName;
  const isPlayerReader = isMultiplayerPlayer && !!mp.gameSync?.currentReader && mp.gameSync.currentReader === playerName;
  const isReader = isHostReader || isPlayerReader;

  // Derive screen
  let screen: AppScreen;
  if (isMultiplayerHost && mpScreen === "playing") {
    if (showSummary) {
      screen = "summary";
    } else if (isHostReader) {
      screen = "mp-reader";
    } else {
      screen = "mp-buzzer";
    }
  } else if (isMultiplayerPlayer && mp.gameSync) {
    if (mp.gameSync.showSummary) {
      screen = "summary";
    } else if (isPlayerReader) {
      screen = "mp-reader";
    } else {
      screen = "mp-buzzer";
    }
  } else if (isMultiplayerPlayer && !mp.gameSync) {
    screen = "mp-waiting";
  } else if (mpScreen === "lobby") {
    screen = "mp-lobby";
  } else if (showSummary && isCompetition) {
    screen = "summary";
  } else if (game.screen === "start" && !mpScreen) {
    screen = "start";
  } else {
    screen = "playing";
  }

  // --- Effects ---

  // URL room code on mount
  useEffect(() => {
    if (hasCheckedUrl.current) return;
    hasCheckedUrl.current = true;
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");
    if (room && room.length === 4) {
      setMpScreen("lobby");
      setInitialRoomCode(room.toUpperCase());
    }
  }, []);

  // Update URL and start advertising when host creates room
  useEffect(() => {
    if (mp.role === "host" && mp.roomCode) {
      window.history.replaceState({}, "", `/?room=${mp.roomCode}`);
      lobby.advertiseGame(mp.roomCode, "Host", mp.peers.length);
    }
  }, [mp.role, mp.roomCode, mp.peers.length, lobby]);

  // Reset buzz when clue advances (host)
  useEffect(() => {
    if (isMultiplayerHost && session.clueIndex !== prevClueIndex.current) {
      mp.resetBuzz();
      prevClueIndex.current = session.clueIndex;
    }
  }, [isMultiplayerHost, session.clueIndex, mp]);

  // Handle pending reader actions from remote reader (host executes)
  useEffect(() => {
    if (!isMultiplayerHost || !mp.pendingReaderAction) return;
    const action = mp.consumeReaderAction();
    if (!action) return;
    switch (action) {
      case "next-clue": session.nextClue(); mp.clearHintVotes(); break;
      case "correct": session.correct(); break;
      case "skip": mp.resetBuzzFull(); session.skip(); mp.clearHintVotes(); break;
      case "buzz-correct": {
        const player = game.players.find((p) => p.name === mp.buzzWinner);
        if (player) {
          session.correct();
          setTimeout(() => {
            const points = 5 - session.clueIndex;
            game.awardPoints(player.id, points);
            setLastRound({ points, winnerName: player.name, cityName: session.currentCard?.city ?? null, country: session.currentCard?.country ?? null });
            mp.resetBuzzFull();
            mp.clearHintVotes();
            setReaderIndex((i) => i + 1);
            setShowSummary(true);
          }, 50);
        }
        break;
      }
      case "buzz-wrong": mp.wrongBuzz(); break;
    }
  }, [isMultiplayerHost, mp.pendingReaderAction]);

  // Handle hint vote majority (host auto-advances)
  useEffect(() => {
    if (!isMultiplayerHost) return;
    const nonReaderCount = allParticipants.length - 1;
    if (nonReaderCount > 0 && mp.hintVotes.size > nonReaderCount / 2) {
      session.nextClue();
      mp.clearHintVotes();
    }
  }, [isMultiplayerHost, mp.hintVotes.size, allParticipants.length]);

  // Sync game state to peers (host)
  useEffect(() => {
    if (!isMultiplayerHost || !session.currentCard) return;
    mp.syncGameState({
      type: "game-sync",
      clueText: session.currentCard.clues[session.clueIndex],
      clueIndex: session.clueIndex,
      pointValue: 5 - session.clueIndex,
      revealed: session.revealed,
      cityName: session.currentCard.city,
      country: session.currentCard.country,
      earnedPoints: session.earnedPoints,
      buzzWinner: mp.buzzWinner,
      players: game.players,
      currentReader: currentReader ?? undefined,
      imageUrl: session.clueIndex === 2 ? session.currentCard.imageUrl : undefined,
      hintVoteCount: mp.hintVotes.size,
      totalNonReaders: allParticipants.length - 1,
      showSummary,
      lastRoundPoints: lastRound.points,
      lastRoundWinner: lastRound.winnerName,
      summaryCityName: lastRound.cityName ?? undefined,
      summaryCountry: lastRound.country ?? undefined,
    });
  }, [isMultiplayerHost, session.currentCard, session.clueIndex, session.revealed, session.earnedPoints, mp.buzzWinner, game.players, currentReader, mp.hintVotes.size, allParticipants.length, showSummary, lastRound]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdBarOpen((prev) => !prev);
      }
      if (e.key === "Escape" && !cmdBarOpen && game.screen === "playing" && !isMultiplayerPlayer) {
        session.skip();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [session, cmdBarOpen, game.screen, isMultiplayerPlayer]);

  // --- Actions ---

  const startFreeplay = useCallback(() => game.startGame("freeplay"), [game]);

  const startCompetition = useCallback(
    (names: string[]) => game.startGame("competition", names),
    [game],
  );

  const openMultiplayer = useCallback(() => {
    setMpScreen("lobby");
    lobby.startScanning();
  }, [lobby]);

  const hostGame = useCallback((name: string) => {
    lobby.stopScanning();
    setPlayerName(name);
    mp.hostGame(name);
  }, [mp, lobby]);

  const joinGame = useCallback(
    (code: string, name: string) => {
      setPlayerName(name);
      mp.joinGame(code, name);
      window.history.replaceState({}, "", `/?room=${code}`);
    },
    [mp],
  );

  const startMultiplayer = useCallback(() => {
    // Include host as a player
    const names = [mp.hostName, ...mp.peers.map((p) => p.name)];
    game.startGame("competition", names);
    setReaderIndex(0);
    setMpScreen("playing");
    lobby.stopAdvertising();
  }, [mp.hostName, mp.peers, game, lobby]);

  const backToStart = useCallback(() => {
    mp.cleanup();
    lobby.stopScanning();
    lobby.stopAdvertising();
    setMpScreen(null);
    setInitialRoomCode(null);
    window.history.replaceState({}, "", "/");
  }, [mp, lobby]);

  const nextClue = useCallback(() => session.nextClue(), [session]);

  const markCorrect = useCallback(() => session.correct(), [session]);

  const awardPoints = useCallback(
    (playerId: string) => {
      if (session.earnedPoints && session.earnedPoints > 0) {
        game.awardPoints(playerId, session.earnedPoints);
        const player = game.players.find((p) => p.id === playerId);
        setLastRound({ points: session.earnedPoints, winnerName: player?.name ?? null, cityName: session.currentCard?.city ?? null, country: session.currentCard?.country ?? null });
      }
      mp.resetBuzzFull();
      if (isCompetition) {
        setShowSummary(true);
      } else {
        session.nextCard();
      }
    },
    [session, game, mp, isCompetition],
  );

  const noOneGuessed = useCallback(() => {
    setLastRound({ points: 0, winnerName: null, cityName: session.currentCard?.city ?? null, country: session.currentCard?.country ?? null });
    mp.resetBuzzFull();
    if (isCompetition) {
      setShowSummary(true);
    } else {
      session.nextCard();
    }
  }, [session, mp, isCompetition]);

  const skipCard = useCallback(() => {
    mp.resetBuzzFull();
    session.skip();
  }, [mp, session]);

  const nextCardFromSummary = useCallback(() => {
    setShowSummary(false);
    setLastRound({ points: 0, winnerName: null, cityName: session.currentCard?.city ?? null, country: session.currentCard?.country ?? null });
    setReaderIndex((i) => i + 1);
    session.nextCard();
  }, [session]);

  const buzzCorrect = useCallback(() => {
    if (!mp.buzzWinner) return;
    const player = game.players.find((p) => p.name === mp.buzzWinner);
    if (player) {
      session.correct();
      setTimeout(() => {
        const points = 5 - session.clueIndex;
        game.awardPoints(player.id, points);
        setLastRound({ points, winnerName: player.name, cityName: session.currentCard?.city ?? null, country: session.currentCard?.country ?? null });
        mp.resetBuzzFull();
        setReaderIndex((i) => i + 1);
        setShowSummary(true);
      }, 50);
    }
  }, [mp.buzzWinner, game, session, mp]);

  const buzzWrong = useCallback(() => mp.wrongBuzz(), [mp]);

  const buzz = useCallback(() => mp.buzz(), [mp]);

  const toggleCmdBar = useCallback(() => setCmdBarOpen((p) => !p), []);
  const closeCmdBar = useCallback(() => setCmdBarOpen(false), []);

  const resetScores = useCallback(() => game.resetScores(), [game]);
  const adjustScore = useCallback(
    (playerId: string, delta: number) => game.adjustScore(playerId, delta),
    [game],
  );
  const addPlayer = useCallback((name: string) => game.addPlayer(name), [game]);

  const newGame = useCallback(() => {
    mp.cleanup();
    setMpScreen(null);
    game.resetGame();
    setCmdBarOpen(false);
  }, [mp, game]);

  return {
    screen,
    currentCard: session.currentCard,
    clueIndex: session.clueIndex,
    revealed: session.revealed,
    earnedPoints: session.earnedPoints,
    cardsRemaining: session.cardsRemaining,
    isCompetition,
    players: game.players,
    showAnswer: isCompetition || isMultiplayer,
    isMultiplayer,
    mpRole: mp.role,
    roomCode: mp.roomCode,
    mpConnected: mp.connected,
    mpPeers: mp.peers,
    buzzWinner: mp.buzzWinner,
    hasBuzzed: mp.hasBuzzed,
    isLockedOut: mp.isLockedOut,
    initialRoomCode,
    availableGames: lobby.availableGames,
    currentReader,
    isReader,
    gameSync: mp.gameSync,
    playerName,
    lastRound,
    cmdBarOpen,
    startFreeplay,
    startCompetition,
    openMultiplayer,
    hostGame,
    joinGame,
    startMultiplayer,
    backToStart,
    nextClue,
    markCorrect,
    awardPoints,
    noOneGuessed,
    skipCard,
    nextCardFromSummary,
    buzzCorrect,
    buzzWrong,
    buzz,
    sendReaderAction: mp.sendReaderAction,
    voteNextHint: mp.voteNextHint,
    toggleCmdBar,
    closeCmdBar,
    resetScores,
    adjustScore,
    addPlayer,
    newGame,
  };
}
