import { Match, Team } from '../types';
import { getMatchWinner, isTeamAFlex, isTeamBFlex } from './matchUtils';

/**
 * Get local date string (YYYY-MM-DD) in the user's timezone.
 * Avoids UTC conversion issues.
 */
function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get the latest match session (continuous consecutive days of games).
 * Returns the most recent date from the latest session.
 * Uses reportedDate and local timezone.
 */
export function getLatestMatchDay(matches: Match[]): string | null {
  const completedMatches = matches.filter(m => m.reportedDate && getMatchWinner(m) !== null);

  if (completedMatches.length === 0) {
    return null;
  }

  // Get unique days from reportedDate in local timezone
  const uniqueDays = new Set<string>();
  completedMatches.forEach(m => {
    if (m.reportedDate) {
      const date = new Date(m.reportedDate);
      const dayKey = getLocalDateString(date);
      uniqueDays.add(dayKey);
    }
  });

  if (uniqueDays.size === 0) {
    return null;
  }

  // Sort days descending (most recent first)
  const sortedDays = Array.from(uniqueDays).sort((a, b) => b.localeCompare(a));

  // Return the most recent day as a date string
  return sortedDays[0];
}

/**
 * Get all unique match days from completed matches, sorted by most recent first.
 */
export function getAllMatchDays(matches: Match[]): string[] {
  const completedMatches = matches.filter(m => m.reportedDate && getMatchWinner(m) !== null);

  if (completedMatches.length === 0) {
    return [];
  }

  // Get unique dates (by day, not time)
  const uniqueDays = new Set<string>();
  completedMatches.forEach(m => {
    const date = new Date(m.reportedDate!);
    const dayKey = date.toISOString().split('T')[0]; // Get YYYY-MM-DD
    uniqueDays.add(dayKey);
  });

  // Convert back to full ISO strings (using the earliest time for each day)
  const days = Array.from(uniqueDays).map(dayKey => {
    const matchesOnDay = completedMatches.filter(m => {
      const date = new Date(m.reportedDate!);
      return date.toISOString().split('T')[0] === dayKey;
    });

    // Get the earliest reportedDate for this day
    const dates = matchesOnDay.map(m => new Date(m.reportedDate!));
    const earliestDate = new Date(Math.min(...dates.map(d => d.getTime())));

    return earliestDate.toISOString();
  });

  // Sort by most recent first
  return days.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
}

/**
 * Filter matches to only those from the latest session.
 * Groups all matches from consecutive days (no gaps) starting from the target date.
 * Uses local timezone to avoid UTC conversion issues.
 */
export function getMatchesForDay(matches: Match[], dayString: string): Match[] {
  const completedMatches = matches.filter(m => m.reportedDate && getMatchWinner(m) !== null);

  if (completedMatches.length === 0) {
    return [];
  }

  // Get all unique days with matches in local timezone
  const daysWithMatches = new Set<string>();
  completedMatches.forEach(m => {
    if (m.reportedDate) {
      const date = new Date(m.reportedDate);
      const dayKey = getLocalDateString(date);
      daysWithMatches.add(dayKey);
    }
  });

  const sortedDays = Array.from(daysWithMatches).sort((a, b) => b.localeCompare(a));

  if (sortedDays.length === 0) {
    return [];
  }

  // Start with the most recent day
  const latestDay = sortedDays[0];
  const sessionDays = [latestDay];

  // Go backwards and include consecutive days
  for (let i = 1; i < sortedDays.length; i++) {
    const currentDay = sortedDays[i];
    const previousDay = sortedDays[i - 1];

    // Calculate days between (using local dates)
    const current = new Date(currentDay + 'T00:00:00');
    const previous = new Date(previousDay + 'T00:00:00');
    const daysDiff = Math.round((previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));

    // If consecutive (1 day apart), include it
    if (daysDiff === 1) {
      sessionDays.push(currentDay);
    } else {
      // Gap found, stop
      break;
    }
  }

  // Return all matches from the session days
  return completedMatches.filter(m => {
    if (!m.reportedDate) return false;
    const date = new Date(m.reportedDate);
    const matchDay = getLocalDateString(date);
    return sessionDays.includes(matchDay);
  });
}

/**
 * Calculate team standings for a specific set of matches.
 */
export function calculateStandingsForMatches(
  matches: Match[],
  teams: Team[]
): Array<{
  id: string;
  name: string;
  wins: number;
  losses: number;
  played: number;
  flexUsed: number;
}> {
  const stats = teams.map(team => ({
    id: team.id,
    name: team.name,
    wins: 0,
    losses: 0,
    played: 0,
    flexUsed: 0,
  }));

  matches.forEach(match => {
    const winner = getMatchWinner(match);
    if (!winner) return;

    const teamAStats = stats.find(s => s.id === match.teamA);
    const teamBStats = stats.find(s => s.id === match.teamB);

    if (teamAStats) {
      teamAStats.played++;
      if (winner === match.teamA) {
        teamAStats.wins++;
      } else {
        teamAStats.losses++;
      }
      if (isTeamAFlex(match)) {
        teamAStats.flexUsed++;
      }
    }

    if (teamBStats) {
      teamBStats.played++;
      if (winner === match.teamB) {
        teamBStats.wins++;
      } else {
        teamBStats.losses++;
      }
      if (isTeamBFlex(match)) {
        teamBStats.flexUsed++;
      }
    }
  });

  // Sort by wins (descending), then by win rate
  return stats.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    const aWinRate = a.played > 0 ? a.wins / a.played : 0;
    const bWinRate = b.played > 0 ? b.wins / b.played : 0;
    return bWinRate - aWinRate;
  });
}

/**
 * Format a match session for display.
 * dayString is in YYYY-MM-DD format (local timezone).
 */
export function formatMatchDay(dayString: string): string {
  const date = new Date(dayString + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const compareDate = new Date(dayString + 'T00:00:00');
  compareDate.setHours(0, 0, 0, 0);

  const daysAgo = Math.floor((today.getTime() - compareDate.getTime()) / (1000 * 60 * 60 * 24));

  // Show "Last Session" for recent games (within a week)
  if (daysAgo >= 0 && daysAgo <= 7) {
    return 'Last Session';
  }

  // For older sessions, show the date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
