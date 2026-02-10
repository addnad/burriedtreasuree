#!/bin/bash

# GitHub Setup Script for Buried Treasure
# Run this script to initialize git and prepare for GitHub push

echo "🏴‍☠️ Buried Treasure - GitHub Setup"
echo "=================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already initialized"
fi

# Check if .gitignore exists
if [ ! -f ".gitignore" ]; then
    echo "⚠️  Warning: .gitignore not found"
else
    echo "✅ .gitignore found"
fi

# Add all files
echo ""
echo "📝 Staging files..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit"
else
    echo "💾 Committing changes..."
    git commit -m "Initial commit: Buried Treasure - Encrypted Island Exploration Game

- Next.js 14 with TypeScript
- Solana wallet adapter integration
- Arcium MPC game client
- Full game UI with 10x10 grid
- Backend API routes for game actions
- Ready for Vercel deployment"
    echo "✅ Changes committed"
fi

echo ""
echo "=================================="
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Create a new repository on GitHub: https://github.com/new"
echo "2. Run these commands (replace YOUR_USERNAME with your GitHub username):"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/buried-treasure.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Then deploy to Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Import your GitHub repository"
echo "   - Vercel will auto-detect Next.js and deploy"
echo ""
echo "See DEPLOYMENT.md for detailed instructions."
