# Quick Start Guide

## ✅ Packages Installed

The npm packages have been installed successfully. The site is ready to run!

## 🚀 Start the Development Server

```bash
npm run dev
```

The site will be available at: **http://localhost:3000**

## 📦 Push to GitHub

### Step 1: Initialize Git (if not done)

```bash
git init
git add .
git commit -m "Initial commit: Buried Treasure game"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `buried-treasure` (or your preferred name)
3. **Don't** initialize with README, .gitignore, or license
4. Click "Create repository"

### Step 3: Connect and Push

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/buried-treasure.git
git branch -M main
git push -u origin main
```

## 🌐 Deploy to Vercel

### Option 1: Via Dashboard (Easiest)

1. **Go to**: https://vercel.com
2. **Sign in** with GitHub
3. **Click "Add New Project"**
4. **Import** your `buried-treasure` repository
5. **Configure**:
   - Framework: Next.js (auto-detected)
   - Install Command: `npm install --legacy-peer-deps`
   - Build Command: `npm run build` (auto-detected)
6. **Environment Variables** (optional, add in Settings):
   - `NEXT_PUBLIC_SOLANA_RPC_URL` = `https://api.mainnet-beta.solana.com`
   - `NEXT_PUBLIC_PROGRAM_ID` = `BuRiEdTrEaSuRe111111111111111111111111111`
7. **Click "Deploy"**

Your site will be live at: `https://buried-treasure.vercel.app` (or your custom domain)

### Option 2: Via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts
```

## 🎨 Custom Domain

1. In Vercel Dashboard → Your Project → Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `buried-treasure.yourdomain.com`)
4. Follow DNS configuration instructions
5. SSL certificate is automatically provisioned

## ✅ Verification Checklist

- [ ] Dev server runs: `npm run dev`
- [ ] Site loads at http://localhost:3000
- [ ] Code pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Custom domain configured (optional)

## 🐛 Troubleshooting

### Dev Server Won't Start
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install --legacy-peer-deps
npm run dev
```

### Build Fails on Vercel
- Check Vercel build logs
- Ensure `package.json` scripts are correct
- Verify Node.js version (Vercel uses 18.x)

### Environment Variables
- Add in Vercel: Settings → Environment Variables
- Must start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding variables

## 📚 More Information

- See `DEPLOYMENT.md` for detailed deployment guide
- See `ARCHITECTURE.md` for system architecture
- See `README.md` for project overview
