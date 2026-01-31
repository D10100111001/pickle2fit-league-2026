# Pickle2Fit League 2026

A modern, responsive pickleball league management application built with React, Firebase, and Tailwind CSS.

## Features

- 📊 Real-time match tracking and standings
- 👥 Player identification system
- 📅 Match scheduling with dates
- 📝 Complete match reporting with history
- 🔥 Firebase real-time sync
- 📱 Mobile-first responsive design
- ✨ Beautiful UI with Tailwind CSS

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Firebase project

## Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Give your project a name (e.g., "pickle2fit-league")

### 2. Enable Firebase Services

**Enable Authentication:**
1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Enable **Anonymous** sign-in method

**Enable Firestore Database:**
1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Start in **production mode**
4. Choose a location closest to your users

### 3. Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (⚙️ gear icon)
2. Scroll down to "Your apps" section
3. Click the **Web** icon (`</>`)
4. Register your app with a nickname (e.g., "Pickle2Fit Web")
5. Copy the `firebaseConfig` object values

### 4. Set Up Firestore Security Rules

In Firebase Console > Firestore Database > Rules, use these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/public/data/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` and add your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_APP_ID=pickle2fit-league-2026
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Deployment to Netlify

### Option 1: Deploy via Netlify CLI

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. Initialize and deploy:
```bash
netlify init
```

4. Set environment variables in Netlify:
```bash
netlify env:set VITE_FIREBASE_API_KEY "your_api_key_here"
netlify env:set VITE_FIREBASE_AUTH_DOMAIN "your_project.firebaseapp.com"
netlify env:set VITE_FIREBASE_PROJECT_ID "your_project_id"
netlify env:set VITE_FIREBASE_STORAGE_BUCKET "your_project.appspot.com"
netlify env:set VITE_FIREBASE_MESSAGING_SENDER_ID "123456789"
netlify env:set VITE_FIREBASE_APP_ID "1:123456:web:abcdef"
netlify env:set VITE_APP_ID "pickle2fit-league-2026"
```

5. Deploy:
```bash
netlify deploy --prod
```

### Option 2: Deploy via Netlify UI

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Connect to Netlify:**
   - Go to [Netlify](https://app.netlify.com/)
   - Click "Add new site" > "Import an existing project"
   - Connect your GitHub repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`

3. **Set Environment Variables:**
   - In Netlify Dashboard, go to Site Settings > Environment Variables
   - Click "Add a variable" and add all `VITE_*` variables from your `.env` file

4. **Deploy:**
   - Click "Deploy site"
   - Your site will be live at `https://your-site-name.netlify.app`

### Option 3: One-Click Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

After deploying, remember to set your Firebase environment variables in Netlify!

## Project Structure

```
pickle2fit/app/
├── src/
│   ├── App.jsx           # Main application component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles with Tailwind
├── public/               # Static assets
├── index.html            # HTML template
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore rules
├── netlify.toml         # Netlify configuration
├── package.json         # Dependencies
├── postcss.config.js    # PostCSS configuration
├── tailwind.config.js   # Tailwind configuration
└── vite.config.js       # Vite configuration
```

## How It Works

1. **User Identification:** When users first open the app, they're prompted to identify themselves from the player list
2. **Real-time Sync:** All match data is stored in Firebase Firestore and syncs in real-time
3. **Match Management:** Users can report scores, schedule matches, and view complete history
4. **Audit Trail:** Every change is tracked with the user's name and ID for accountability

## Built With

- [React](https://react.dev/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [Firebase](https://firebase.google.com/) - Backend & database
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Lucide React](https://lucide.dev/) - Icons

## License

MIT
