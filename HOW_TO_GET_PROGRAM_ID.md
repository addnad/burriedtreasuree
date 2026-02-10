# How to Get Your Program ID

## Step-by-Step Guide

### Prerequisites

Before deploying, make sure you have:

1. **Arcium CLI installed**
   ```bash
   curl "https://bin.arcium.com/download/arcup_x86_64_linux_0.1.47" -o ~/.cargo/bin/arcup
   chmod +x ~/.cargo/bin/arcup
   arcup install
   ```

2. **Solana CLI installed and configured**
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
   solana config set --url https://api.mainnet-beta.solana.com
   ```

3. **Wallet with SOL for deployment**
   - You need SOL in your wallet to pay for deployment
   - Check balance: `solana balance`
   - Get your wallet address: `solana address`

### Step 1: Build Your Program

```bash
# Build the Arcium program
npm run arcium:build

# Or directly:
arcium build
```

This compiles your Rust program and Arcium encrypted instructions.

### Step 2: Deploy to Solana Mainnet

```bash
# Deploy to mainnet
npm run arcium:deploy --network mainnet

# Or directly:
arcium deploy --network mainnet
```

**Important Notes:**
- Make sure your Solana CLI is configured for mainnet: `solana config set --url https://api.mainnet-beta.solana.com`
- You'll need SOL in your wallet (deployment costs ~2-3 SOL)
- The deployment process will:
  1. Build your program
  2. Upload it to Solana
  3. Deploy to Arcium MPC network
  4. **Output your Program ID**

### Step 3: Find Your Program ID

After deployment, you'll see output like:

```
Deploying program...
Program Id: 7xKfTv8mN9a3DmPqR5sT2wY8bC4nM6jL9kH3pQ7vF1gE2dA
Deployment successful!
```

**The Program ID is the long string (44 characters) that looks like:**
```
7xKfTv8mN9a3DmPqR5sT2wY8bC4nM6jL9kH3pQ7vF1gE2dA
```

### Step 4: Alternative Ways to Find Program ID

If you missed the output, you can find it:

#### Option A: Check Anchor.toml
After deployment, Anchor may update the program ID in `Anchor.toml`:
```toml
[programs.mainnet]
buried_treasure = "YOUR_PROGRAM_ID_HERE"
```

#### Option B: Check Solana Explorer
1. Go to https://explorer.solana.com
2. Search for your wallet address
3. Look at "Programs" section
4. Find your deployed program

#### Option C: Use Solana CLI
```bash
# List your deployed programs
solana program show --programs

# Or check your account
solana account YOUR_WALLET_ADDRESS
```

#### Option D: Check Arcium Dashboard
If Arcium has a dashboard, your deployed programs should be listed there.

### Step 5: Set the Program ID

Once you have your Program ID, set it as an environment variable:

#### For Local Development

Create or edit `.env.local`:
```env
NEXT_PUBLIC_PROGRAM_ID=7xKfTv8mN9a3DmPqR5sT2wY8bC4nM6jL9kH3pQ7vF1gE2dA
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

**Replace `7xKfTv8mN9a3DmPqR5sT2wY8bC4nM6jL9kH3pQ7vF1gE2dA` with your actual Program ID**

#### For Vercel Deployment

1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add:
   - **Name**: `NEXT_PUBLIC_PROGRAM_ID`
   - **Value**: `YOUR_PROGRAM_ID_HERE`
   - **Environment**: Production, Preview, Development (select all)
4. Click "Save"
5. Redeploy your project

### Step 6: Update Anchor.toml (Optional)

Update the mainnet program ID in `Anchor.toml`:
```toml
[programs.mainnet]
buried_treasure = "YOUR_PROGRAM_ID_HERE"
```

### Step 7: Verify It Works

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Open browser console (F12)
3. Check for errors - should see no "Invalid public key" errors
4. Connect your wallet
5. Try a game action - it should work with your deployed program

## Troubleshooting

### "Program not found" error
- Make sure you deployed to mainnet (not devnet)
- Verify the Program ID is correct (44 characters, base58)
- Check that your wallet has the program deployed

### "Insufficient funds" error
- You need SOL in your wallet for deployment
- Get SOL: Use a faucet or transfer from an exchange
- Check balance: `solana balance`

### "Build failed" error
- Make sure Rust and Anchor are installed
- Check that all dependencies are correct
- Review build logs for specific errors

### Can't find Program ID after deployment
- Check the deployment output logs
- Look in `target/deploy/buried_treasure-keypair.json` (the public key is your program ID)
- Use Solana Explorer to search for your wallet

## Quick Reference

```bash
# 1. Build
npm run arcium:build

# 2. Deploy (get Program ID from output)
npm run arcium:deploy --network mainnet

# 3. Copy the Program ID from output

# 4. Add to .env.local
echo "NEXT_PUBLIC_PROGRAM_ID=YOUR_PROGRAM_ID_HERE" >> .env.local

# 5. Restart dev server
npm run dev
```

## Example Output

When you run `arcium deploy --network mainnet`, you should see:

```
Building program...
✓ Build successful

Deploying to Solana mainnet...
Uploading program...
✓ Program uploaded

Deploying to Arcium MPC network...
✓ MPC deployment successful

Program deployed successfully!
Program Id: 7xKfTv8mN9a3DmPqR5sT2wY8bC4nM6jL9kH3pQ7vF1gE2dA
```

**Copy that Program ID and use it in your environment variables!**
