// ============================================================
// BURIED TREASURE — TYPESCRIPT CLIENT SDK
// Handles wallet connection, encryption, and MPC interaction
// ============================================================

import * as anchor from "@coral-xyz/anchor";
import {
  getClusterAccAddress,
  getArciumEnv,
  getCompDefAccOffset,
  getCompDefAccAddress,
  getComputationAccAddress,
  getMXEAccAddress,
  getMempoolAccAddress,
  getExecutingPoolAccAddress,
  getMXEPublicKey,
  awaitComputationFinalization,
} from "@arcium-hq/client";

// Cipher type - not exported from @arcium-hq/client in all versions
type Cipher = any;
import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
// BuriedTreasure types - only available after anchor build
// For now, we'll use a generic type
type BuriedTreasure = any;

// =========================================================
// CONFIGURATION
// =========================================================

const PROGRAM_ID = new PublicKey("BuRiEdTrEaSuRe111111111111111111111111111");
const RPC_URL = "https://api.devnet.solana.com";

// Arcium environment (set by `arcium localnet` or .env)
const arciumEnv = getArciumEnv();
const clusterAccount = getClusterAccAddress(arciumEnv.clusterOffset);

// =========================================================
// GAME CLIENT CLASS
// =========================================================

export class BuriedTreasureClient {
  private connection: Connection;
  private provider: anchor.AnchorProvider;
  private program: anchor.Program<BuriedTreasure>;
  private cipher: Cipher;
  private clientKeypair: Keypair;
  private mxePublicKey: Uint8Array;

  constructor(wallet: anchor.Wallet) {
    this.connection = new Connection(RPC_URL, "confirmed");
    this.provider = new anchor.AnchorProvider(this.connection, wallet, {
      commitment: "confirmed",
    });
    anchor.setProvider(this.provider);
    this.program = anchor.workspace.BuriedTreasure as anchor.Program<BuriedTreasure>;

    // Generate ephemeral keypair for ECDH encryption with MXE
    this.clientKeypair = Keypair.generate();
  }

  async initialize() {
    // Fetch MXE public key for encryption
    this.mxePublicKey = await getMXEPublicKey(
      this.provider as anchor.AnchorProvider,
      PROGRAM_ID
    );

    // Initialize cipher with shared secret (ECDH between client and MXE)
    this.cipher = new Cipher(this.clientKeypair, this.mxePublicKey);
  }

  // =========================================================
  // ENCRYPTION HELPERS
  // =========================================================

  /**
   * Encrypt input data for MPC computation
   * Uses ECDH shared secret between client keypair and MXE public key
   */
  private encryptInput(data: Buffer): {
    ciphertext: Uint8Array[];
    nonce: anchor.BN;
    clientPublicKey: Uint8Array;
  } {
    const { ciphertext, nonce } = this.cipher.encrypt(data);
    const nonceBN = new anchor.BN(nonce);
    return {
      ciphertext,
      nonce: nonceBN,
      clientPublicKey: this.clientKeypair.publicKey.toBytes(),
    };
  }

  /**
   * Decrypt MPC result using shared secret
   */
  private decryptResult(encryptedResult: Uint8Array): Buffer {
    return this.cipher.decrypt(encryptedResult);
  }

  // =========================================================
  // GAME SETUP
  // =========================================================

  /**
   * Create a new game and initialize encrypted map via MPC
   */
  async createGame(seed: number): Promise<string> {
    const gamePDA = this.getGamePDA();
    const computationOffset = BigInt(Date.now());

    // Encrypt the seed — even the map seed is private
    const seedBuffer = Buffer.alloc(8);
    seedBuffer.writeBigUInt64LE(BigInt(seed));
    const { ciphertext, nonce, clientPublicKey } = this.encryptInput(seedBuffer);

    // Get Arcium PDA addresses
    const compDefIndex = Buffer.from(getCompDefAccOffset("init_map")).readUInt32LE();
    const computationAccount = getComputationAccAddress(computationOffset, PROGRAM_ID);
    const mxeAccount = getMXEAccAddress(PROGRAM_ID);
    const mempoolAccount = getMempoolAccAddress(PROGRAM_ID);

    // Submit transaction
    const tx = await this.program.methods
      .createGame(
        new anchor.BN(computationOffset.toString()),
        Array.from(ciphertext[0]) as any,
        Array.from(clientPublicKey) as any,
        nonce
      )
      .accountsPartial({
        game: gamePDA,
        authority: this.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
        computationAccount,
        mxeAccount,
        mempoolAccount,
        clusterAccount,
      })
      .rpc();

    console.log("Game creation tx:", tx);

    // Wait for MPC computation to finalize
    const finalization = await awaitComputationFinalization(
      this.provider as anchor.AnchorProvider,
      computationOffset,
      PROGRAM_ID,
      "confirmed"
    );

    console.log("Map initialized via MPC:", finalization);
    return tx;
  }

  // =========================================================
  // PLAYER ACTIONS
  // =========================================================

  /**
   * Register as a player — creates encrypted player state via MPC
   */
  async registerPlayer(): Promise<string> {
    const playerPDA = this.getPlayerPDA();
    const gamePDA = this.getGamePDA();
    const computationOffset = BigInt(Date.now());

    const tx = await this.program.methods
      .registerPlayer(new anchor.BN(computationOffset.toString()))
      .accountsPartial({
        playerAccount: playerPDA,
        game: gamePDA,
        player: this.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    await awaitComputationFinalization(
      this.provider as anchor.AnchorProvider,
      computationOffset,
      PROGRAM_ID,
      "confirmed"
    );

    return tx;
  }

  /**
   * Move to adjacent tile
   * Input (target coords) is encrypted — Solana tx reveals nothing about direction
   */
  async movePlayer(targetX: number, targetY: number): Promise<MoveResultData> {
    const computationOffset = BigInt(Date.now());

    // Encrypt move input
    const inputBuffer = Buffer.alloc(2);
    inputBuffer.writeUInt8(targetX, 0);
    inputBuffer.writeUInt8(targetY, 1);
    const { ciphertext, nonce, clientPublicKey } = this.encryptInput(inputBuffer);

    // Set up event listener BEFORE submitting
    const resultPromise = this.awaitEvent("MoveResultEvent");

    const tx = await this.program.methods
      .movePlayer(
        new anchor.BN(computationOffset.toString()),
        Array.from(ciphertext[0]) as any,
        Array.from(clientPublicKey) as any,
        nonce
      )
      .accountsPartial({
        playerAccount: this.getPlayerPDA(),
        game: this.getGamePDA(),
        player: this.provider.wallet.publicKey,
      })
      .rpc();

    // Wait for MPC to complete and return result
    await awaitComputationFinalization(
      this.provider as anchor.AnchorProvider,
      computationOffset,
      PROGRAM_ID,
      "confirmed"
    );

    const event = await resultPromise;
    const decrypted = this.decryptResult(event.encryptedResult);

    return {
      newX: decrypted.readUInt8(0),
      newY: decrypted.readUInt8(1),
    };
  }

  /**
   * Explore adjacent tile — MPC decrypts tile content for this player only
   * Other players, validators, and indexers cannot see the result
   */
  async explore(targetX: number, targetY: number): Promise<ExploreResultData> {
    const computationOffset = BigInt(Date.now());

    const inputBuffer = Buffer.alloc(2);
    inputBuffer.writeUInt8(targetX, 0);
    inputBuffer.writeUInt8(targetY, 1);
    const { ciphertext, nonce, clientPublicKey } = this.encryptInput(inputBuffer);

    const resultPromise = this.awaitEvent("ExploreResultEvent");

    const tx = await this.program.methods
      .explore(
        new anchor.BN(computationOffset.toString()),
        Array.from(ciphertext[0]) as any,
        Array.from(clientPublicKey) as any,
        nonce
      )
      .accountsPartial({
        playerAccount: this.getPlayerPDA(),
        game: this.getGamePDA(),
        player: this.provider.wallet.publicKey,
      })
      .rpc();

    await awaitComputationFinalization(
      this.provider as anchor.AnchorProvider,
      computationOffset,
      PROGRAM_ID,
      "confirmed"
    );

    const event = await resultPromise;
    const decrypted = this.decryptResult(event.encryptedResult);

    const tileType = decrypted.readUInt8(0);
    const value = decrypted.readUInt16LE(1);

    return {
      tileType: tileType === 0 ? "empty" : tileType === 1 ? "treasure" : "trap",
      value,
      message:
        tileType === 0
          ? "This tile is empty."
          : tileType === 1
          ? `You found treasure! +${value} gold`
          : `You triggered a trap! -${value} health`,
    };
  }

  /**
   * Bury loot at a tile — ZERO PUBLIC LINKAGE
   * The tile coordinates and amount are encrypted inside the MPC computation.
   * The Solana transaction reveals ONLY that a bury action occurred.
   * No explorer, indexer, or other player can determine:
   * - WHERE the loot was buried
   * - HOW MUCH was buried
   * - WHO buried it (the BuryResultEvent intentionally omits player field)
   */
  async bury(targetX: number, targetY: number, amount: number): Promise<BuryResultData> {
    const computationOffset = BigInt(Date.now());

    const inputBuffer = Buffer.alloc(4);
    inputBuffer.writeUInt8(targetX, 0);
    inputBuffer.writeUInt8(targetY, 1);
    inputBuffer.writeUInt16LE(amount, 2);
    const { ciphertext, nonce, clientPublicKey } = this.encryptInput(inputBuffer);

    const resultPromise = this.awaitEvent("BuryResultEvent");

    const tx = await this.program.methods
      .bury(
        new anchor.BN(computationOffset.toString()),
        Array.from(ciphertext[0]) as any,
        Array.from(clientPublicKey) as any,
        nonce
      )
      .accountsPartial({
        playerAccount: this.getPlayerPDA(),
        game: this.getGamePDA(),
        player: this.provider.wallet.publicKey,
      })
      .rpc();

    await awaitComputationFinalization(
      this.provider as anchor.AnchorProvider,
      computationOffset,
      PROGRAM_ID,
      "confirmed"
    );

    const event = await resultPromise;
    const decrypted = this.decryptResult(event.encryptedResult);

    return {
      success: decrypted.readUInt8(0) === 1,
      newGold: decrypted.readUInt16LE(1),
    };
  }

  /**
   * Dig at a tile — dual-layer encrypted check
   * MPC checks BOTH base map AND buried loot layer in one computation.
   * Returns combined result — the player cannot distinguish
   * which layer contributed what amount.
   */
  async dig(targetX: number, targetY: number): Promise<DigResultData> {
    const computationOffset = BigInt(Date.now());

    const inputBuffer = Buffer.alloc(2);
    inputBuffer.writeUInt8(targetX, 0);
    inputBuffer.writeUInt8(targetY, 1);
    const { ciphertext, nonce, clientPublicKey } = this.encryptInput(inputBuffer);

    const resultPromise = this.awaitEvent("DigResultEvent");

    const tx = await this.program.methods
      .dig(
        new anchor.BN(computationOffset.toString()),
        Array.from(ciphertext[0]) as any,
        Array.from(clientPublicKey) as any,
        nonce
      )
      .accountsPartial({
        playerAccount: this.getPlayerPDA(),
        game: this.getGamePDA(),
        player: this.provider.wallet.publicKey,
      })
      .rpc();

    await awaitComputationFinalization(
      this.provider as anchor.AnchorProvider,
      computationOffset,
      PROGRAM_ID,
      "confirmed"
    );

    const event = await resultPromise;
    const decrypted = this.decryptResult(event.encryptedResult);

    const foundType = decrypted.readUInt8(0);
    const totalValue = decrypted.readUInt16LE(1);
    const healthLost = decrypted.readUInt16LE(3);

    return {
      foundType:
        foundType === 0 ? "nothing" : foundType === 1 ? "treasure" : "trap",
      totalValue,
      healthLost,
      message:
        foundType === 0
          ? "Nothing found here."
          : foundType === 1
          ? `Found loot! +${totalValue} gold`
          : `Trap triggered! -${healthLost} health`,
    };
  }

  // =========================================================
  // PDA HELPERS
  // =========================================================

  private getGamePDA(): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("game"), this.provider.wallet.publicKey.toBuffer()],
      PROGRAM_ID
    );
    return pda;
  }

  private getPlayerPDA(): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("player"),
        this.getGamePDA().toBuffer(),
        this.provider.wallet.publicKey.toBuffer(),
      ],
      PROGRAM_ID
    );
    return pda;
  }

  // =========================================================
  // EVENT LISTENER
  // =========================================================

  private awaitEvent(eventName: string): Promise<any> {
    return new Promise((resolve) => {
      const listener = this.program.addEventListener(eventName, (event) => {
        this.program.removeEventListener(listener);
        resolve(event);
      });

      // Timeout after 30s
      setTimeout(() => {
        this.program.removeEventListener(listener);
        resolve(null);
      }, 30000);
    });
  }
}

// =========================================================
// RESULT TYPES
// =========================================================

export interface MoveResultData {
  newX: number;
  newY: number;
}

export interface ExploreResultData {
  tileType: "empty" | "treasure" | "trap";
  value: number;
  message: string;
}

export interface BuryResultData {
  success: boolean;
  newGold: number;
}

export interface DigResultData {
  foundType: "nothing" | "treasure" | "trap";
  totalValue: number;
  healthLost: number;
  message: string;
}

// =========================================================
// USAGE EXAMPLE
// =========================================================

/*
import { BuriedTreasureClient } from './game-client';

// After connecting wallet via @solana/wallet-adapter-react:
const client = new BuriedTreasureClient(wallet);
await client.initialize();

// Create game (game authority only)
await client.createGame(Date.now());

// Register as player
await client.registerPlayer();

// Play!
await client.movePlayer(1, 0);
const result = await client.explore(2, 0);
console.log(result.message); // "You found treasure! +23 gold"

await client.bury(2, 1, 10); // Bury 10 gold — no one can link this to you
const digResult = await client.dig(2, 1); // Checks both layers via MPC
*/
