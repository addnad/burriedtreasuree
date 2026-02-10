'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

export function Header() {
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const handleWalletClick = () => {
    if (connected) {
      disconnect();
    } else {
      setVisible(true);
    }
  };

  return (
    <header className="header">
      <div className="logo-section">
        <div className="logo-icon">🏝️</div>
        <div className="logo-text">
          <h1>Buried Treasure</h1>
          <span>Encrypted Island • Powered by Arcium MPC</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span className="privacy-badge encrypted">🔐 MPC Encrypted State</span>
        <button
          className={`wallet-btn ${connected ? 'connected' : ''}`}
          onClick={handleWalletClick}
        >
          <span className={`wallet-dot ${connected ? 'active' : ''}`}></span>
          {connected && publicKey ? shortenAddress(publicKey.toString()) : 'Connect Phantom'}
        </button>
      </div>
    </header>
  );
}
