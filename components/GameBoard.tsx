'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { GameGrid } from './GameGrid';
import { PlayerStats } from './PlayerStats';
import { ActionPanel } from './ActionPanel';
import { EventLog } from './EventLog';
import { useGameClient } from '@/hooks/useGameClient';

export function GameBoard() {
  const { publicKey } = useWallet();
  const { client, playerState, isLoading, error } = useGameClient();
  const [selectedTile, setSelectedTile] = useState<[number, number] | null>(null);
  const [mode, setMode] = useState<'explore' | 'dig' | 'bury'>('explore');
  const [buryAmount, setBuryAmount] = useState('');
  const [events, setEvents] = useState<Array<{ type: string; message: string; time: string }>>([]);
  const [computing, setComputing] = useState(false);
  const [computingAction, setComputingAction] = useState('');

  const addEvent = useCallback((type: string, message: string) => {
    const time = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setEvents((prev) => [{ type, message, time }, ...prev.slice(0, 49)]);
  }, []);

  const handleMove = useCallback(async (x: number, y: number) => {
    if (!client || computing) return;
    setComputing(true);
    setComputingAction('MPC: Verifying adjacency...');
    addEvent('info', `Moving to (${x}, ${y})...`);

    try {
      const result = await client.movePlayer(x, y);
      if (result.success) {
        addEvent('move', `Moved to (${result.newX}, ${result.newY})`);
        setSelectedTile(null);
      } else {
        addEvent('system', `Move failed: ${result.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      addEvent('system', `Move error: ${err.message || 'Unknown error'}`);
    } finally {
      setComputing(false);
    }
  }, [client, computing, addEvent]);

  const handleExplore = useCallback(async () => {
    if (!selectedTile || !client || computing) return;
    const [x, y] = selectedTile;
    setComputing(true);
    setComputingAction('MPC: Decrypting tile for your eyes only...');
    addEvent('info', `Exploring tile (${x}, ${y})...`);

    try {
      const result = await client.explore(x, y);
      if (result.success) {
        const message = result.message || 'Explored tile';
        if (result.tileType === 'treasure') {
          addEvent('treasure', message);
        } else if (result.tileType === 'trap') {
          addEvent('trap', message);
        } else {
          addEvent('info', message);
        }
      } else {
        addEvent('system', result.error || 'Explore failed');
      }
    } catch (err: any) {
      addEvent('system', `Explore error: ${err.message || 'Unknown error'}`);
    } finally {
      setComputing(false);
    }
  }, [selectedTile, client, computing, addEvent]);

  const handleDig = useCallback(async () => {
    if (!selectedTile || !client || computing) return;
    const [x, y] = selectedTile;
    setComputing(true);
    setComputingAction('MPC: Checking base + buried layers (encrypted)...');
    addEvent('info', `Digging at (${x}, ${y})...`);

    try {
      const result = await client.dig(x, y);
      if (result.success) {
        const message = result.message || 'Dug at tile';
        if (result.foundType === 'treasure') {
          addEvent('treasure', message);
        } else if (result.foundType === 'trap') {
          addEvent('trap', message);
        } else {
          addEvent('info', message);
        }
      } else {
        addEvent('system', result.error || 'Dig failed');
      }
    } catch (err: any) {
      addEvent('system', `Dig error: ${err.message || 'Unknown error'}`);
    } finally {
      setComputing(false);
    }
  }, [selectedTile, client, computing, addEvent]);

  const handleBury = useCallback(async () => {
    if (!selectedTile || !client || computing) return;
    const amount = parseInt(buryAmount);
    if (isNaN(amount) || amount <= 0) {
      addEvent('system', 'Enter a valid amount to bury');
      return;
    }
    const [x, y] = selectedTile;
    setComputing(true);
    setComputingAction('MPC: Encrypting burial with zero public linkage...');
    addEvent('bury', `Burying ${amount} gold at (${x}, ${y})...`);

    try {
      const result = await client.bury(x, y, amount);
      if (result.success) {
        addEvent('bury', `Buried ${amount} gold. No one can link this to you.`);
        setBuryAmount('');
      } else {
        addEvent('system', result.error || 'Bury failed');
      }
    } catch (err: any) {
      addEvent('system', `Bury error: ${err.message || 'Unknown error'}`);
    } finally {
      setComputing(false);
    }
  }, [selectedTile, client, computing, buryAmount, addEvent]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="computing-spinner"></div>
        <div className="computing-text">Initializing game client...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  if (!playerState) {
    return (
      <div className="loading-container">
        <div className="computing-text">Registering player...</div>
      </div>
    );
  }

  return (
    <div className="main-layout">
      <PlayerStats
        playerState={playerState}
        computing={computing}
        computingAction={computingAction}
      />
      <div className="grid-container">
        <div className="grid-header">
          <h2>🏝️ Island Grid (10×10 encrypted matrix)</h2>
          <span className="privacy-badge private">
            🔒 {100 - playerState.stats.tilesExplored} tiles hidden
          </span>
        </div>
        <div style={{ position: 'relative' }}>
          <GameGrid
            playerState={playerState}
            selectedTile={selectedTile}
            onTileSelect={setSelectedTile}
            onTileDoubleClick={handleMove}
            computing={computing}
            computingAction={computingAction}
          />
        </div>
        <div className="grid-legend">
          <div className="legend-item">
            <div className="legend-color fog"></div>
            Unknown (encrypted)
          </div>
          <div className="legend-item">
            <div className="legend-color player"></div>
            Your position
          </div>
          <div className="legend-item">
            <div className="legend-color treasure"></div>
            Treasure
          </div>
          <div className="legend-item">
            <div className="legend-color trap"></div>
            Trap
          </div>
          <div className="legend-item">
            <div className="legend-color buried"></div>
            You buried loot
          </div>
        </div>
      </div>
      <div>
        <ActionPanel
          mode={mode}
          onModeChange={setMode}
          selectedTile={selectedTile}
          buryAmount={buryAmount}
          onBuryAmountChange={setBuryAmount}
          onExplore={handleExplore}
          onDig={handleDig}
          onBury={handleBury}
          computing={computing}
          playerGold={playerState.gold}
        />
        <EventLog events={events} />
      </div>
    </div>
  );
}
