'use client';

import { useWalletModal } from '@solana/wallet-adapter-react-ui';

export function LandingPage() {
  const { setVisible } = useWalletModal();

  return (
    <div className="landing-container">
      <div className="landing-content">
        <div className="landing-icon">🏴‍☠️</div>
        <h2 className="landing-title">
          Explore. Dig. Bury. Privately.
        </h2>
        <p className="landing-description">
          A 10×10 island hides encrypted treasure and traps. Every tile&apos;s contents are computed inside
          Arcium&apos;s MPC network — <strong>no one can read the map</strong>, not even the blockchain.
          Only rule-required reveals reach your client. Your buried loot is unlinkable to your wallet.
        </p>
        <div className="landing-features">
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <div className="feature-title">EXPLORE</div>
            <div className="feature-desc">
              MPC decrypts adjacent tiles for your eyes only. Others see nothing.
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⛏️</div>
            <div className="feature-title">DIG</div>
            <div className="feature-desc">
              MPC checks base + buried layers and returns combined results.
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💎</div>
            <div className="feature-title">BURY</div>
            <div className="feature-desc">
              Hide loot at any tile. MPC ensures zero public linkage to you.
            </div>
          </div>
        </div>
        <button
          className="wallet-btn landing-connect-btn"
          onClick={() => setVisible(true)}
        >
          <span className="wallet-dot"></span>
          Connect Wallet to Play
        </button>
      </div>
    </div>
  );
}
