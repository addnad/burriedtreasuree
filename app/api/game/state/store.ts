// In-memory state store (in production, this would query the Solana program and Arcium MPC)
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

const playerStates = new Map<string, PlayerState>();

export function getPlayerState(wallet: string): PlayerState | null {
  return playerStates.get(wallet) || null;
}

export function setPlayerState(wallet: string, state: PlayerState): void {
  playerStates.set(wallet, state);
}

export function initializePlayerState(wallet: string): PlayerState {
  const state: PlayerState = {
    x: 0,
    y: 0,
    gold: 20,
    health: 100,
    explored: [],
    buried: [],
    stats: {
      tilesExplored: 0,
      treasuresFound: 0,
      trapsTriggered: 0,
      lootBuried: 0,
      lootDugUp: 0,
    },
  };
  playerStates.set(wallet, state);
  return state;
}

export function updatePlayerPosition(wallet: string, x: number, y: number): void {
  const state = playerStates.get(wallet);
  if (state) {
    state.x = x;
    state.y = y;
  }
}

export function addExploredTile(wallet: string, x: number, y: number, tileType: string, value: number): void {
  const state = playerStates.get(wallet);
  if (state) {
    const key = `${x},${y}`;
    if (!state.explored.includes(key)) {
      state.explored.push(key);
      state.stats.tilesExplored++;
      
      if (tileType === 'treasure') {
        state.gold += value;
        state.stats.treasuresFound++;
      } else if (tileType === 'trap') {
        state.health = Math.max(0, state.health - value);
        state.stats.trapsTriggered++;
      }
    }
  }
}

export function addBuriedLoot(wallet: string, x: number, y: number, amount: number): void {
  const state = playerStates.get(wallet);
  if (state) {
    state.gold -= amount;
    state.stats.lootBuried += amount;
    const key = `${x},${y}`;
    if (!state.buried.includes(key)) {
      state.buried.push(key);
    }
  }
}

export function addDugLoot(wallet: string, x: number, y: number, amount: number, healthLost: number): void {
  const state = playerStates.get(wallet);
  if (state) {
    if (amount > 0) {
      state.gold += amount;
      state.stats.lootDugUp += amount;
    }
    if (healthLost > 0) {
      state.health = Math.max(0, state.health - healthLost);
      state.stats.trapsTriggered++;
    }
    const key = `${x},${y}`;
    if (!state.explored.includes(key)) {
      state.explored.push(key);
      state.stats.tilesExplored++;
    }
  }
}
