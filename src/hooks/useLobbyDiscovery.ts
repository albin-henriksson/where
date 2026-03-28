import { useState, useEffect, useCallback, useRef } from "react";
import { joinRoom } from "trystero";
import type { Room } from "trystero";

const APP_ID = "where-city-quiz-game";
const LOBBY_ROOM = "lobby";

interface AdvertisedGame {
  roomCode: string;
  hostName: string;
  playerCount: number;
  timestamp: number;
}

export function useLobbyDiscovery() {
  const [availableGames, setAvailableGames] = useState<AdvertisedGame[]>([]);
  const [scanning, setScanning] = useState(false);
  const lobbyRef = useRef<Room | null>(null);
  const advertiseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sendRef = useRef<((data: unknown) => void) | null>(null);

  const startScanning = useCallback(() => {
    if (lobbyRef.current) return;
    setScanning(true);

    const lobby = joinRoom({ appId: APP_ID }, LOBBY_ROOM);
    lobbyRef.current = lobby;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [send, receive] = lobby.makeAction<any>("advertise");
    sendRef.current = send;

    receive((data: AdvertisedGame) => {
      if (data.roomCode) {
        setAvailableGames((prev) => {
          const filtered = prev.filter((g) => g.roomCode !== data.roomCode);
          return [...filtered, { ...data, timestamp: Date.now() }];
        });
      }
    });

    // Clean up stale games every 5s
    const cleanupInterval = setInterval(() => {
      setAvailableGames((prev) =>
        prev.filter((g) => Date.now() - g.timestamp < 15000),
      );
    }, 5000);

    lobby.onPeerLeave(() => {
      // A host may have left — stale entries will be cleaned up by the interval
    });

    return () => clearInterval(cleanupInterval);
  }, []);

  const stopScanning = useCallback(() => {
    lobbyRef.current?.leave();
    lobbyRef.current = null;
    sendRef.current = null;
    setScanning(false);
    setAvailableGames([]);
  }, []);

  const advertiseGame = useCallback(
    (roomCode: string, hostName: string, playerCount: number) => {
      if (!lobbyRef.current) {
        // Join lobby to advertise
        const lobby = joinRoom({ appId: APP_ID }, LOBBY_ROOM);
        lobbyRef.current = lobby;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [send] = lobby.makeAction<any>("advertise");
        sendRef.current = send;
      }

      const ad: AdvertisedGame = { roomCode, hostName, playerCount, timestamp: Date.now() };

      // Send immediately and then every 5s
      sendRef.current?.(ad);
      if (advertiseIntervalRef.current) clearInterval(advertiseIntervalRef.current);
      advertiseIntervalRef.current = setInterval(() => {
        sendRef.current?.(ad);
      }, 5000);
    },
    [],
  );

  const stopAdvertising = useCallback(() => {
    if (advertiseIntervalRef.current) {
      clearInterval(advertiseIntervalRef.current);
      advertiseIntervalRef.current = null;
    }
    lobbyRef.current?.leave();
    lobbyRef.current = null;
    sendRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      lobbyRef.current?.leave();
      if (advertiseIntervalRef.current) clearInterval(advertiseIntervalRef.current);
    };
  }, []);

  return {
    availableGames,
    scanning,
    startScanning,
    stopScanning,
    advertiseGame,
    stopAdvertising,
  };
}
