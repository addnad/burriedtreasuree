# 🏴‍☠️ Buried Treasure — Encrypted Island Exploration on Arcium

> A fully onchain hidden-information game where the entire game board, player positions, and buried loot are encrypted inside Arcium's MPC network. No one can read the map — not players, not validators, not indexers.

**Arcium Wave 2 RTG Submission | Hidden-Information Games Category**

---

## Why This Game Cannot Exist Without Arcium MPC

| Aspect | Normal Onchain Game | With Arcium MPC |
|---|---|---|
| Map state | Public — anyone reads tiles via explorer | `Enc<Mxe, MapMatrix>` — unreadable by anyone |
| Player position | Visible in contract storage | Encrypted in MXE, verified by MPC |
| Treasure amounts | Readable onchain | Decrypted only for exploring player |
| Buried loot | Public tx links wallet → tile | Zero public linkage, encrypted layer |
| Fog of war | Impossible (all state visible) | Real fog — tiles unknown until explored |

## Architecture

```
Frontend (React+TS)  →  Solana Program (Anchor+Arcium)  →  Arcium MPC (MXE)
     │                        │                                │
     │ Wallet signature       │ queue_computation()            │ Arx node cluster
     │ Encrypt inputs         │ Public event logs only         │ Encrypted base map
     │ Decrypt results        │ No secrets stored              │ Encrypted buried layer
     │                        │                                │ Encrypted player state
     ▼                        ▼                                ▼
  Player sees result    Validators see encrypted blobs    Nodes compute on ciphertext
```

## Encrypted State Model

**Three independent encrypted layers:**

1. **Base Map** (`Enc<Mxe, MapMatrix>`) — 10×10 grid of tiles with hidden types/values
2. **Buried Loot** (`Enc<Mxe, BuriedLayer>`) — player-deposited loot, zero wallet linkage
3. **Player State** (`Enc<Mxe, PlayerState>`) — position, gold, health per player

## MPC Instructions (Arcis/Rust)

- `init_map(seed)` → Seeds encrypted 10×10 grid with treasures and traps
- `explore(tile)` → Decrypts single tile for requesting player only
- `bury(tile, amount)` → Writes to buried layer with no public player link
- `dig(tile)` → Checks BOTH base + buried layers, returns combined result
- `move_player(target)` → Verifies adjacency, updates encrypted position

## Project Structure

```
buried-treasure/
├── programs/buried_treasure/src/lib.rs    # Solana Anchor program
├── encrypted-ixs/src/lib.rs              # Arcis MPC instructions
├── app/
│   ├── layout.tsx                         # Next.js root layout
│   ├── page.tsx                           # Main page
│   ├── globals.css                        # Global styles
│   ├── components.css                    # Component styles
│   └── api/game/                         # Backend API routes
│       ├── register/route.ts
│       ├── move/route.ts
│       ├── explore/route.ts
│       ├── dig/route.ts
│       ├── bury/route.ts
│       └── state/route.ts
├── components/
│   ├── WalletProvider.tsx                 # Solana wallet adapter
│   ├── Header.tsx                         # App header
│   ├── LandingPage.tsx                    # Landing page
│   ├── GameBoard.tsx                      # Main game board
│   ├── GameGrid.tsx                       # 10×10 grid component
│   ├── PlayerStats.tsx                    # Player stats panel
│   ├── ActionPanel.tsx                    # Action buttons
│   └── EventLog.tsx                       # Event log
├── lib/
│   └── game-client.ts                     # Game client SDK
├── hooks/
│   └── useGameClient.ts                   # React hook for game
├── tests/buried_treasure.ts              # Integration tests
├── Arcium.toml                            # MXE configuration
├── Anchor.toml                            # Anchor configuration
├── next.config.js                         # Next.js config
├── tsconfig.json                          # TypeScript config
└── package.json
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Rust (for Anchor/Arcium programs)
- Solana CLI
- Phantom wallet (browser extension)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Install Arcium CLI (if not already installed)
curl "https://bin.arcium.com/download/arcup_x86_64_linux_0.1.47" -o ~/.cargo/bin/arcup
chmod +x ~/.cargo/bin/arcup
arcup install

# 3. Create environment file
cp .env.example .env.local
# Edit .env.local with your configuration
```

### Running the Application

```bash
# Start Next.js development server
npm run dev

# In a separate terminal, build Arcium programs
npm run arcium:build

# Test Arcium programs (optional)
npm run arcium:test

# Deploy to mainnet (when ready)
npm run arcium:deploy --network mainnet
```

The frontend will be available at `http://localhost:3000`

### Building for Production

```bash
# Build Next.js app
npm run build

# Start production server
npm start
```

## Privacy Proof

The game's Solana program stores ONLY:
- Wallet address (identity)
- Tiles explored count (public stat for leaderboard)
- Game metadata (created_at, is_active)

Everything else — position, gold, health, map contents, buried loot locations — exists exclusively as encrypted blobs inside the Arcium MXE. The only way to access this data is through the MPC computation functions, which enforce game rules and selective decryption.
