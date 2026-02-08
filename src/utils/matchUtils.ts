import { Match } from '../types';

/**
 * Shared utility functions for computing match properties.
 * These values should NEVER be stored in the database - they are derived from actual data.
 */

/**
 * Compute the match score from games (e.g., "2-1" for best of 3).
 * Returns empty string if no games have been played.
 */
export function getMatchScore(match: Match): string {
  if (!match.games || match.games.length === 0) {
    return '';
  }

  const validGames = match.games.filter(g => g.scoreA && g.scoreB);
  if (validGames.length === 0) {
    return '';
  }

  let teamAWins = 0;
  let teamBWins = 0;

  validGames.forEach(game => {
    const scoreA = parseInt(String(game.scoreA));
    const scoreB = parseInt(String(game.scoreB));
    if (scoreA > scoreB) {
      teamAWins++;
    } else if (scoreB > scoreA) {
      teamBWins++;
    }
  });

  return `${teamAWins}-${teamBWins}`;
}

/**
 * Compute the match winner from games (best of 3).
 * Returns null if no winner can be determined.
 */
export function getMatchWinner(match: Match): string | null {
  if (!match.games || match.games.length === 0) {
    return null;
  }

  const validGames = match.games.filter(g => g.scoreA && g.scoreB);
  if (validGames.length === 0) {
    return null;
  }

  let teamAWins = 0;
  let teamBWins = 0;

  validGames.forEach(game => {
    const scoreA = parseInt(String(game.scoreA));
    const scoreB = parseInt(String(game.scoreB));
    if (scoreA > scoreB) {
      teamAWins++;
    } else if (scoreB > scoreA) {
      teamBWins++;
    }
  });

  // No winner if tied or no games completed
  if (teamAWins === teamBWins) {
    return null;
  }

  return teamAWins > teamBWins ? match.teamA : match.teamB;
}

/**
 * Check if Team A used their flex by comparing current players to original schedule.
 * Returns true if either player position changed from the original.
 */
export function isTeamAFlex(match: Match): boolean {
  return match.pA1 !== match.originalPA1 || match.pA2 !== match.originalPA2;
}

/**
 * Check if Team B used their flex by comparing current players to original schedule.
 * Returns true if either player position changed from the original.
 */
export function isTeamBFlex(match: Match): boolean {
  return match.pB1 !== match.originalPB1 || match.pB2 !== match.originalPB2;
}

/**
 * Get both flex statuses in a single call.
 * Useful when you need to check both teams.
 */
export function getFlexStatus(match: Match): { teamA: boolean; teamB: boolean } {
  return {
    teamA: isTeamAFlex(match),
    teamB: isTeamBFlex(match),
  };
}
