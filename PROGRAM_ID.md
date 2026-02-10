# Program ID Configuration

## After Deploying Your Solana Program

Once you deploy your Arcium program to Solana mainnet, you'll need to set the program ID:

### 1. Get Your Deployed Program ID

After running `npm run arcium:deploy --network mainnet`, you'll get a program ID like:
```
Program Id: 7xKf...a3Dm (44 character base58 string)
```

### 2. Set Environment Variable

#### For Local Development

Create or update `.env.local`:
```env
NEXT_PUBLIC_PROGRAM_ID=YOUR_DEPLOYED_PROGRAM_ID_HERE
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

#### For Vercel Deployment

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_PROGRAM_ID` = `YOUR_DEPLOYED_PROGRAM_ID_HERE`
   - `NEXT_PUBLIC_SOLANA_RPC_URL` = `https://api.mainnet-beta.solana.com`
3. Redeploy your project

### 3. Update Anchor.toml

Update the mainnet program ID in `Anchor.toml`:
```toml
[programs.mainnet]
buried_treasure = "YOUR_DEPLOYED_PROGRAM_ID_HERE"
```

## Current Behavior

- If `NEXT_PUBLIC_PROGRAM_ID` is not set or invalid, the app will use `SystemProgram.programId` as a fallback
- The app will still work using the API layer for game actions
- MPC encryption will be skipped until a valid program ID is configured
- This allows the frontend to work before the program is deployed

## Verification

After setting the program ID:
1. Restart your dev server: `npm run dev`
2. Check browser console - should see "Program ID configured" (no errors)
3. Wallet connection should work
4. Game actions will use the deployed program
