import { NextRequest, NextResponse } from 'next/server';
import { getPlayerState, addBuriedLoot } from '../state/store';

export async function POST(request: NextRequest) {
  try {
    const { wallet, targetX, targetY, amount } = await request.json();

    if (!wallet || targetX === undefined || targetY === undefined || !amount) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // In production, this would:
    // 1. Encrypt the bury input (tile coordinates + amount)
    // 2. Call the Solana program's bury instruction
    // 3. Queue the MPC computation
    // 4. MPC verifies player has enough gold (encrypted comparison)
    // 5. MPC writes to buried loot layer (NO public player-tile linkage)
    // 6. Return success and new gold balance

    const currentState = getPlayerState(wallet);
    if (!currentState) {
      return NextResponse.json({ error: 'Player not registered' }, { status: 400 });
    }

    if (amount <= 0 || amount > currentState.gold) {
      return NextResponse.json({ error: 'Insufficient gold' }, { status: 400 });
    }

    // Verify adjacency
    const dx = Math.abs(currentState.x - targetX);
    const dy = Math.abs(currentState.y - targetY);
    if (dx > 1 || dy > 1) {
      return NextResponse.json({ error: 'Not adjacent' }, { status: 400 });
    }

    // Simulate MPC computation delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Update state
    addBuriedLoot(wallet, targetX, targetY, amount);
    const updatedState = getPlayerState(wallet);

    return NextResponse.json({
      newGold: updatedState?.gold || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Bury failed' }, { status: 500 });
  }
}
