# 🔒 Security Checklist for Vercel Deployment

## Critical Security Fixes Applied

### ✅ 1. API Keys & Secrets Protection
- **Issue**: Firebase API key was hardcoded in `src/firebase/config.ts`
- **Fix**: Now reads from environment variables with fallback
- **Action for Vercel**: 
  ```
  Go to Vercel Dashboard → Project Settings → Environment Variables
  Add all NEXT_PUBLIC_FIREBASE_* variables
  ```

### ✅ 2. Console Error Exposure
- **Issue**: `console.error/warn` was exposing full error details in production
- **Fix**: Errors only logged in development (`process.env.NODE_ENV !== "production"`)
- **Location**: 
  - `src/firebase/index.ts` (Line 22)
  - `src/firebase/provider.tsx` (Line 87)

### ✅ 3. Environment File Management
- **Created**: `.env.example` - Safe template for team
- **Updated**: `.env.local` - Local development (auto-ignored by git)
- **Protected**: `.gitignore` - Prevents accidental secret commits

### ✅ 4. Export Conflicts Resolved
- **Issue**: `useAuth` exported from two modules
- **Fix**: Renamed `provider.tsx` export to `useAuthService`
- **Location**: `src/firebase/provider.tsx` (Line 141)

### ✅ 5. useSearchParams Suspense Boundary
- **Issue**: Next.js 15 requires Suspense for `useSearchParams`
- **Fix**: Wrapped LoginPage content in `<Suspense>`
- **Location**: `src/app/login/page.tsx`

## Vercel Deployment Setup

### Step 1: Add Environment Variables
In Vercel Dashboard:
1. Go to **Settings** → **Environment Variables**
2. Add these variables (from Firebase Console):
   ```
   NEXT_PUBLIC_FIREBASE_PROJECT_ID = studio-5221026026-b0007
   NEXT_PUBLIC_FIREBASE_APP_ID = 1:647627665607:web:adc4c8eb7854f62a618ee2
   NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyBqKrWxnlmznvtxRyGjL3xKyDsVms4xUaQ
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = studio-5221026026-b0007.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = (empty if none)
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 647627665607
   GEMINI_API_KEY = (if using AI features)
   ```

### Step 2: Update Firebase Console
In Firebase Console:
1. Go to **Authentication** → **Settings**
2. Add to "Authorized domains":
   - `your-vercel-domain.vercel.app`
   - Your custom domain (if any)

### Step 3: Verify Deployment
After deploy, test:
- [ ] Login/Signup works
- [ ] Google OAuth signs in
- [ ] View forms at `/view/[formId]`
- [ ] No secrets in browser console
- [ ] No API keys in network requests

## What NOT to Commit
```
❌ .env (local secrets)
❌ .env.local (development secrets)
❌ firebase-debug.log
❌ firestore-debug.log
❌ API keys or credentials

✅ .env.example (template only)
✅ vercel.json (configuration)
```

## Local Development
1. Copy `.env.example` to `.env.local`
2. Add actual Firebase keys to `.env.local` (auto-ignored by git)
3. Never commit `.env.local`

## Production Checks
- [ ] All console.log calls removed/wrapped in dev-only checks
- [ ] No hardcoded secrets in source code
- [ ] Environment variables set in Vercel Dashboard
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors: `npm run typecheck`

## Npm Vulnerabilities
Run locally:
```bash
npm audit
npm audit fix
```
Address any remaining issues before production.

## Additional Security
1. **Firestore Rules**: Reviewed in `firestore.rules` ✅
2. **Authentication**: Using Firebase Auth with email + Google OAuth ✅
3. **Data Protection**: User data isolated per UID ✅
