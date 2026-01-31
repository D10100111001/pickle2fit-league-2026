# Quick Start Guide

Get your Pickle2Fit League app running in 5 minutes!

## Step 1: Firebase Setup (5 minutes)

1. Go to https://console.firebase.google.com/
2. Click "Add project" → Name it "pickle2fit" → Continue
3. Disable Google Analytics → Create project
4. Enable Authentication:
   - Click **Authentication** → Get Started
   - Click **Sign-in method** tab
   - Enable **Anonymous** → Save
5. Enable Firestore:
   - Click **Firestore Database** → Create database
   - Production mode → Next → Enable
6. Set Security Rules:
   - Click **Rules** tab
   - Replace with:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /artifacts/{appId}/public/data/{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
   - Publish
7. Get Config:
   - Click ⚙️ (Settings) → Project settings
   - Scroll to "Your apps" → Click Web icon (`</>`)
   - Register app → Copy the config values

## Step 2: Local Setup (2 minutes)

```bash
cd /Users/shah/Documents/repos/pickle2fit/app

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and paste your Firebase config
nano .env  # or use any editor

# Run development server
npm run dev
```

Open http://localhost:5173

## Step 3: Deploy to Netlify (3 minutes)

### Quick Deploy via UI:

1. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
# Create repo on GitHub, then:
git remote add origin https://github.com/yourusername/pickle2fit.git
git push -u origin main
```

2. Deploy on Netlify:
   - Go to https://app.netlify.com/
   - "Add new site" → "Import an existing project"
   - Choose GitHub → Select your repo
   - Build settings are auto-detected ✅
   - Click "Add environment variables"
   - Add all `VITE_*` variables from your `.env` file
   - Click "Deploy"

Done! Your app is live! 🎉

## Your Firebase Config Should Look Like:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=pickle2fit-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=pickle2fit-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=pickle2fit-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_APP_ID=pickle2fit-league-2026
```

## Need Help?

- Firebase not connecting? Check your `.env` file has correct values
- Build failing? Run `npm install` again
- Firestore permission denied? Check security rules are published

That's it! 🏓
