import { INITIAL_TEAMS } from "../../constants";

// Helper function to calculate playable matches
export const calculatePlayableMatches = (matches, attendingPlayerIds) => {
  const attendingSet = new Set(attendingPlayerIds);

  return matches
    .filter(m => !m.winner) // Unplayed matches only
    .filter(m =>
      attendingSet.has(m.pA1) &&
      attendingSet.has(m.pA2) &&
      attendingSet.has(m.pB1) &&
      attendingSet.has(m.pB2)
    )
    .sort((a, b) => a.id - b.id);
};

// Helper function to calculate missing player impact
export const calculateMissingPlayerImpact = (matches, attendingPlayerIds, getPlayerName) => {
  const attendingSet = new Set(attendingPlayerIds);
  const unplayedMatches = matches.filter(m => !m.winner);

  const playerImpact = {};

  unplayedMatches.forEach(match => {
    const requiredPlayers = [match.pA1, match.pA2, match.pB1, match.pB2];
    const missingPlayers = requiredPlayers.filter(p => !attendingSet.has(p));

    // Only consider if 1-2 players missing (realistic to recruit)
    if (missingPlayers.length > 0 && missingPlayers.length <= 2) {
      missingPlayers.forEach(playerId => {
        if (!playerImpact[playerId]) {
          // Find player's team
          const team = INITIAL_TEAMS.find(t => t.players.includes(playerId));

          playerImpact[playerId] = {
            playerId,
            playerName: getPlayerName(playerId, true),
            team: team || null,
            matchCount: 0,
            matches: []
          };
        }
        playerImpact[playerId].matchCount++;
        playerImpact[playerId].matches.push(match.id);
      });
    }
  });

  return Object.values(playerImpact)
    .sort((a, b) => b.matchCount - a.matchCount)
    .slice(0, 5);
};

export { INITIAL_TEAMS };
