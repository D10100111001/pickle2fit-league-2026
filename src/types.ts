// Firebase Auth types
import { User } from "firebase/auth";

// Player types
export interface Player {
  id: string;
  name: string;
}

export type PlayerId = string;

export interface PlayersMap {
  [key: string]: Player;
}

// Team types
export interface Team {
  id: string;
  name: string;
  captain: PlayerId;
  players: PlayerId[];
  color: string;
  logo: string;
}

// Match types
export interface MatchGame {
  scoreA: string | number;
  scoreB: string | number;
}

export interface MatchHistoryChange {
  scheduledDate?: { from: string | null; to: string | null };
  teamAPlayers?: { from: string; to: string };
  teamBPlayers?: { from: string; to: string };
  games?: { from: string; to: string };
  score?: { from: string; to: string };
  winner?: { from: string; to: string };
}

export interface MatchHistoryEntry {
  timestamp: string;
  userName: string;
  userId: string;
  changes: MatchHistoryChange;
}

export interface MatchSchedule {
  id: number;
  teamA: string;
  pA1: PlayerId;
  pA2: PlayerId;
  teamB: string;
  pB1: PlayerId;
  pB2: PlayerId;
}

export interface Match extends MatchSchedule {
  // Original schedule - computed at seed/load time, never modified
  originalPA1?: PlayerId;
  originalPA2?: PlayerId;
  originalPB1?: PlayerId;
  originalPB2?: PlayerId;
  winner?: string | null;
  score?: string;
  isFlexA?: boolean;
  isFlexB?: boolean;
  scheduledDate: string | null;
  reportedDate: string | null;
  reportedBy: string | null;
  reportedById: string | null;
  history?: MatchHistoryEntry[];
  games?: MatchGame[];
}

// RSVP types
export interface RSVP {
  id: string;
  timeSlotId: string;
  playerId: PlayerId;
  status: "coming" | "not_coming";
  notes?: string;
  respondedAt: string;
  respondedBy: string;
  respondedById: string;
  onBehalfOf?: boolean;
}

// TimeSlot types
export interface TimeSlot {
  id: string;
  dateTime: string;
  location?: string;
  notes?: string;
  status: "active" | "cancelled";
  proposedBy: string;
  proposedById: string;
  proposedAt: string;
  linkedMatches?: number[];
}

// Context types
export interface PlayersContextValue {
  players: PlayersMap;
  updatePlayer: (playerId: PlayerId, newName: string) => Promise<void>;
  getPlayerName: (playerId: PlayerId, fallbackToId?: boolean) => string;
}

export interface TimeSlotsContextValue {
  timeSlots: TimeSlot[];
  rsvps: RSVP[];
  user: User | null;
  proposeTimeSlot: (
    dateTime: string,
    location: string,
    notes: string
  ) => Promise<void>;
  updateTimeSlot: (
    slotId: string,
    dateTime: string,
    location: string,
    notes: string
  ) => Promise<void>;
  cancelTimeSlot: (slotId: string) => Promise<void>;
  deleteTimeSlot: (slotId: string) => Promise<void>;
  submitRSVP: (
    timeSlotId: string,
    playerId: PlayerId,
    status: "coming" | "not_coming",
    notes: string,
    onBehalfOf: boolean
  ) => Promise<void>;
  linkMatchToTimeSlot: (
    timeSlotId: string,
    matchId: number,
    shouldLink: boolean
  ) => Promise<void>;
  getRSVPsForTimeSlot: (timeSlotId: string) => RSVP[];
  getPlayerRSVP: (timeSlotId: string, playerId: PlayerId) => RSVP | undefined;
}

// Component prop types
export interface MatchCardProps {
  match: Match;
  teams: Team[];
  onEdit: () => void;
}

export interface ReportModalProps {
  match: Match;
  onClose: () => void;
  onSave: (matchId: number, data: Partial<Match>) => void;
  teams: Team[];
  user: User | null;
  playerName: string | null;
}

export interface RSVPModalProps {
  timeSlot: TimeSlot;
  onClose: () => void;
}

export interface PlayerIdentificationModalProps {
  teams: Team[];
  onIdentify: (playerName: string) => void;
}

export interface AppInfoModalProps {
  onClose: () => void;
}

export interface MatchScheduleProps {
  matches: Match[];
  updateMatch: (matchId: number, data: Partial<Match>) => void;
  teams: Team[];
  user: User | null;
  playerName: string | null;
  initialFilter?: "all" | "completed" | "upcoming" | "flexed";
  ReportModal: React.ComponentType<ReportModalProps>;
}

export interface DashboardProps {
  matches: Match[];
  teams: Team[];
}

export interface TeamsListProps {
  teams: Team[];
}

export interface TimeSlotSchedulerProps {
  matches: Match[];
}

export interface RulesPageProps {}

// Constants types
export interface LeagueRules {
  totalGames: number;
  flexLimit: number;
}
