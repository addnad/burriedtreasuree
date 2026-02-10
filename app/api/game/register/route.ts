import { NextRequest, NextResponse } from 'next/server';

// This is a minimal API layer that relays MPC calls
// In production, this would interact with the Solana program and Arcium MPC

export async function POST(request: NextRequest) {
  try {
    const { wallet } = await request.json();

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    // In production, this would:
    // 1. Call the Solana program's registerPlayer instruction
    // 2. Queue the MPC computation via Arcium
    // 3. Wait for computation finalization
    // 4. Return the transaction signature

    // For now, simulate the registration
    const tx = `register_${Date.now()}_${wallet.slice(0, 8)}`;

    return NextResponse.json({ tx });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
