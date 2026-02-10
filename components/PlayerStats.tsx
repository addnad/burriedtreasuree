'use client';

import { PlayerState } from '@/hooks/useGameClient';

interface PlayerStatsProps {
  playerState: PlayerState;
  computing: boolean;
  computingAction: string;
}

const STARTING_HEALTH = 100;

export function PlayerStats({ playerState, computing, computingAction }: PlayerStatsProps) {
  return (
    <div>
      <div className="panel">
        <div className="panel-title">Player State</div>
        <div className={`mpc-status ${computing ? 'mpc-processing' : ''}`}>
          <span className="mpc-dot"></span>
          <span style={{ fontFamily: 'monospace', color: 'var(--text-dim)' }}>
            {computing ? computingAction : 'MPC cluster idle'}
          </span>
        </div>
        <div className="stat-row">
          <span className="stat-label">💰 Gold</span>
          <span className="stat-value treasure-color">{playerState.gold}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">❤️ Health</span>
          <span className="stat-value trap-color">
            {playerState.health}/{STARTING_HEALTH}
          </span>
        </div>
        <div className="stat-row">
          <span className="stat-label">📍 Position</span>
          <span className="stat-value accent-color">
            ({playerState.x}, {playerState.y})
          </span>
        </div>
        <div className="stat-row">
          <span className="stat-label">🗺️ Explored</span>
          <span className="stat-value">
            {playerState.stats.tilesExplored}/100
          </span>
        </div>
        <div className="stat-row">
          <span className="stat-label">💎 Treasures</span>
          <span className="stat-value treasure-color">
            {playerState.stats.treasuresFound}
          </span>
        </div>
        <div className="stat-row">
          <span className="stat-label">💀 Traps Hit</span>
          <span className="stat-value trap-color">
            {playerState.stats.trapsTriggered}
          </span>
        </div>
        <div className="stat-row">
          <span className="stat-label">🪦 Loot Buried</span>
          <span className="stat-value buried-color">
            {playerState.stats.lootBuried}
          </span>
        </div>
      </div>
    </div>
  );
}
