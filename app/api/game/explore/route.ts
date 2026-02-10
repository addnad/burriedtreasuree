import { NextRequest, NextResponse } from 'next/server';
import { getPlayerState, addExploredTile } from '../state/store';

export async function POST(request: NextRequest) {
  try {
    const { wallet, targetX, targetY } = await request.json();

    if (!wallet || targetX === undefined || targetY === undefined) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // In production, this would:
    // 1. Encrypt the explore input
    // 2. Call the Solana program's explore instruction
    // 3. Queue the MPC computation
    // 4. Wait for computation and decrypt the result (encrypted to player's key only)
    // 5. Return the tile type and value

    const currentState = getPlayerState(wallet);
    if (!currentState) {
      return NextResponse.json({ error: 'Player not registered' }, { status: 400 });
    }

    // Verify adjacency
    const dx = Math.abs(currentState.x - targetX);
    const dy = Math.abs(currentState.y - targetY);
    if (dx > 1 || dy > 1) {
      return NextResponse.json({ error: 'Not adjacent' }, { status: 400 });
    }

    const key = `${targetX},${targetY}`;
    if (currentState.explored.includes(key)) {
      return NextResponse.json({ error: 'Already explored' }, { status: 400 });
    }

    // Simulate MPC computation delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Simulate tile reveal (in production, this comes from MPC)
    const tileTypes = ['empty', 'treasure', 'trap'];
    const tileType = tileTypes[Math.floor(Math.random() * 3)];
    const value = tileType === 'empty' ? 0 : tileType === 'treasure' ? 5 + Math.floor(Math.random() * 46) : 5 + Math.floor(Math.random() * 26);

    // Update state
    addExploredTile(wallet, targetX, targetY, tileType, value);

    let message = '';
    if (tileType === 'empty') {
      message = 'This tile is empty.';
    } else if (tileType === 'treasure') {
      message = `You found treasure! +${value} gold`;
    } else {
      message = `You triggered a trap! -${value} health`;
    }

    return NextResponse.json({
      tileType,
      value,
      message,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Explore failed' }, { status: 500 });
  }
}
