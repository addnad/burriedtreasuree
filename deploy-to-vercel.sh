#!/bin/bash

# Deploy to Vercel Script
# This script commits changes and provides instructions for Vercel deployment

echo "🚀 Buried Treasure - Vercel Deployment Helper"
echo "=============================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
fi

# Add all files
echo "📝 Staging changes..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit"
else
    echo "💾 Committing changes..."
    git commit -m "Update UI: Add disconnect wallet, update branding, remove architecture section

- Changed 'Arcium MPC' to 'Powered by Arcium MPC'
- Added disconnect wallet functionality
- Removed architecture section from landing page"
    echo "✅ Changes committed"
fi

echo ""
echo "=============================================="
echo "✅ Local changes committed!"
echo ""
echo "Next steps to deploy to Vercel:"
echo ""
echo "1. Push to GitHub (if not already done):"
echo "   git remote add origin https://github.com/YOUR_USERNAME/buried-treasure.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "2. Deploy to Vercel:"
echo "   Option A - Via Dashboard (Recommended):"
echo "   - Go to https://vercel.com"
echo "   - Your project should auto-deploy on push"
echo "   - Or manually trigger: Settings → Deployments → Redeploy"
echo ""
echo "   Option B - Via CLI:"
echo "   npm i -g vercel"
echo "   vercel --prod"
echo ""
echo "3. Verify deployment:"
echo "   - Check Vercel dashboard for deployment status"
echo "   - Visit your Vercel URL to test changes"
echo ""
