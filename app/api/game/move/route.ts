import { NextRequest, NextResponse } from 'next/server';
import { getPlayerState, updatePlayerPosition } from '../state/store';

export async function POST(request: NextRequest) {
  try {
    const { wallet, targetX, targetY } = await request.json();

    if (!wallet || targetX === undefined || targetY === undefined) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // In production, this would:
    // 1. Encrypt the move input using ECDH with MXE public key
    // 2. Call the Solana program's movePlayer instruction
    // 3. Queue the MPC computation
    // 4. Wait for computation and decrypt the result
    // 5. Return the new position

    const currentState = getPlayerState(wallet);
    if (!currentState) {
      return NextResponse.json({ error: 'Player not registered' }, { status: 400 });
    }

    // Verify adjacency
    const dx = Math.abs(currentState.x - targetX);
    const dy = Math.abs(currentState.y - targetY);
    if (dx > 1 || dy > 1 || (dx === 0 && dy === 0)) {
      return NextResponse.json({ error: 'Invalid move: not adjacent' }, { status: 400 });
    }

    if (targetX < 0 || targetX >= 10 || targetY < 0 || targetY >= 10) {
      return NextResponse.json({ error: 'Out of bounds' }, { status: 400 });
    }

    // Simulate MPC computation delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Update state
    updatePlayerPosition(wallet, targetX, targetY);

    return NextResponse.json({
      newX: targetX,
      newY: targetY,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Move failed' }, { status: 500 });
  }
}
