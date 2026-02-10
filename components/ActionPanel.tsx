'use client';

interface ActionPanelProps {
  mode: 'explore' | 'dig' | 'bury';
  onModeChange: (mode: 'explore' | 'dig' | 'bury') => void;
  selectedTile: [number, number] | null;
  buryAmount: string;
  onBuryAmountChange: (amount: string) => void;
  onExplore: () => void;
  onDig: () => void;
  onBury: () => void;
  computing: boolean;
  playerGold: number;
}

export function ActionPanel({
  mode,
  onModeChange,
  selectedTile,
  buryAmount,
  onBuryAmountChange,
  onExplore,
  onDig,
  onBury,
  computing,
  playerGold,
}: ActionPanelProps) {
  return (
    <div className="panel" style={{ marginTop: '12px' }}>
      <div className="panel-title">Actions</div>

      <div className="mode-toggle" style={{ marginBottom: '12px' }}>
        <button
          className={`mode-btn ${mode === 'explore' ? 'active' : ''}`}
          onClick={() => onModeChange('explore')}
        >
          🔍 Explore
        </button>
        <button
          className={`mode-btn ${mode === 'dig' ? 'active' : ''}`}
          onClick={() => onModeChange('dig')}
        >
          ⛏️ Dig
        </button>
        <button
          className={`mode-btn ${mode === 'bury' ? 'active' : ''}`}
          onClick={() => onModeChange('bury')}
        >
          💎 Bury
        </button>
      </div>

      {selectedTile ? (
        <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '10px', fontFamily: 'monospace' }}>
          Selected: ({selectedTile[0]}, {selectedTile[1]})
        </div>
      ) : (
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
          Click an adjacent tile to select it
        </div>
      )}

      {mode === 'explore' && (
        <>
          <button
            className="action-btn explore"
            onClick={onExplore}
            disabled={!selectedTile || computing}
          >
            🔍 Explore Tile
          </button>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            MPC decrypts this tile for your wallet only. Base map contents are revealed without exposing the full grid.
          </div>
        </>
      )}

      {mode === 'dig' && (
        <>
          <button
            className="action-btn dig"
            onClick={onDig}
            disabled={!selectedTile || computing}
          >
            ⛏️ Dig Here
          </button>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            MPC checks <strong>both</strong> base map and buried loot layers. Returns combined result without revealing layer sources.
          </div>
        </>
      )}

      {mode === 'bury' && (
        <>
          <div className="bury-input-row">
            <input
              type="number"
              className="bury-input"
              placeholder="Gold amount"
              min="1"
              max={playerGold}
              value={buryAmount}
              onChange={(e) => onBuryAmountChange(e.target.value)}
            />
          </div>
          <button
            className="action-btn bury"
            onClick={onBury}
            disabled={!selectedTile || computing || !buryAmount}
          >
            💎 Bury Loot
          </button>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            MPC writes encrypted data. <span style={{ color: 'var(--buried)' }}>No public linkage</span> between your wallet and the burial site.
          </div>
        </>
      )}
    </div>
  );
}
