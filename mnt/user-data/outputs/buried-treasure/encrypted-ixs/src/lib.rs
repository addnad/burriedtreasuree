// ============================================================
// BURIED TREASURE — ARCIUM MPC ENCRYPTED INSTRUCTIONS
// These run on Arx node clusters via Arcis framework
// ============================================================

use arcis_imports::*;

#[encrypted]
mod circuits {
    use arcis_imports::*;

    // =========================================================
    // DATA STRUCTURES (all encrypted when stored)
    // =========================================================

    /// Single tile in the base map
    #[derive(Clone, Copy)]
    pub struct MapTile {
        pub tile_type: u8,  // 0 = empty, 1 = treasure, 2 = trap
        pub value: u16,     // treasure amount or trap damage
    }

    /// The full 10x10 encrypted game map (100 tiles)
    /// Stored as Enc<Mxe, MapMatrix> — only MPC nodes can read during computation
    pub struct MapMatrix {
        pub tiles: [MapTile; 100],
    }

    /// Buried loot layer — independent from base map
    /// No player wallet addresses are stored in this structure
    pub struct BuriedLayer {
        pub loot: [u16; 100], // Amount buried at each tile index
    }

    /// Per-player encrypted state
    pub struct PlayerState {
        pub x: u8,
        pub y: u8,
        pub gold: u16,
        pub health: u16,
    }

    // =========================================================
    // INPUT/OUTPUT STRUCTURES
    // =========================================================

    pub struct InitMapInput {
        pub seed: u64,
    }

    pub struct MoveInput {
        pub target_x: u8,
        pub target_y: u8,
    }

    pub struct ExploreInput {
        pub target_x: u8,
        pub target_y: u8,
    }

    pub struct BuryInput {
        pub target_x: u8,
        pub target_y: u8,
        pub amount: u16,
    }

    pub struct DigInput {
        pub target_x: u8,
        pub target_y: u8,
    }

    pub struct ExploreResult {
        pub tile_type: u8,
        pub value: u16,
    }

    pub struct DigResult {
        pub found_type: u8,   // 0 = nothing, 1 = treasure/loot, 2 = trap
        pub total_value: u16, // Combined value from both layers
        pub health_lost: u16, // Trap damage if any
    }

    pub struct MoveResult {
        pub new_x: u8,
        pub new_y: u8,
    }

    pub struct BuryResult {
        pub success: u8,
        pub new_gold: u16,
    }

    // =========================================================
    // HELPER FUNCTIONS
    // =========================================================

    /// Simple PRNG for map generation inside MPC
    /// Uses xorshift64 — deterministic from seed
    fn prng_next(state: &mut u64) -> u64 {
        let mut s = *state;
        s ^= s << 13;
        s ^= s >> 7;
        s ^= s << 17;
        *state = s;
        s
    }

    /// Absolute difference (constant-time for MPC safety)
    fn abs_diff(a: u8, b: u8) -> u8 {
        if a > b { a - b } else { b - a }
    }

    /// Check if two positions are adjacent (including diagonals)
    fn is_adjacent(px: u8, py: u8, tx: u8, ty: u8) -> bool {
        let dx = abs_diff(px, tx);
        let dy = abs_diff(py, ty);
        dx <= 1 && dy <= 1 && !(dx == 0 && dy == 0)
    }

    /// Convert (x, y) to flat index
    fn tile_index(x: u8, y: u8) -> usize {
        (y as usize) * 10 + (x as usize)
    }

    // =========================================================
    // MPC INSTRUCTIONS
    // =========================================================

    /// Initialize the encrypted game map with seeded PRNG
    /// Called once per game. Map encrypted to MXE key.
    /// 
    /// Privacy: The seed determines map layout. After this call,
    /// the map exists ONLY in encrypted form inside the MXE.
    /// No client, validator, or indexer can read tile contents.
    #[instruction]
    pub fn init_map(
        seed_ctxt: Enc<Shared, InitMapInput>,
    ) -> Enc<Mxe, MapMatrix> {
        let seed_input = seed_ctxt.to_arcis();
        let mut rng_state = seed_input.seed;

        let mut map = MapMatrix {
            tiles: [MapTile { tile_type: 0, value: 0 }; 100],
        };

        // Place 15 treasures
        let mut placed: u8 = 0;
        while placed < 15 {
            let idx = (prng_next(&mut rng_state) % 100) as usize;
            // Skip tile (0,0) — player spawn
            if idx != 0 && map.tiles[idx].tile_type == 0 {
                let value = 5 + (prng_next(&mut rng_state) % 46) as u16; // 5-50
                map.tiles[idx] = MapTile {
                    tile_type: 1, // treasure
                    value,
                };
                placed += 1;
            }
        }

        // Place 10 traps
        placed = 0;
        while placed < 10 {
            let idx = (prng_next(&mut rng_state) % 100) as usize;
            if idx != 0 && map.tiles[idx].tile_type == 0 {
                let value = 5 + (prng_next(&mut rng_state) % 26) as u16; // 5-30
                map.tiles[idx] = MapTile {
                    tile_type: 2, // trap
                    value,
                };
                placed += 1;
            }
        }

        // Encrypt to MXE key — only Arcium nodes can decrypt during computation
        Mxe.from_arcis(map)
    }

    /// Initialize empty buried loot layer
    /// Independent encrypted state with no player associations
    #[instruction]
    pub fn init_buried_layer() -> Enc<Mxe, BuriedLayer> {
        let layer = BuriedLayer {
            loot: [0u16; 100],
        };
        Mxe.from_arcis(layer)
    }

    /// Register a new player with starting position and resources
    #[instruction]
    pub fn register_player() -> Enc<Mxe, PlayerState> {
        let player = PlayerState {
            x: 0,
            y: 0,
            gold: 20,
            health: 100,
        };
        Mxe.from_arcis(player)
    }

    /// Move player to an adjacent tile
    /// MPC verifies adjacency without revealing positions to anyone else
    ///
    /// Privacy: Player position is encrypted. The Solana tx only shows
    /// "player called move" — not the coordinates.
    #[instruction]
    pub fn move_player(
        input: Enc<Shared, MoveInput>,
        player_state: Enc<Mxe, PlayerState>,
        requester: Shared,
    ) -> (Enc<Shared, MoveResult>, Enc<Mxe, PlayerState>) {
        let i = input.to_arcis();
        let mut p = player_state.to_arcis();

        // Verify adjacency inside MPC — no position data leaves encrypted space
        let valid = is_adjacent(p.x, p.y, i.target_x, i.target_y);
        assert!(valid); // Fails computation if not adjacent
        assert!(i.target_x < 10 && i.target_y < 10); // Bounds check

        p.x = i.target_x;
        p.y = i.target_y;

        let result = MoveResult {
            new_x: p.x,
            new_y: p.y,
        };

        // Result encrypted to player's shared secret
        // Updated state encrypted to MXE key
        (requester.from_arcis(result), Mxe.from_arcis(p))
    }

    /// Explore a tile: decrypt its contents for the requesting player ONLY
    ///
    /// Privacy: The full map stays encrypted. Only the single tile's
    /// content is revealed, and ONLY to the player who requested it.
    /// Other players, validators, and indexers learn nothing.
    #[instruction]
    pub fn explore(
        input: Enc<Shared, ExploreInput>,
        player_state: Enc<Mxe, PlayerState>,
        map: Enc<Mxe, MapMatrix>,
        requester: Shared,
    ) -> (Enc<Shared, ExploreResult>, Enc<Mxe, PlayerState>) {
        let i = input.to_arcis();
        let mut p = player_state.to_arcis();
        let m = map.to_arcis();

        // Verify player is adjacent to target tile
        let valid = is_adjacent(p.x, p.y, i.target_x, i.target_y);
        assert!(valid);
        assert!(i.target_x < 10 && i.target_y < 10);

        let idx = tile_index(i.target_x, i.target_y);
        let tile = m.tiles[idx];

        // Apply effect to encrypted player state
        if tile.tile_type == 1 {
            // Treasure — add to gold
            p.gold += tile.value;
        } else if tile.tile_type == 2 {
            // Trap — deduct health
            if p.health > tile.value {
                p.health -= tile.value;
            } else {
                p.health = 0;
            }
        }

        let result = ExploreResult {
            tile_type: tile.tile_type,
            value: tile.value,
        };

        // Result sealed to requester's key — only they can decrypt
        (requester.from_arcis(result), Mxe.from_arcis(p))
    }

    /// Bury loot at a tile with ZERO PUBLIC LINKAGE
    ///
    /// Privacy: This is the key privacy showcase. The buried loot layer
    /// is updated WITHOUT recording which wallet buried what.
    /// The Solana tx shows "player called bury" but the tile coordinates
    /// and amount are encrypted inside the MPC computation.
    /// No explorer, indexer, or other player can determine:
    /// - WHERE the loot was buried
    /// - HOW MUCH was buried
    /// - WHO buried it
    #[instruction]
    pub fn bury(
        input: Enc<Shared, BuryInput>,
        player_state: Enc<Mxe, PlayerState>,
        buried_layer: Enc<Mxe, BuriedLayer>,
        requester: Shared,
    ) -> (Enc<Shared, BuryResult>, Enc<Mxe, PlayerState>, Enc<Mxe, BuriedLayer>) {
        let i = input.to_arcis();
        let mut p = player_state.to_arcis();
        let mut b = buried_layer.to_arcis();

        // Verify player has enough gold (encrypted comparison)
        assert!(p.gold >= i.amount);
        assert!(i.amount > 0);
        assert!(i.target_x < 10 && i.target_y < 10);

        // Verify adjacency
        let valid = is_adjacent(p.x, p.y, i.target_x, i.target_y);
        assert!(valid);

        // Deduct from player, add to buried layer
        p.gold -= i.amount;
        let idx = tile_index(i.target_x, i.target_y);
        b.loot[idx] += i.amount;

        // CRITICAL: No wallet address is stored in BuriedLayer
        // The connection between this player and this tile exists
        // ONLY inside this MPC computation and is never persisted

        let result = BuryResult {
            success: 1,
            new_gold: p.gold,
        };

        (
            requester.from_arcis(result),
            Mxe.from_arcis(p),
            Mxe.from_arcis(b),
        )
    }

    /// Dig at a tile: checks BOTH base map AND buried loot layer
    ///
    /// Privacy: Two independent encrypted layers are combined in one
    /// MPC computation. The result tells the player what they found
    /// but does NOT reveal which layer contributed what to other observers.
    /// This dual-layer check is impossible without MPC — on a public
    /// chain, both layers would be readable separately.
    #[instruction]
    pub fn dig(
        input: Enc<Shared, DigInput>,
        player_state: Enc<Mxe, PlayerState>,
        map: Enc<Mxe, MapMatrix>,
        buried_layer: Enc<Mxe, BuriedLayer>,
        requester: Shared,
    ) -> (Enc<Shared, DigResult>, Enc<Mxe, PlayerState>, Enc<Mxe, BuriedLayer>) {
        let i = input.to_arcis();
        let mut p = player_state.to_arcis();
        let m = map.to_arcis();
        let mut b = buried_layer.to_arcis();

        // Verify adjacency
        let valid = is_adjacent(p.x, p.y, i.target_x, i.target_y);
        assert!(valid);
        assert!(i.target_x < 10 && i.target_y < 10);

        let idx = tile_index(i.target_x, i.target_y);
        let base_tile = m.tiles[idx];
        let buried_amount = b.loot[idx];

        let mut total_value: u16 = 0;
        let mut health_lost: u16 = 0;
        let mut found_type: u8 = 0; // nothing

        // Check buried layer
        if buried_amount > 0 {
            total_value += buried_amount;
            b.loot[idx] = 0; // Clear buried loot
            found_type = 1; // found loot
        }

        // Check base map layer
        if base_tile.tile_type == 1 {
            // Base treasure
            total_value += base_tile.value;
            found_type = 1;
        } else if base_tile.tile_type == 2 {
            // Base trap
            health_lost = base_tile.value;
            if p.health > base_tile.value {
                p.health -= base_tile.value;
            } else {
                p.health = 0;
            }
            if found_type == 0 {
                found_type = 2; // trap
            }
        }

        // Add found treasure to player gold
        p.gold += total_value;

        let result = DigResult {
            found_type,
            total_value,
            health_lost,
        };

        (
            requester.from_arcis(result),
            Mxe.from_arcis(p),
            Mxe.from_arcis(b),
        )
    }
}
