import { useState, useEffect, useRef, createContext, useContext } from 'react';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  deleteDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { TimeSlot, RSVP, PlayerId, TimeSlotsContextValue } from '../../types';

const TimeSlotsContext = createContext<TimeSlotsContextValue | null>(null);

export const useTimeSlots = (): TimeSlotsContextValue => {
  const context = useContext(TimeSlotsContext);
  if (!context) {
    throw new Error('useTimeSlots must be used within TimeSlotsProvider');
  }
  return context;
};

const appId = import.meta.env.VITE_APP_ID || 'pickle2fit-league-2026';

interface TimeSlotsProviderProps {
  children: React.ReactNode;
  user: User | null;
  db: Firestore;
}

export const TimeSlotsProvider: React.FC<TimeSlotsProviderProps> = ({ children, user, db }) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const timeSlotsInitialized = useRef<boolean>(false);
  const rsvpsInitialized = useRef<boolean>(false);

  // Real-time Time Slots Sync
  useEffect(() => {
    if (!user) return;

    const timeSlotsRef = collection(db, 'artifacts', appId, 'public', 'data', 'timeSlots');

    const unsubscribe = onSnapshot(timeSlotsRef, (snapshot) => {
      if (snapshot.empty && !timeSlotsInitialized.current) {
        timeSlotsInitialized.current = true;
        setTimeSlots([]);
        return;
      }

      const loadedTimeSlots = snapshot.docs.map(doc => doc.data() as TimeSlot);
      // Sort by dateTime (upcoming first)
      loadedTimeSlots.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
      setTimeSlots(loadedTimeSlots);
    }, (error) => {
      console.error("Time slots sync error:", error);
    });

    return () => unsubscribe();
  }, [user, db]);

  // Real-time RSVPs Sync
  useEffect(() => {
    if (!user) return;

    const rsvpsRef = collection(db, 'artifacts', appId, 'public', 'data', 'rsvps');

    const unsubscribe = onSnapshot(rsvpsRef, (snapshot) => {
      if (snapshot.empty && !rsvpsInitialized.current) {
        rsvpsInitialized.current = true;
        setRsvps([]);
        return;
      }

      const loadedRsvps = snapshot.docs.map(doc => doc.data() as RSVP);
      setRsvps(loadedRsvps);
    }, (error) => {
      console.error("RSVPs sync error:", error);
    });

    return () => unsubscribe();
  }, [user, db]);

  const proposeTimeSlot = async (dateTime: string, location: string, notes: string): Promise<void> => {
    if (!user) return;
    try {
      const timeSlotRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'timeSlots'));
      const timeSlotData: TimeSlot = {
        id: timeSlotRef.id,
        dateTime: new Date(dateTime).toISOString(),
        location: location || '',
        proposedBy: user.displayName || user.email || 'Unknown',
        proposedById: user.uid,
        proposedAt: new Date().toISOString(),
        status: 'active',
        notes: notes || '',
        linkedMatches: []
      };
      await setDoc(timeSlotRef, timeSlotData);
    } catch (e) {
      console.error("Error proposing time slot:", e);
      throw e;
    }
  };

  const cancelTimeSlot = async (timeSlotId: string): Promise<void> => {
    if (!user) return;
    try {
      const timeSlotRef = doc(db, 'artifacts', appId, 'public', 'data', 'timeSlots', timeSlotId);
      const timeSlotSnap = await getDoc(timeSlotRef);
      if (!timeSlotSnap.exists()) return;

      const timeSlotData = timeSlotSnap.data() as TimeSlot;

      await setDoc(timeSlotRef, {
        ...timeSlotData,
        status: 'cancelled' as const
      });
    } catch (e) {
      console.error("Error cancelling time slot:", e);
      throw e;
    }
  };

  const updateTimeSlot = async (timeSlotId: string, dateTime: string, location: string, notes: string): Promise<void> => {
    if (!user) return;
    try {
      const timeSlotRef = doc(db, 'artifacts', appId, 'public', 'data', 'timeSlots', timeSlotId);
      const timeSlotSnap = await getDoc(timeSlotRef);
      if (!timeSlotSnap.exists()) return;

      const timeSlotData = timeSlotSnap.data() as TimeSlot;

      await setDoc(timeSlotRef, {
        ...timeSlotData,
        dateTime: dateTime ? new Date(dateTime).toISOString() : timeSlotData.dateTime,
        location: location || '',
        notes: notes || ''
      });
    } catch (e) {
      console.error("Error updating time slot:", e);
      throw e;
    }
  };

  const deleteTimeSlot = async (timeSlotId: string): Promise<void> => {
    if (!user) return;
    try {
      const timeSlotRef = doc(db, 'artifacts', appId, 'public', 'data', 'timeSlots', timeSlotId);
      await deleteDoc(timeSlotRef);

      // Also delete associated RSVPs
      const rsvpsRef = collection(db, 'artifacts', appId, 'public', 'data', 'rsvps');
      const q = query(rsvpsRef, where('timeSlotId', '==', timeSlotId));
      const rsvpSnaps = await getDocs(q);

      const deletePromises = rsvpSnaps.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (e) {
      console.error("Error deleting time slot:", e);
      throw e;
    }
  };

  const submitRSVP = async (
    timeSlotId: string,
    playerId: PlayerId,
    status: 'coming' | 'not_coming',
    notes: string,
    onBehalfOf: boolean = false
  ): Promise<void> => {
    if (!user) return;
    try {
      // Check if RSVP already exists for this player and time slot
      const existingRSVP = rsvps.find(r => r.timeSlotId === timeSlotId && r.playerId === playerId);

      if (existingRSVP) {
        // Update existing RSVP
        const rsvpRef = doc(db, 'artifacts', appId, 'public', 'data', 'rsvps', existingRSVP.id);
        const rsvpSnap = await getDoc(rsvpRef);
        if (!rsvpSnap.exists()) return;

        const rsvpData = rsvpSnap.data() as RSVP;

        await setDoc(rsvpRef, {
          ...rsvpData,
          status,
          respondedBy: user.displayName || user.email || 'Unknown',
          respondedById: user.uid,
          onBehalfOf,
          respondedAt: new Date().toISOString(),
          notes: notes || ''
        });
      } else {
        // Create new RSVP
        const rsvpRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'rsvps'));
        const rsvpData: RSVP = {
          id: rsvpRef.id,
          timeSlotId,
          playerId,
          status,
          respondedBy: user.displayName || user.email || 'Unknown',
          respondedById: user.uid,
          onBehalfOf,
          respondedAt: new Date().toISOString(),
          notes: notes || ''
        };
        await setDoc(rsvpRef, rsvpData);
      }
    } catch (e) {
      console.error("Error submitting RSVP:", e);
      throw e;
    }
  };

  const linkMatchToTimeSlot = async (timeSlotId: string, matchId: number, shouldLink: boolean = true): Promise<void> => {
    if (!user) return;
    try {
      const timeSlotRef = doc(db, 'artifacts', appId, 'public', 'data', 'timeSlots', timeSlotId);
      const timeSlotSnap = await getDoc(timeSlotRef);
      if (!timeSlotSnap.exists()) return;

      const timeSlotData = timeSlotSnap.data() as TimeSlot;
      const linkedMatches = timeSlotData.linkedMatches || [];

      const updatedMatches = shouldLink
        ? [...new Set([...linkedMatches, matchId])] // Add match, ensure unique
        : linkedMatches.filter(id => id !== matchId); // Remove match

      await setDoc(timeSlotRef, {
        ...timeSlotData,
        linkedMatches: updatedMatches
      });

      // Update match's scheduledDate
      const matchRef = doc(db, 'artifacts', appId, 'public', 'data', 'matches', matchId.toString());
      const matchSnap = await getDoc(matchRef);
      if (matchSnap.exists()) {
        const matchData = matchSnap.data();
        if (shouldLink) {
          // Set scheduledDate when linking
          await setDoc(matchRef, {
            ...matchData,
            scheduledDate: timeSlotData.dateTime
          });
        } else {
          // Remove scheduledDate when unlinking
          const { scheduledDate, ...matchDataWithoutSchedule } = matchData;
          await setDoc(matchRef, matchDataWithoutSchedule);
        }
      }
    } catch (e) {
      console.error("Error linking match to time slot:", e);
      throw e;
    }
  };

  const getRSVPsForTimeSlot = (timeSlotId: string): RSVP[] => {
    return rsvps.filter(r => r.timeSlotId === timeSlotId);
  };

  const getPlayerRSVP = (timeSlotId: string, playerId: PlayerId): RSVP | undefined => {
    return rsvps.find(r => r.timeSlotId === timeSlotId && r.playerId === playerId);
  };

  const value: TimeSlotsContextValue = {
    timeSlots,
    rsvps,
    user,
    proposeTimeSlot,
    cancelTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    submitRSVP,
    linkMatchToTimeSlot,
    getRSVPsForTimeSlot,
    getPlayerRSVP
  };

  return (
    <TimeSlotsContext.Provider value={value}>
      {children}
    </TimeSlotsContext.Provider>
  );
};
