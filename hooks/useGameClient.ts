'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { BuriedTreasureClient } from '@/lib/game-client';

export interface PlayerState {
  x: number;
  y: number;
  gold: number;
  health: number;
  explored: string[];
  buried: string[];
  stats: {
    tilesExplored: number;
    treasuresFound: number;
    trapsTriggered: number;
    lootBuried: number;
    lootDugUp: number;
  };
}

export function useGameClient() {
  const { publicKey, signTransaction, signMessage } = useWallet();
  const [client, setClient] = useState<BuriedTreasureClient | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicKey) {
      setClient(null);
      setPlayerState(null);
      setIsLoading(false);
      return;
    }

    let mounted = true;

    async function initialize() {
      try {
        setIsLoading(true);
        setError(null);

        // Create wallet adapter (simplified for now - in production would use actual wallet adapter)
        const wallet = {
          publicKey,
          signTransaction: signTransaction || (async () => { throw new Error('signTransaction not available'); }),
          signMessage: signMessage || (async () => { throw new Error('signMessage not available'); }),
        };

        // Initialize client
        const gameClient = new BuriedTreasureClient(wallet as any);
        await gameClient.initialize();

        // Register player if needed
        const state = await gameClient.getPlayerState();
        if (!state) {
          await gameClient.registerPlayer();
        }

        // Get initial state
        const initialState = await gameClient.getPlayerState();
        
        if (mounted) {
          setClient(gameClient);
          setPlayerState(initialState);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Failed to initialize game client');
          setIsLoading(false);
        }
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, [publicKey, signTransaction, signMessage]);

  // Poll for state updates
  useEffect(() => {
    if (!client) return;

    const interval = setInterval(async () => {
      try {
        const state = await client.getPlayerState();
        setPlayerState(state);
      } catch (err) {
        console.error('Failed to fetch player state:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [client]);

  return { client, playerState, isLoading, error };
}
