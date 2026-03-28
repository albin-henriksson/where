import { useState, useEffect, useCallback, useRef } from "react";
import { joinRoom } from "@trystero-p2p/mqtt";
import type { Room } from "@trystero-p2p/mqtt";
import { TRYSTERO_CONFIG } from "./useMultiplayer";

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
  const cleanupIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Ensure we have a lobby connection (shared between scanning and advertising)
  const ensureLobby = useCallback(() => {
    if (lobbyRef.current) return;

    const lobby = joinRoom(TRYSTERO_CONFIG, LOBBY_ROOM);
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
  }, []);

  const startScanning = useCallback(() => {
    if (scanning) return;
    setScanning(true);
    ensureLobby();

    // Clean up stale games every 5s
    if (!cleanupIntervalRef.current) {
      cleanupIntervalRef.current = setInterval(() => {
        setAvailableGames((prev) =>
          prev.filter((g) => Date.now() - g.timestamp < 15000),
        );
      }, 5000);
    }
  }, [scanning, ensureLobby]);

  const stopScanning = useCallback(() => {
    setScanning(false);
    setAvailableGames([]);
    if (cleanupIntervalRef.current) {
      clearInterval(cleanupIntervalRef.current);
      cleanupIntervalRef.current = null;
    }
    // Only leave lobby if not advertising
    if (!advertiseIntervalRef.current) {
      lobbyRef.current?.leave();
      lobbyRef.current = null;
      sendRef.current = null;
    }
  }, []);

  const advertiseGame = useCallback(
    (roomCode: string, hostName: string, playerCount: number) => {
      ensureLobby();

      const ad: AdvertisedGame = { roomCode, hostName, playerCount, timestamp: Date.now() };

      // Send immediately and then every 3s
      sendRef.current?.(ad);
      if (advertiseIntervalRef.current) clearInterval(advertiseIntervalRef.current);
      advertiseIntervalRef.current = setInterval(() => {
        sendRef.current?.(ad);
      }, 3000);
    },
    [ensureLobby],
  );

  const stopAdvertising = useCallback(() => {
    if (advertiseIntervalRef.current) {
      clearInterval(advertiseIntervalRef.current);
      advertiseIntervalRef.current = null;
    }
    // Only leave lobby if not scanning
    if (!scanning) {
      lobbyRef.current?.leave();
      lobbyRef.current = null;
      sendRef.current = null;
    }
  }, [scanning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      lobbyRef.current?.leave();
      if (advertiseIntervalRef.current) clearInterval(advertiseIntervalRef.current);
      if (cleanupIntervalRef.current) clearInterval(cleanupIntervalRef.current);
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
