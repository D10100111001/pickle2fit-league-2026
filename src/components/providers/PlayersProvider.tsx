import { useState, useEffect, useRef, createContext, useContext } from 'react';
import {
  Firestore,
  doc,
  setDoc,
  collection,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { INITIAL_PLAYERS } from '../../constants';
import { PlayersMap, PlayerId, PlayersContextValue } from '../../types';

const PlayersContext = createContext<PlayersContextValue | null>(null);

export const usePlayers = (): PlayersContextValue => {
  const context = useContext(PlayersContext);
  if (!context) {
    throw new Error('usePlayers must be used within PlayersProvider');
  }
  return context;
};

const appId = import.meta.env.VITE_APP_ID || 'pickle2fit-league-2026';

interface PlayersProviderProps {
  children: React.ReactNode;
  user: User | null;
  db: Firestore;
}

export const PlayersProvider: React.FC<PlayersProviderProps> = ({ children, user, db }) => {
  const [players, setPlayers] = useState<PlayersMap>(INITIAL_PLAYERS);
  const playersInitialized = useRef<boolean>(false);

  // Real-time Players Sync
  useEffect(() => {
    if (!user) return;

    const playersRef = collection(db, 'artifacts', appId, 'public', 'data', 'players');

    const unsubscribe = onSnapshot(playersRef, async (snapshot) => {
      // Auto-Seed Players if empty
      if (snapshot.empty && !playersInitialized.current) {
        playersInitialized.current = true;
        // Batch write the initial players
        const batch = writeBatch(db);
        Object.values(INITIAL_PLAYERS).forEach(player => {
          const ref = doc(db, 'artifacts', appId, 'public', 'data', 'players', player.id);
          batch.set(ref, player);
        });
        await batch.commit();
        return;
      }

      // Load players from Firestore
      const loadedPlayers: PlayersMap = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        loadedPlayers[data.id] = data as { id: string; name: string };
      });
      setPlayers(loadedPlayers);
    }, (error) => {
      console.error("Players sync error:", error);
    });

    return () => unsubscribe();
  }, [user, db]);

  const updatePlayer = async (playerId: PlayerId, newName: string): Promise<void> => {
    if (!user) return;
    try {
      const playerRef = doc(db, 'artifacts', appId, 'public', 'data', 'players', playerId);
      await setDoc(playerRef, { id: playerId, name: newName }, { merge: true });
    } catch (e) {
      console.error("Error updating player:", e);
    }
  };

  const getPlayerName = (playerId: PlayerId, full: boolean = false): string => {
    const fullName = players[playerId]?.name || playerId;

    if (full) return fullName;

    // Return abbreviated by default (e.g., "Azeem Muhammad" -> "Azeem M.")
    const parts = fullName.split(' ');
    if (parts.length >= 2) {
      const firstName = parts[0];
      const lastInitial = parts[parts.length - 1][0];
      return `${firstName} ${lastInitial}.`;
    }
    return fullName;
  };

  const value: PlayersContextValue = {
    players,
    updatePlayer,
    getPlayerName
  };

  return (
    <PlayersContext.Provider value={value}>
      {children}
    </PlayersContext.Provider>
  );
};
