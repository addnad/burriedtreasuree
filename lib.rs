// ============================================================
// BURIED TREASURE — SOLANA PROGRAM (Anchor + Arcium)
// Orchestrates game state and invokes MPC computations
// ============================================================

use anchor_lang::prelude::*;
use arcium_anchor::prelude::*;

// Computation definition offsets (generated from Arcis function names)
const COMP_DEF_OFFSET_INIT_MAP: u32 = comp_def_offset("init_map");
const COMP_DEF_OFFSET_INIT_BURIED_LAYER: u32 = comp_def_offset("init_buried_layer");
const COMP_DEF_OFFSET_REGISTER_PLAYER: u32 = comp_def_offset("register_player");
const COMP_DEF_OFFSET_MOVE_PLAYER: u32 = comp_def_offset("move_player");
const COMP_DEF_OFFSET_EXPLORE: u32 = comp_def_offset("explore");
const COMP_DEF_OFFSET_BURY: u32 = comp_def_offset("bury");
const COMP_DEF_OFFSET_DIG: u32 = comp_def_offset("dig");

declare_id!("BuRiEdTrEaSuRe111111111111111111111111111");

#[arcium_program]
pub mod buried_treasure {
    use super::*;

    // =========================================================
    // INITIALIZATION — Comp Def Setup (called once per deployment)
    // =========================================================

    pub fn init_map_comp_def(ctx: Context<InitMapCompDef>) -> Result<()> {
        init_comp_def(ctx.accounts, COMP_DEF_OFFSET_INIT_MAP, None, None)?;
        Ok(())
    }

    pub fn init_buried_layer_comp_def(ctx: Context<InitBuriedLayerCompDef>) -> Result<()> {
        init_comp_def(ctx.accounts, COMP_DEF_OFFSET_INIT_BURIED_LAYER, None, None)?;
        Ok(())
    }

    pub fn init_register_player_comp_def(ctx: Context<InitRegisterPlayerCompDef>) -> Result<()> {
        init_comp_def(ctx.accounts, COMP_DEF_OFFSET_REGISTER_PLAYER, None, None)?;
        Ok(())
    }

    pub fn init_move_comp_def(ctx: Context<InitMoveCompDef>) -> Result<()> {
        init_comp_def(ctx.accounts, COMP_DEF_OFFSET_MOVE_PLAYER, None, None)?;
        Ok(())
    }

    pub fn init_explore_comp_def(ctx: Context<InitExploreCompDef>) -> Result<()> {
        init_comp_def(ctx.accounts, COMP_DEF_OFFSET_EXPLORE, None, None)?;
        Ok(())
    }

    pub fn init_bury_comp_def(ctx: Context<InitBuryCompDef>) -> Result<()> {
        init_comp_def(ctx.accounts, COMP_DEF_OFFSET_BURY, None, None)?;
        Ok(())
    }

    pub fn init_dig_comp_def(ctx: Context<InitDigCompDef>) -> Result<()> {
        init_comp_def(ctx.accounts, COMP_DEF_OFFSET_DIG, None, None)?;
        Ok(())
    }

    // =========================================================
    // GAME SETUP
    // =========================================================

    /// Create a new game instance and initialize the encrypted map
    pub fn create_game(
        ctx: Context<CreateGame>,
        computation_offset: u64,
        ciphertext_seed: [u8; 32],
        pub_key: [u8; 32],
        nonce: u128,
    ) -> Result<()> {
        // Initialize game account with public metadata
        let game = &mut ctx.accounts.game;
        game.authority = ctx.accounts.authority.key();
        game.player_count = 0;
        game.created_at = Clock::get()?.unix_timestamp;
        game.is_active = true;

        // Queue MPC computation to initialize encrypted map
        let args = vec![
            Argument::ArcisPubkey(pub_key),
            Argument::PlaintextU128(nonce),
            Argument::Ciphertext(ciphertext_seed.to_vec()),
        ];

        queue_computation(
            ctx.accounts,
            COMP_DEF_OFFSET_INIT_MAP,
            computation_offset,
            args,
        )?;

        emit!(GameCreated {
            game: game.key(),
            authority: game.authority,
            timestamp: game.created_at,
        });

        Ok(())
    }

    /// Initialize the buried loot layer (separate MPC call)
    pub fn init_buried(
        ctx: Context<InitBuried>,
        computation_offset: u64,
    ) -> Result<()> {
        queue_computation(
            ctx.accounts,
            COMP_DEF_OFFSET_INIT_BURIED_LAYER,
            computation_offset,
            vec![],
        )?;
        Ok(())
    }

    // =========================================================
    // PLAYER ACTIONS
    // =========================================================

    /// Register a new player with encrypted starting state
    pub fn register_player(
        ctx: Context<RegisterPlayer>,
        computation_offset: u64,
    ) -> Result<()> {
        let player_account = &mut ctx.accounts.player_account;
        player_account.wallet = ctx.accounts.player.key();
        player_account.game = ctx.accounts.game.key();
        player_account.joined_at = Clock::get()?.unix_timestamp;
        // Public stats (non-sensitive, for leaderboard)
        player_account.tiles_explored = 0;
        player_account.treasures_found = 0;
        player_account.traps_triggered = 0;

        // Increment game player count
        let game = &mut ctx.accounts.game;
        game.player_count += 1;

        // Queue MPC to create encrypted player state
        queue_computation(
            ctx.accounts,
            COMP_DEF_OFFSET_REGISTER_PLAYER,
            computation_offset,
            vec![],
        )?;

        emit!(PlayerRegistered {
            game: game.key(),
            player: player_account.wallet,
            timestamp: player_account.joined_at,
        });

        Ok(())
    }

    /// Move to an adjacent tile
    /// Wallet signature required — identity verification
    pub fn move_player(
        ctx: Context<MovePlayer>,
        computation_offset: u64,
        ciphertext_input: [u8; 32],
        pub_key: [u8; 32],
        nonce: u128,
    ) -> Result<()> {
        require!(ctx.accounts.game.is_active, GameError::GameNotActive);

        let args = vec![
            Argument::ArcisPubkey(pub_key),
            Argument::PlaintextU128(nonce),
            Argument::Ciphertext(ciphertext_input.to_vec()),
        ];

        queue_computation(
            ctx.accounts,
            COMP_DEF_OFFSET_MOVE_PLAYER,
            computation_offset,
            args,
        )?;

        Ok(())
    }

    /// Explore an adjacent tile — MPC decrypts for player only
    pub fn explore(
        ctx: Context<Explore>,
        computation_offset: u64,
        ciphertext_input: [u8; 32],
        pub_key: [u8; 32],
        nonce: u128,
    ) -> Result<()> {
        require!(ctx.accounts.game.is_active, GameError::GameNotActive);

        let args = vec![
            Argument::ArcisPubkey(pub_key),
            Argument::PlaintextU128(nonce),
            Argument::Ciphertext(ciphertext_input.to_vec()),
        ];

        queue_computation(
            ctx.accounts,
            COMP_DEF_OFFSET_EXPLORE,
            computation_offset,
            args,
        )?;

        Ok(())
    }

    /// Bury loot at a tile with zero public linkage
    pub fn bury(
        ctx: Context<Bury>,
        computation_offset: u64,
        ciphertext_input: [u8; 32],
        pub_key: [u8; 32],
        nonce: u128,
    ) -> Result<()> {
        require!(ctx.accounts.game.is_active, GameError::GameNotActive);

        let args = vec![
            Argument::ArcisPubkey(pub_key),
            Argument::PlaintextU128(nonce),
            Argument::Ciphertext(ciphertext_input.to_vec()),
        ];

        queue_computation(
            ctx.accounts,
            COMP_DEF_OFFSET_BURY,
            computation_offset,
            args,
        )?;

        // NOTE: No tile coordinates or amounts in the event!
        // Only that a bury action occurred
        emit!(ActionPerformed {
            game: ctx.accounts.game.key(),
            player: ctx.accounts.player.key(),
            action_type: ActionType::Bury,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Dig at a tile — dual-layer MPC check
    pub fn dig(
        ctx: Context<Dig>,
        computation_offset: u64,
        ciphertext_input: [u8; 32],
        pub_key: [u8; 32],
        nonce: u128,
    ) -> Result<()> {
        require!(ctx.accounts.game.is_active, GameError::GameNotActive);

        let args = vec![
            Argument::ArcisPubkey(pub_key),
            Argument::PlaintextU128(nonce),
            Argument::Ciphertext(ciphertext_input.to_vec()),
        ];

        queue_computation(
            ctx.accounts,
            COMP_DEF_OFFSET_DIG,
            computation_offset,
            args,
        )?;

        Ok(())
    }

    // =========================================================
    // MPC CALLBACKS — Called by Arcium after computation completes
    // =========================================================

    pub fn explore_callback(ctx: Context<ExploreCallback>, result: Vec<u8>) -> Result<()> {
        // Update public stats only
        let player_account = &mut ctx.accounts.player_account;
        player_account.tiles_explored += 1;

        // Emit encrypted result — only the player can decrypt
        emit!(ExploreResultEvent {
            game: ctx.accounts.game.key(),
            player: player_account.wallet,
            encrypted_result: result,
        });

        Ok(())
    }

    pub fn dig_callback(ctx: Context<DigCallback>, result: Vec<u8>) -> Result<()> {
        let player_account = &mut ctx.accounts.player_account;
        player_account.tiles_explored += 1;

        emit!(DigResultEvent {
            game: ctx.accounts.game.key(),
            player: player_account.wallet,
            encrypted_result: result,
        });

        Ok(())
    }

    pub fn move_callback(ctx: Context<MoveCallback>, result: Vec<u8>) -> Result<()> {
        emit!(MoveResultEvent {
            game: ctx.accounts.game.key(),
            player: ctx.accounts.player_account.wallet,
            encrypted_result: result,
        });

        Ok(())
    }

    pub fn bury_callback(ctx: Context<BuryCallback>, result: Vec<u8>) -> Result<()> {
        emit!(BuryResultEvent {
            game: ctx.accounts.game.key(),
            // NOTE: No tile info in the event — privacy preserved
            encrypted_result: result,
        });

        Ok(())
    }
}

// =========================================================
// ACCOUNTS
// =========================================================

#[account]
pub struct Game {
    pub authority: Pubkey,
    pub player_count: u32,
    pub created_at: i64,
    pub is_active: bool,
}

#[account]
pub struct PlayerAccount {
    pub wallet: Pubkey,
    pub game: Pubkey,
    pub joined_at: i64,
    // Public stats only — no position, gold, or health
    pub tiles_explored: u32,
    pub treasures_found: u32,
    pub traps_triggered: u32,
}

// =========================================================
// ACCOUNT CONTEXTS (simplified — real impl has full Arcium PDAs)
// =========================================================

#[derive(Accounts)]
pub struct CreateGame<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 4 + 8 + 1)]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    // ... Arcium required accounts (MXE, cluster, computation, mempool, etc.)
}

#[derive(Accounts)]
pub struct RegisterPlayer<'info> {
    #[account(init, payer = player, space = 8 + 32 + 32 + 8 + 4 + 4 + 4)]
    pub player_account: Account<'info, PlayerAccount>,
    #[account(mut)]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub player: Signer<'info>,
    pub system_program: Program<'info, System>,
    // ... Arcium required accounts
}

#[derive(Accounts)]
#[instruction(computation_offset: u64)]
pub struct MovePlayer<'info> {
    #[account(mut)]
    pub player_account: Account<'info, PlayerAccount>,
    pub game: Account<'info, Game>,
    pub player: Signer<'info>,
    // ... Arcium accounts for queue_computation
}

#[derive(Accounts)]
#[instruction(computation_offset: u64)]
pub struct Explore<'info> {
    #[account(mut)]
    pub player_account: Account<'info, PlayerAccount>,
    pub game: Account<'info, Game>,
    pub player: Signer<'info>,
    // ... Arcium accounts
}

#[derive(Accounts)]
#[instruction(computation_offset: u64)]
pub struct Bury<'info> {
    #[account(mut)]
    pub player_account: Account<'info, PlayerAccount>,
    pub game: Account<'info, Game>,
    pub player: Signer<'info>,
    // ... Arcium accounts
}

#[derive(Accounts)]
#[instruction(computation_offset: u64)]
pub struct Dig<'info> {
    #[account(mut)]
    pub player_account: Account<'info, PlayerAccount>,
    pub game: Account<'info, Game>,
    pub player: Signer<'info>,
    // ... Arcium accounts
}

// Callback contexts
#[derive(Accounts)]
pub struct ExploreCallback<'info> {
    #[account(mut)]
    pub player_account: Account<'info, PlayerAccount>,
    pub game: Account<'info, Game>,
}

#[derive(Accounts)]
pub struct DigCallback<'info> {
    #[account(mut)]
    pub player_account: Account<'info, PlayerAccount>,
    pub game: Account<'info, Game>,
}

#[derive(Accounts)]
pub struct MoveCallback<'info> {
    pub player_account: Account<'info, PlayerAccount>,
    pub game: Account<'info, Game>,
}

#[derive(Accounts)]
pub struct BuryCallback<'info> {
    pub game: Account<'info, Game>,
}

// Comp def init contexts (one per encrypted instruction)
#[derive(Accounts)]
pub struct InitMapCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    // ... Arcium comp_def accounts
}

#[derive(Accounts)]
pub struct InitBuriedLayerCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
}

#[derive(Accounts)]
pub struct InitRegisterPlayerCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
}

#[derive(Accounts)]
pub struct InitMoveCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
}

#[derive(Accounts)]
pub struct InitExploreCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
}

#[derive(Accounts)]
pub struct InitBuryCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
}

#[derive(Accounts)]
pub struct InitDigCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
}

#[derive(Accounts)]
pub struct InitBuried<'info> {
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

// =========================================================
// EVENTS (public, but contain only encrypted data or metadata)
// =========================================================

#[event]
pub struct GameCreated {
    pub game: Pubkey,
    pub authority: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct PlayerRegistered {
    pub game: Pubkey,
    pub player: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct ActionPerformed {
    pub game: Pubkey,
    pub player: Pubkey,
    pub action_type: ActionType,
    pub timestamp: i64,
}

#[event]
pub struct ExploreResultEvent {
    pub game: Pubkey,
    pub player: Pubkey,
    pub encrypted_result: Vec<u8>, // Only this player can decrypt
}

#[event]
pub struct DigResultEvent {
    pub game: Pubkey,
    pub player: Pubkey,
    pub encrypted_result: Vec<u8>,
}

#[event]
pub struct MoveResultEvent {
    pub game: Pubkey,
    pub player: Pubkey,
    pub encrypted_result: Vec<u8>,
}

#[event]
pub struct BuryResultEvent {
    pub game: Pubkey,
    // Intentionally NO player field — linkage broken
    pub encrypted_result: Vec<u8>,
}

// =========================================================
// ENUMS & ERRORS
// =========================================================

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum ActionType {
    Move,
    Explore,
    Bury,
    Dig,
}

#[error_code]
pub enum GameError {
    #[msg("Game is not active")]
    GameNotActive,
    #[msg("Player already registered")]
    PlayerAlreadyRegistered,
    #[msg("Unauthorized")]
    Unauthorized,
}
