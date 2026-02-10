# Quick Vercel Deployment Guide

## Changes Made

✅ Updated branding: "Encrypted Island • Powered by Arcium MPC"
✅ Added disconnect wallet button (click wallet button when connected)
✅ Removed architecture section from landing page

## Deploy to Vercel

### Option 1: Auto-Deploy (If Already Connected to GitHub)

If your Vercel project is already connected to GitHub:

1. **Commit and push your changes:**
   ```bash
   git add .
   git commit -m "Update UI: Add disconnect wallet, update branding"
   git push
   ```

2. **Vercel will automatically deploy** when you push to your main branch

3. **Check deployment status:**
   - Go to https://vercel.com
   - Open your project
   - Check "Deployments" tab

### Option 2: Manual Deploy via Vercel Dashboard

1. **Go to Vercel Dashboard**: https://vercel.com
2. **Select your project**
3. **Click "Deployments" tab**
4. **Click "Redeploy" on the latest deployment**
5. **Or click "Deploy" → "Deploy Latest Commit"**

### Option 3: Deploy via Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login (if not logged in)
vercel login

# Deploy to production
vercel --prod
```

## Verify Changes

After deployment:

1. Visit your Vercel URL (e.g., `https://buried-treasure.vercel.app`)
2. Check the header - should say "Powered by Arcium MPC"
3. Connect wallet - button should show your address
4. Click wallet button again - should disconnect
5. Landing page - architecture section should be removed

## Troubleshooting

### Changes Not Showing

- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Check Vercel deployment logs for errors
- Verify files were committed and pushed

### Build Fails

- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify environment variables are set

### Need to Rollback

- Go to Vercel Dashboard → Deployments
- Find previous working deployment
- Click "..." → "Promote to Production"
