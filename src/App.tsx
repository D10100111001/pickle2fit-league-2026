import { useState, useEffect, useRef } from 'react';
import {
  Trophy,
  Calendar,
  CalendarClock,
  Users,
  Activity,
  Medal,
  Zap,
  Wifi,
  Loader2
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { PlayersProvider, TimeSlotsProvider } from './components/providers';
import { NavBtn, MobileNavBtn } from './components/common';
import { Dashboard } from './components/dashboard';
import { MatchSchedule } from './components/matches';
import { PlayerIdentificationModal, ReportModal, AppInfoModal } from './components/modals';
import { TeamsList } from './components/teams';
import { TimeSlotScheduler } from './components/timeslots';
import { RulesPage } from './components/rules';
import { INITIAL_TEAMS, SEEDED_MATCHES } from './constants';
import { Match } from './types';

/**
 * Pickle2Fit League 2026
 * A modern, responsive web app for managing the pickleball league.
 * Now with Firebase Persistence for real-time collaboration.
 */

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyB4YtbRd0qYBq9jZQrYB0QgEQK07Q_jHRc",
  authDomain: "pickle2fit-league-2026.firebaseapp.com",
  projectId: "pickle2fit-league-2026",
  storageBucket: "pickle2fit-league-2026.firebasestorage.app",
  messagingSenderId: "676617297490",
  appId: "1:676617297490:web:ad961312fb725c3c4b898b",
  measurementId: "G-FELZ7KLY3S"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = import.meta.env.VITE_APP_ID || 'pickle2fit-league-2026';

interface TeamStats {
  id: string;
  name: string;
  wins: number;
  losses: number;
  flexUsed: number;
  played: number;
}

// --- Main App Component ---
export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<TeamStats[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [showPlayerIdentification, setShowPlayerIdentification] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [imageError, setImageError] = useState<boolean>(false);
  const [showAppInfo, setShowAppInfo] = useState<boolean>(false);
  const [matchesFilter, setMatchesFilter] = useState<'all' | 'completed' | 'upcoming'>('all');
  const initialized = useRef<boolean>(false);

  // --- Auth & Init ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed. User:", user);
      setUser(user);
      if (user) {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Google Sign-In handler
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Google Sign-In failed:", err);
      // Fallback to anonymous auth if user cancels or error occurs
      try {
        await signInAnonymously(auth);
      } catch (fallbackErr) {
        console.error("Anonymous auth also failed:", fallbackErr);
      }
    }
  };

  // --- Check User Identification ---
  useEffect(() => {
    if (!user) return;

    const checkPlayerIdentification = async () => {
      try {
        const userPlayerRef = doc(db, 'artifacts', appId, 'public', 'data', 'userPlayers', user.uid);
        const userPlayerDoc = await getDoc(userPlayerRef);

        if (userPlayerDoc.exists()) {
          setPlayerName(userPlayerDoc.data().playerName);
          setShowPlayerIdentification(false);
        } else if (user.displayName) {
          // Automatically use Google display name
          await setDoc(userPlayerRef, {
            playerName: user.displayName,
            userId: user.uid,
            email: user.email,
            photoURL: user.photoURL,
            identifiedAt: new Date().toISOString()
          });
          setPlayerName(user.displayName);
          setShowPlayerIdentification(false);
        } else {
          setShowPlayerIdentification(true);
        }
      } catch (err) {
        console.error("Error checking player identification:", err);
        // Use display name as fallback even if Firestore fails
        if (user.displayName) {
          setPlayerName(user.displayName);
          setShowPlayerIdentification(false);
        } else {
          setShowPlayerIdentification(true);
        }
      }
    };

    checkPlayerIdentification();
  }, [user]);

  // Handler for player identification
  const handlePlayerIdentify = async (selectedPlayer: string) => {
    if (!user) return;

    try {
      const userPlayerRef = doc(db, 'artifacts', appId, 'public', 'data', 'userPlayers', user.uid);
      await setDoc(userPlayerRef, {
        playerName: selectedPlayer,
        userId: user.uid,
        identifiedAt: new Date().toISOString()
      });

      setPlayerName(selectedPlayer);
      setShowPlayerIdentification(false);
    } catch (err) {
      console.error("Error saving player identification:", err);
    }
  };

  // --- Real-time Data Sync ---
  useEffect(() => {
    if (!user) return;

    const matchesRef = collection(db, 'artifacts', appId, 'public', 'data', 'matches');

    const unsubscribe = onSnapshot(matchesRef, async (snapshot) => {
      setLoading(true);

      // Auto-Seed Database if empty
      if (snapshot.empty && !initialized.current) {
        initialized.current = true;
        // Batch write the initial seed data
        const batch = writeBatch(db);
        SEEDED_MATCHES.forEach(match => {
          const ref = doc(db, 'artifacts', appId, 'public', 'data', 'matches', match.id.toString());
          batch.set(ref, match);
        });
        await batch.commit();
        setLoading(false);
        return;
      }

      const loadedMatches = snapshot.docs.map(doc => doc.data() as Match);
      // Sort in memory (Rule 2: Avoid complex queries)
      loadedMatches.sort((a, b) => a.id - b.id);

      setMatches(loadedMatches);
      setLoading(false);
    }, (error) => {
      console.error("Sync error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Recalculate standings whenever matches change
  useEffect(() => {
    calculateStandings();
  }, [matches]);

  const calculateStandings = () => {
    const stats: { [key: string]: TeamStats } = {};
    INITIAL_TEAMS.forEach(t => {
      stats[t.id] = { id: t.id, name: t.name, wins: 0, losses: 0, flexUsed: 0, played: 0 };
    });

    matches.forEach(m => {
      if (m.winner) {
        if(stats[m.teamA]) stats[m.teamA].played += 1;
        if(stats[m.teamB]) stats[m.teamB].played += 1;

        if (m.winner === m.teamA && stats[m.teamA]) {
          stats[m.teamA].wins += 1;
          if(stats[m.teamB]) stats[m.teamB].losses += 1;
        } else if(stats[m.teamB]) {
          stats[m.teamB].wins += 1;
          if(stats[m.teamA]) stats[m.teamA].losses += 1;
        }

        // Flex Logic
        if (m.isFlexA && stats[m.teamA]) stats[m.teamA].flexUsed += 1;
        if (m.isFlexB && stats[m.teamB]) stats[m.teamB].flexUsed += 1;
      }
    });

    // Sort by Wins, then win %
    const sorted = Object.values(stats).sort((a, b) => b.wins - a.wins);
    setStandings(sorted);
  };

  const updateMatch = async (id: number, data: Partial<Match>) => {
    if (!user) return;
    try {
      const matchRef = doc(db, 'artifacts', appId, 'public', 'data', 'matches', id.toString());
      await setDoc(matchRef, data, { merge: true });
    } catch (e) {
      console.error("Error updating match:", e);
    }
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'matches') {
      // Reset filter to 'all' when manually navigating to matches tab
      setMatchesFilter('all');
    }
    setActiveTab(tab);
  };

  const renderContent = () => {
    if (loading && matches.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-10 h-10 text-lime-400 animate-spin" />
          <p className="text-slate-400 text-sm">Syncing League Data...</p>
        </div>
      );
    }

    switch(activeTab) {
      case 'dashboard': return <Dashboard standings={standings} matches={matches} teams={INITIAL_TEAMS} onMatchClick={setEditingMatch} onViewAllMatches={() => { setMatchesFilter('completed'); setActiveTab('matches'); }} />;
      case 'matches': return <MatchSchedule matches={matches} updateMatch={updateMatch} teams={INITIAL_TEAMS} user={user} playerName={playerName} initialFilter={matchesFilter} ReportModal={ReportModal} />;
      case 'schedule': return <TimeSlotScheduler matches={matches} />;
      case 'teams': return <TeamsList teams={INITIAL_TEAMS} />;
      case 'rules': return <RulesPage />;
      default: return <Dashboard standings={standings} matches={matches} teams={INITIAL_TEAMS} onMatchClick={setEditingMatch} onViewAllMatches={() => { setMatchesFilter('completed'); setActiveTab('matches'); }} />;
    }
  };

  // Show login screen if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-lime-400 to-emerald-500 p-4 rounded-2xl shadow-2xl">
                <Trophy className="w-16 h-16 text-slate-950" />
              </div>
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Pickle2Fit
            </h1>
            <p className="text-slate-400 text-lg mb-8">League 2026</p>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 group"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Sign in with Google</span>
          </button>

          <p className="text-slate-500 text-sm mt-4">
            Quick and secure access to the league dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <PlayersProvider user={user} db={db}>
    <TimeSlotsProvider user={user} db={db}>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-lime-400 selection:text-slate-900 pb-20 md:pb-0">
        {editingMatch && (
          <ReportModal
            match={editingMatch}
            teams={INITIAL_TEAMS}
            user={user}
            playerName={playerName}
            onClose={() => setEditingMatch(null)}
            onSave={(id: number, data: Partial<Match>) => {
              updateMatch(id, data);
              setEditingMatch(null);
            }}
          />
        )}

        {showPlayerIdentification && (
          <PlayerIdentificationModal
            teams={INITIAL_TEAMS}
            onIdentify={handlePlayerIdentify}
          />
        )}

      {showAppInfo && (
        <AppInfoModal onClose={() => setShowAppInfo(false)} />
      )}

      {/* Mobile-first Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/5 px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-lime-400 to-green-600 p-2 rounded-lg shadow-lg shadow-lime-500/20">
              <Trophy className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Pickle2Fit
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-lime-400 font-bold tracking-widest uppercase flex items-center gap-1">
                  {loading ? <Loader2 size={10} className="animate-spin" /> : <Wifi size={10} />}
                  League 2026
                </p>
                {/* Live Indicator */}
                <button
                  onClick={() => setShowAppInfo(true)}
                  className="group flex items-center gap-1 hover:opacity-80 transition-opacity"
                  title="Live sync enabled"
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                  </span>
                  <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider hidden sm:inline">
                    Live
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation + User Profile */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex gap-6 text-sm font-medium">
              <NavBtn active={activeTab === 'dashboard'} onClick={() => handleTabChange('dashboard')} icon={<Activity />}>Dashboard</NavBtn>
              <NavBtn active={activeTab === 'matches'} onClick={() => handleTabChange('matches')} icon={<Calendar />}>Matches</NavBtn>
              <NavBtn active={activeTab === 'schedule'} onClick={() => handleTabChange('schedule')} icon={<CalendarClock />}>Schedule</NavBtn>
              <NavBtn active={activeTab === 'teams'} onClick={() => handleTabChange('teams')} icon={<Users />}>Teams</NavBtn>
              <NavBtn active={activeTab === 'rules'} onClick={() => handleTabChange('rules')} icon={<Zap />}>Rules</NavBtn>
            </div>

            {/* User Profile */}
            {user && (
              <div className="relative group">
                <div className="flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors rounded-full pl-1 pr-3 py-1 border border-white/10 shrink-0 cursor-pointer">
                  {user.photoURL && !imageError ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      onError={() => setImageError(true)}
                      className="w-8 h-8 rounded-full ring-2 ring-lime-400/50 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lime-400 to-green-500 flex items-center justify-center text-slate-900 font-bold text-sm ring-2 ring-lime-400/50">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-white hidden md:inline-block max-w-[120px] truncate">
                    {user.displayName || user.email?.split('@')[0] || 'User'}
                  </span>
                </div>

                {/* Tooltip */}
                <div className="absolute right-0 top-full mt-2 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-4 min-w-[240px]">
                    <div className="flex items-center gap-3 mb-3">
                      {user.photoURL && !imageError ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || 'User'}
                          className="w-12 h-12 rounded-full ring-2 ring-lime-400/50 object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lime-400 to-green-500 flex items-center justify-center text-slate-900 font-bold text-lg ring-2 ring-lime-400/50">
                          {(user.displayName || user.email || 'U')[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-sm truncate">
                          {user.displayName || 'User'}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          {user.email || 'No email'}
                        </div>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-700 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-slate-400">Signed in with Google</span>
                      </div>
                      {playerName && (
                        <div className="flex items-center gap-2 text-xs">
                          <Users className="w-3 h-3 text-lime-400" />
                          <span className="text-slate-400">Playing as: <span className="text-white font-medium">{playerName}</span></span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {renderContent()}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-white/5 flex justify-around p-3 pb-safe z-50">
        <MobileNavBtn active={activeTab === 'dashboard'} onClick={() => handleTabChange('dashboard')} icon={<Activity size={20} />} label="Dash" />
        <MobileNavBtn active={activeTab === 'matches'} onClick={() => handleTabChange('matches')} icon={<Calendar size={20} />} label="Matches" />
        <MobileNavBtn active={activeTab === 'schedule'} onClick={() => handleTabChange('schedule')} icon={<CalendarClock size={20} />} label="Schedule" />
        <MobileNavBtn active={activeTab === 'teams'} onClick={() => handleTabChange('teams')} icon={<Users size={20} />} label="Teams" />
        <MobileNavBtn active={activeTab === 'rules'} onClick={() => handleTabChange('rules')} icon={<Medal size={20} />} label="Playoffs" />
      </nav>
    </div>
    </TimeSlotsProvider>
    </PlayersProvider>
  );
}
