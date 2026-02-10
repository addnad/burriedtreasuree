# Deployment Guide

## GitHub Setup

### 1. Initialize Git Repository (if not already done)

```bash
git init
git add .
git commit -m "Initial commit: Buried Treasure game"
```

### 2. Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., `buried-treasure`)
3. **Don't** initialize with README, .gitignore, or license (we already have these)

### 3. Connect and Push

```bash
git remote add origin https://github.com/YOUR_USERNAME/buried-treasure.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

## Vercel Deployment

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with your GitHub account
3. **Click "Add New Project"**
4. **Import your GitHub repository**:
   - Select the `buried-treasure` repository
   - Vercel will auto-detect Next.js
5. **Configure Project**:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install --legacy-peer-deps`
6. **Environment Variables** (if needed):
   - `NEXT_PUBLIC_SOLANA_RPC_URL`: `https://api.mainnet-beta.solana.com`
   - `NEXT_PUBLIC_PROGRAM_ID`: `BuRiEdTrEaSuRe111111111111111111111111111`
7. **Click "Deploy"**

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? buried-treasure
# - Directory? ./
# - Override settings? No
```

### Custom Domain Setup

1. **In Vercel Dashboard**:
   - Go to your project
   - Click "Settings" → "Domains"
   - Click "Add Domain"
   - Enter your domain (e.g., `buried-treasure.yourdomain.com`)
   
2. **Configure DNS**:
   - Vercel will provide DNS records to add
   - Add a CNAME record pointing to Vercel
   - Or add A records if using apex domain

3. **SSL Certificate**:
   - Vercel automatically provisions SSL certificates
   - Wait a few minutes for DNS propagation

## Environment Variables

Create a `.env.local` file for local development:

```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_PROGRAM_ID=BuRiEdTrEaSuRe111111111111111111111111111
```

For Vercel, add these in the project settings:
- Settings → Environment Variables
- Add each variable for Production, Preview, and Development

## Post-Deployment Checklist

- [ ] Site loads at Vercel URL
- [ ] Wallet connection works
- [ ] Game board displays correctly
- [ ] API routes respond (check browser network tab)
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active (should be automatic)

## Troubleshooting

### Build Fails on Vercel

- Check build logs in Vercel dashboard
- Ensure `package.json` has correct scripts
- Verify Node.js version (Vercel uses 18.x by default)

### Environment Variables Not Working

- Make sure variables start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding environment variables
- Check Vercel environment variable settings

### API Routes Not Working

- Check Vercel function logs
- Ensure API routes are in `app/api/` directory
- Verify CORS settings if needed

## Continuous Deployment

Vercel automatically deploys when you push to:
- `main` branch → Production
- Other branches → Preview deployments

Each push creates a new deployment with a unique URL.
