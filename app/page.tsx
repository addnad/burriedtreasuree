'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { GameBoard } from '@/components/GameBoard';
import { LandingPage } from '@/components/LandingPage';
import { Header } from '@/components/Header';

export default function Home() {
  const { connected } = useWallet();

  return (
    <main className="min-h-screen">
      <Header />
      {connected ? <GameBoard /> : <LandingPage />}
    </main>
  );
}
