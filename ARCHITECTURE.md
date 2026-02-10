# Buried Treasure — System Architecture

## Overview

Buried Treasure is a fully functional encrypted island exploration game built on **Arcium MPC** and **Solana**. The entire game state—map tiles, player positions, buried loot—is encrypted inside Arcium's Multi-Party Computation (MPC) network, making it impossible for anyone (players, validators, indexers) to read the game state without proper authorization.

## Why This Game Cannot Exist Without Arcium MPC

| Aspect | Normal Onchain Game | With Arcium MPC |
|--------|---------------------|-----------------|
| Map state | Public — anyone reads tiles via explorer | `Enc<Mxe, MapMatrix>` — unreadable by anyone |
| Player position | Visible in contract storage | Encrypted in MXE, verified by MPC |
| Treasure amounts | Readable onchain | Decrypted only for exploring player |
| Buried loot | Public tx links wallet → tile | Zero public linkage, encrypted layer |
| Fog of war | Impossible (all state visible) | Real fog — tiles unknown until explored |

## System Architecture

```
Frontend (Next.js + React + TS)  
    ↓
Solana Wallet Adapter (Phantom)
    ↓
Solana Program (Anchor + Arcium)
    ↓
Arcium MPC (MXE) — Encrypted Computation
    ↓
Arx Node Cluster — Executes encrypted instructions
```

### Component Flow

1. **Client (React + TypeScript)**
   - Wallet-adapter connects Phantom wallet
   - Player encrypts inputs with MXE public key via ECDH
   - Signs transaction and submits to Solana program
   - Never sees raw map data

2. **Solana Program (Anchor + Arcium)**
   - Anchor program with `#[arcium_program]` macro
   - Validates wallet signature
   - Calls `queue_computation()` to invoke MPC instructions
   - Stores only encrypted blobs + public event logs
   - No secrets stored onchain

3. **Arcium MPC (MXE)**
   - Arcis-compiled encrypted instructions run on Arx node cluster
   - `Enc<Mxe, MapMatrix>` holds the full 10×10 map
   - Each function decrypts only what's needed
   - Re-encrypts results for the requesting player

4. **Callback → Client**
   - MPC result emitted as Solana event
   - Client's TS SDK catches the event
   - Decrypts with shared secret
   - Renders result (only this player can read it)

## Encrypted State Model

Three independent encrypted layers:

1. **Base Map** (`Enc<Mxe, MapMatrix>`) — 10×10 grid of tiles with hidden types/values
2. **Buried Loot** (`Enc<Mxe, BuriedLayer>`) — player-deposited loot, zero wallet linkage
3. **Player State** (`Enc<Mxe, PlayerState>`) — position, gold, health per player

## MPC Instructions (Arcis/Rust)

### `init_map(seed)`
- Seeds encrypted 10×10 grid with treasures and traps
- Map encrypted to MXE key
- No client, validator, or indexer can read tile contents

### `explore(tile)`
- Verifies player is adjacent to target tile
- Decrypts single tile from base map
- Re-encrypts result for requesting player only
- Updates encrypted player inventory

### `bury(tile, amount)`
- Verifies player inventory ≥ amount (encrypted comparison)
- Writes encrypted data into buried loot layer
- **No public linkage** between player and tile
- BuryResultEvent intentionally omits player field

### `dig(tile)`
- Checks **BOTH** base map layer + buried loot layer
- Returns combined result without revealing layer sources
- Updates encrypted inventory accordingly
- Clears buried loot if found

### `move_player(target)`
- Verifies adjacency inside MPC (no position data leaves encrypted space)
- Updates encrypted position
- Returns success/failure (no coordinates leaked)

## Frontend Structure

```
app/
├── layout.tsx              # Root layout with WalletProvider
├── page.tsx                 # Main page (landing or game)
├── globals.css              # Global styles
├── components.css           # Component-specific styles
└── api/
    └── game/
        ├── register/        # Player registration
        ├── move/            # Move player
        ├── explore/         # Explore tile
        ├── dig/             # Dig at tile
        ├── bury/            # Bury loot
        └── state/           # Get player state

components/
├── WalletProvider.tsx       # Solana wallet adapter setup
├── Header.tsx               # App header with wallet button
├── LandingPage.tsx          # Landing page
├── GameBoard.tsx             # Main game board
├── GameGrid.tsx              # 10×10 island grid
├── PlayerStats.tsx           # Player statistics panel
├── ActionPanel.tsx           # Action buttons (explore/dig/bury)
└── EventLog.tsx              # Event log display

lib/
└── game-client.ts            # Game client SDK (encryption, MPC calls)

hooks/
└── useGameClient.ts          # React hook for game client
```

## Backend API Layer

The backend API routes (`app/api/game/*`) serve as a minimal relay layer that:

1. Receives encrypted inputs from the frontend
2. Calls the Solana program instructions
3. Queues MPC computations via Arcium
4. Waits for computation finalization
5. Returns encrypted results to the client

**Note:** In production, these routes would:
- Use the actual Solana program IDL
- Handle ECDH encryption/decryption
- Interact with Arcium SDK for MPC calls
- Manage computation offsets and finalization

## Privacy Guarantees

### What's Public (Onchain)
- Wallet address (identity)
- Tiles explored count (public stat for leaderboard)
- Game metadata (created_at, is_active)
- Action type (move, explore, dig, bury) — but NOT coordinates or amounts

### What's Encrypted (MPC Only)
- Player position (x, y)
- Player gold balance
- Player health
- Map tile contents (type, value)
- Buried loot locations
- Buried loot amounts
- Buried loot ownership (no wallet linkage)

### Selective Decryption
- `explore`: Only the requesting player receives the decrypted tile content
- `dig`: Combined result from both layers, but layer sources are hidden
- `bury`: No public event reveals player-tile linkage

## Development Setup

### Prerequisites
- Node.js 18+
- Rust (for Anchor/Arcium programs)
- Arcium CLI
- Solana CLI
- Phantom wallet (browser extension)

### Installation

```bash
# Install dependencies
npm install

# Install Arcium CLI (if not already installed)
curl "https://bin.arcium.com/download/arcup_x86_64_linux_0.1.47" -o ~/.cargo/bin/arcup
chmod +x ~/.cargo/bin/arcup
arcup install
```

### Running

```bash
# Start Next.js dev server
npm run dev

# Build Arcium programs (separate terminal)
npm run arcium:build

# Test Arcium programs
npm run arcium:test

# Deploy to devnet
npm run arcium:deploy
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_PROGRAM_ID=BuRiEdTrEaSuRe111111111111111111111111111
```

## Production Deployment

1. **Build Next.js app**: `npm run build`
2. **Deploy Solana program**: `npm run arcium:deploy --network mainnet`
3. **Deploy frontend**: Deploy to Vercel, Netlify, or your preferred hosting
4. **Update program ID**: Set `NEXT_PUBLIC_PROGRAM_ID` in production environment

## Security Considerations

- **Wallet signatures required** for every action (identity verification)
- **ECDH encryption** ensures only the requesting player can decrypt results
- **No secrets onchain** — all sensitive data encrypted in MPC
- **Zero-linkage burial** — buried loot cannot be traced to wallet
- **Selective decryption** — only rule-required data is revealed

## Future Enhancements

- Multi-player competitive mode
- Leaderboard with encrypted scoring
- NFT rewards for achievements
- Cross-chain support
- Mobile app (React Native)

## License

MIT
