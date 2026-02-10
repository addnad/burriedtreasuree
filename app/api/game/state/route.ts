import { NextRequest, NextResponse } from 'next/server';
import { getPlayerState, initializePlayerState } from '../state/store';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    // In production, this would:
    // 1. Query the Solana program for the player account
    // 2. The account only contains public stats (tilesExplored, etc.)
    // 3. Encrypted state (position, gold, health) would be fetched from Arcium MPC
    // 4. Decrypt the state using the player's shared secret

    let state = getPlayerState(wallet);

    if (!state) {
      state = initializePlayerState(wallet);
    }

    return NextResponse.json({ state });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to get state' }, { status: 500 });
  }
}
