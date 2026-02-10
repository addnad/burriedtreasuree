# Deployment Checklist

## Before Deploying

- [ ] Arcium CLI installed (`arcup install`)
- [ ] Solana CLI installed and configured for mainnet
- [ ] Wallet has SOL (need ~2-3 SOL for deployment)
- [ ] Program builds successfully (`npm run arcium:build`)
- [ ] Tests pass (optional: `npm run arcium:test`)

## Deployment Steps

1. [ ] **Build the program**
   ```bash
   npm run arcium:build
   ```

2. [ ] **Deploy to mainnet**
   ```bash
   npm run arcium:deploy --network mainnet
   ```

3. [ ] **Copy the Program ID from output**
   - Look for: `Program Id: 7xKfTv8mN9a3Dm...`
   - It's a 44-character base58 string

4. [ ] **Create `.env.local` file**
   ```env
   NEXT_PUBLIC_PROGRAM_ID=YOUR_PROGRAM_ID_HERE
   NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   ```

5. [ ] **Update `Anchor.toml`** (optional)
   ```toml
   [programs.mainnet]
   buried_treasure = "YOUR_PROGRAM_ID_HERE"
   ```

6. [ ] **Restart dev server**
   ```bash
   npm run dev
   ```

7. [ ] **Verify in browser**
   - Open http://localhost:3000
   - Check browser console (no errors)
   - Connect wallet
   - Test game actions

## For Vercel Deployment

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables added in Vercel:
  - [ ] `NEXT_PUBLIC_PROGRAM_ID`
  - [ ] `NEXT_PUBLIC_SOLANA_RPC_URL`
- [ ] Project redeployed
- [ ] Site tested on Vercel URL

## Verification

After deployment, verify:
- [ ] Program ID is valid (44 characters)
- [ ] No "Invalid public key" errors
- [ ] Wallet connects successfully
- [ ] Game actions work
- [ ] MPC operations function (if program is deployed)
