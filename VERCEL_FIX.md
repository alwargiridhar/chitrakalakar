# Deployment Guide for Vercel

## Option 1: Configure in Vercel Dashboard (Recommended)

1. Go to your Vercel project settings
2. Go to **Settings** → **General**
3. Under **Build & Development Settings**:
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend`
   - **Build Command:** `yarn build`
   - **Output Directory:** `build`
   - **Install Command:** `yarn install --frozen-lockfile`
   - **Node Version:** 18.x

4. Go to **Settings** → **Environment Variables**
   Add these variables:
   ```
   REACT_APP_BACKEND_URL=https://your-render-backend.onrender.com
   REACT_APP_SUPABASE_URL=https://lurvhgzauuzwftfymjym.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=sb_publishable_YRUGm-45aY165zzIebAERw_QQsKtGYA
   WDS_SOCKET_PORT=443
   ENABLE_HEALTH_CHECK=false
   ```

5. Save and redeploy

## Option 2: Using vercel.json (Alternative)

If the above doesn't work, the `vercel.json` in the root is configured to:
- Use yarn package manager
- Build from frontend directory
- Output to frontend/build

## Troubleshooting

### If still detecting pnpm:
1. Delete the deployment in Vercel
2. Reconnect the GitHub repository
3. Make sure to set Root Directory to `frontend` in settings

### If build fails:
Check these in Vercel logs:
- Node version (should be 18.x)
- Package manager (should be yarn)
- Build command output
- Environment variables are loaded

### Manual deployment test:
```bash
cd frontend
yarn install
yarn build
```

This should work without errors locally before deploying.
