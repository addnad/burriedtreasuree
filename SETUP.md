# Setup Instructions

## Issue: Site Not Loading

If the site doesn't load, follow these steps:

### 1. Install Dependencies

First, make sure you have Node.js installed (version 18 or higher). Then run:

```bash
npm install
```

If you encounter permission errors, try:
```bash
sudo npm install
```

Or use a node version manager like `nvm` to avoid permission issues.

### 2. Check Node.js Version

```bash
node --version
```

Should be v18.0.0 or higher.

### 3. Start Development Server

```bash
npm run dev
```

The site should be available at `http://localhost:3000`

### 4. Common Issues

#### "next: command not found"
- Dependencies aren't installed. Run `npm install` first.

#### "Module not found" errors
- Delete `node_modules` and `.next` folders, then run `npm install` again:
```bash
rm -rf node_modules .next
npm install
```

#### Port 3000 already in use
- Kill the process using port 3000 or use a different port:
```bash
npm run dev -- -p 3001
```

#### TypeScript errors
- Make sure `tsconfig.json` is in the root directory
- Run `npm install` to ensure all TypeScript types are installed

### 5. Browser Console Errors

If the site loads but shows errors in the browser console:

1. **Wallet adapter errors**: Make sure Phantom wallet extension is installed
2. **API errors**: The backend API routes should work out of the box with in-memory state
3. **Import errors**: Check that all files are in the correct directories

### 6. Production Build

To build for production:

```bash
npm run build
npm start
```

### 7. Still Having Issues?

Check:
- Node.js version (should be 18+)
- npm version (should be 9+)
- All files are in the correct locations
- No syntax errors in TypeScript files
- Browser console for specific error messages
