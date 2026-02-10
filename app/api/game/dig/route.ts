import { NextRequest, NextResponse } from 'next/server';
import { getPlayerState, addDugLoot } from '../state/store';

export async function POST(request: NextRequest) {
  try {
    const { wallet, targetX, targetY } = await request.json();

    if (!wallet || targetX === undefined || targetY === undefined) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // In production, this would:
    // 1. Encrypt the dig input
    // 2. Call the Solana program's dig instruction
    // 3. Queue the MPC computation (checks BOTH base map + buried layer)
    // 4. Wait for computation and decrypt the combined result
    // 5. Return the found type, total value, and health lost

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

    // Simulate MPC computation delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Simulate dual-layer check result
    const foundType = Math.random() > 0.7 ? 'treasure' : Math.random() > 0.5 ? 'trap' : 'nothing';
    const totalValue = foundType === 'treasure' ? 5 + Math.floor(Math.random() * 46) : 0;
    const healthLost = foundType === 'trap' ? 5 + Math.floor(Math.random() * 26) : 0;

    // Update state
    addDugLoot(wallet, targetX, targetY, totalValue, healthLost);

    let message = '';
    if (foundType === 'nothing') {
      message = 'Nothing found here.';
    } else if (foundType === 'treasure') {
      message = `Found loot! +${totalValue} gold`;
    } else {
      message = `Trap triggered! -${healthLost} health`;
    }

    return NextResponse.json({
      foundType,
      totalValue,
      healthLost,
      message,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Dig failed' }, { status: 500 });
  }
}
