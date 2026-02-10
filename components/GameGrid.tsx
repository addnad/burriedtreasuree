'use client';

import { PlayerState } from '@/hooks/useGameClient';

interface GameGridProps {
  playerState: PlayerState;
  selectedTile: [number, number] | null;
  onTileSelect: (tile: [number, number] | null) => void;
  onTileDoubleClick: (x: number, y: number) => void;
  computing: boolean;
  computingAction: string;
}

export function GameGrid({
  playerState,
  selectedTile,
  onTileSelect,
  onTileDoubleClick,
  computing,
  computingAction,
}: GameGridProps) {
  const GRID_SIZE = 10;
  const exploredSet = new Set(playerState.explored);
  const buriedSet = new Set(playerState.buried);

  const isAdjacent = (px: number, py: number, tx: number, ty: number) => {
    const dx = Math.abs(px - tx);
    const dy = Math.abs(py - ty);
    return dx <= 1 && dy <= 1 && !(px === tx && py === ty);
  };

  const handleTileClick = (x: number, y: number) => {
    if (playerState.x === x && playerState.y === y) return;
    if (isAdjacent(playerState.x, playerState.y, x, y)) {
      onTileSelect([x, y]);
    }
  };

  const handleTileDoubleClick = (x: number, y: number) => {
    if (isAdjacent(playerState.x, playerState.y, x, y)) {
      onTileDoubleClick(x, y);
    }
  };

  const renderTile = (x: number, y: number) => {
    const isPlayer = playerState.x === x && playerState.y === y;
    const adj = isAdjacent(playerState.x, playerState.y, x, y);
    const key = `${x},${y}`;
    const isExplored = exploredSet.has(key);
    const isBuried = buriedSet.has(key);
    const isSelected = selectedTile && selectedTile[0] === x && selectedTile[1] === y;

    let tileClass = 'tile';
    let icon = <span className="tile-lock">🔒</span>;

    if (isPlayer) {
      tileClass += ' player-here';
      icon = <>🧭</>;
    } else if (isExplored) {
      // In a real implementation, we'd get tile info from the game state
      // For now, we'll show a generic explored state
      tileClass += ' explored-empty';
      icon = <span style={{ opacity: 0.3 }}>·</span>;
    } else if (isBuried) {
      tileClass += ' has-buried';
      icon = <span className="tile-icon">💎</span>;
    } else if (adj) {
      tileClass += ' adjacent';
      icon = <span className="tile-lock" style={{ opacity: 0.5 }}>?</span>;
    }

    if (isSelected) tileClass += ' selected';

    return (
      <div
        key={`${x}-${y}`}
        className={tileClass}
        onClick={() => handleTileClick(x, y)}
        onDoubleClick={() => handleTileDoubleClick(x, y)}
      >
        {icon}
        <span className="tile-coord">{x},{y}</span>
      </div>
    );
  };

  return (
    <>
      <div className="island-grid">
        {Array.from({ length: GRID_SIZE }, (_, y) =>
          Array.from({ length: GRID_SIZE }, (_, x) => renderTile(x, y))
        )}
      </div>
      {computing && (
        <div className="computing-overlay">
          <div className="computing-spinner"></div>
          <div className="computing-text">{computingAction}</div>
        </div>
      )}
    </>
  );
}
