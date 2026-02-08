import { Award, Trophy, TrendingUp, Zap, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { usePlayers } from '../providers';
import { Badge, Card } from '../common';
import { Match, Team } from '../../types';
import { useState } from 'react';
import { getMatchWinner, isTeamAFlex, isTeamBFlex } from '../../utils/matchUtils';

export interface PlayerStats {
  playerId: string;
  name: string;
  wins: number;
  losses: number;
  played: number;
  flexGames: number;
  winRate: number;
  pointDifferential: number;
  avgPointDifferential: number;
}

type SortField = 'winRate' | 'wins' | 'losses' | 'played' | 'flexGames' | 'name' | 'pointDifferential' | 'avgPointDifferential';
type SortDirection = 'asc' | 'desc';

interface PlayerStandingsProps {
  matches: Match[];
  teams: Team[];
  limit?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
  enableSorting?: boolean;
}

const PlayerStandings: React.FC<PlayerStandingsProps> = ({
  matches,
  teams,
  limit,
  showViewAll = false,
  onViewAll,
  enableSorting = false
}) => {
  const { getPlayerName } = usePlayers();
  const [sortField, setSortField] = useState<SortField>('winRate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Helper function to find a player's team
  const getPlayerTeam = (playerId: string): Team | undefined => {
    return teams.find(team => team.players.includes(playerId));
  };

  // Calculate player statistics
  const calculatePlayerStats = (): PlayerStats[] => {
    const stats: { [key: string]: Omit<PlayerStats, 'winRate' | 'name' | 'avgPointDifferential'> } = {};

    // Initialize stats for all players
    teams.forEach(team => {
      team.players.forEach(playerId => {
        if (!stats[playerId]) {
          stats[playerId] = {
            playerId,
            wins: 0,
            losses: 0,
            played: 0,
            flexGames: 0,
            pointDifferential: 0,
          };
        }
      });
    });

    // Process completed matches
    matches.forEach(match => {
      const winner = getMatchWinner(match);
      if (!winner) return; // Skip unplayed matches

      const teamAPlayers = [match.pA1, match.pA2];
      const teamBPlayers = [match.pB1, match.pB2];
      const allPlayers = [...teamAPlayers, ...teamBPlayers];

      // Calculate point differential from games
      let teamAPoints = 0;
      let teamBPoints = 0;

      if (match.games && match.games.length > 0) {
        match.games.forEach(game => {
          const scoreA = typeof game.scoreA === 'number' ? game.scoreA : parseInt(String(game.scoreA) || '0');
          const scoreB = typeof game.scoreB === 'number' ? game.scoreB : parseInt(String(game.scoreB) || '0');
          teamAPoints += scoreA;
          teamBPoints += scoreB;
        });
      }

      allPlayers.forEach(playerId => {
        if (!stats[playerId]) {
          stats[playerId] = {
            playerId,
            wins: 0,
            losses: 0,
            played: 0,
            flexGames: 0,
            pointDifferential: 0,
          };
        }

        stats[playerId].played += 1;

        // Check if player won
        const playerInTeamA = teamAPlayers.includes(playerId);
        const playerInTeamB = teamBPlayers.includes(playerId);

        if ((playerInTeamA && winner === match.teamA) ||
            (playerInTeamB && winner === match.teamB)) {
          stats[playerId].wins += 1;
        } else {
          stats[playerId].losses += 1;
        }

        // Calculate point differential for the player
        if (playerInTeamA) {
          stats[playerId].pointDifferential += (teamAPoints - teamBPoints);
        } else if (playerInTeamB) {
          stats[playerId].pointDifferential += (teamBPoints - teamAPoints);
        }

        // Check if this was a flex game for the player
        if (playerInTeamA && isTeamAFlex(match)) {
          // Check if player was a flex (not original player)
          const isOriginalA1 = match.originalPA1 === playerId;
          const isOriginalA2 = match.originalPA2 === playerId;
          if (!isOriginalA1 && !isOriginalA2) {
            stats[playerId].flexGames += 1;
          }
        }
        if (playerInTeamB && isTeamBFlex(match)) {
          // Check if player was a flex (not original player)
          const isOriginalB1 = match.originalPB1 === playerId;
          const isOriginalB2 = match.originalPB2 === playerId;
          if (!isOriginalB1 && !isOriginalB2) {
            stats[playerId].flexGames += 1;
          }
        }
      });
    });

    // Convert to array and add calculated fields
    const playerStats: PlayerStats[] = Object.values(stats).map(stat => ({
      ...stat,
      name: getPlayerName(stat.playerId),
      winRate: stat.played > 0 ? (stat.wins / stat.played) * 100 : 0,
      avgPointDifferential: stat.played > 0 ? stat.pointDifferential / stat.played : 0,
    }));

    // Sort by win rate (desc), then by average point differential (desc), then by total point differential (desc), then by total wins (desc)
    return playerStats.sort((a, b) => {
      // Only consider players who have played games
      if (a.played === 0 && b.played === 0) return 0;
      if (a.played === 0) return 1;
      if (b.played === 0) return -1;

      // Primary: Win rate
      if (Math.abs(b.winRate - a.winRate) > 0.01) return b.winRate - a.winRate;

      // Secondary: Average point differential (performance per game)
      if (Math.abs(b.avgPointDifferential - a.avgPointDifferential) > 0.01) {
        return b.avgPointDifferential - a.avgPointDifferential;
      }

      // Tertiary: Total point differential
      if (b.pointDifferential !== a.pointDifferential) {
        return b.pointDifferential - a.pointDifferential;
      }

      // Final tiebreaker: Total wins
      return b.wins - a.wins;
    });
  };

  const handleSort = (field: SortField) => {
    if (!enableSorting) return;

    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field - default to descending for numbers, ascending for names
      setSortField(field);
      setSortDirection(field === 'name' ? 'asc' : 'desc');
    }
  };

  const sortPlayerStats = (stats: PlayerStats[]): PlayerStats[] => {
    if (!enableSorting) return stats;

    return [...stats].sort((a, b) => {
      let aVal: string | number = a[sortField];
      let bVal: string | number = b[sortField];

      // Handle string comparison for names
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const comparison = aVal.localeCompare(bVal);
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      // Handle number comparison
      const comparison = (aVal as number) - (bVal as number);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const allPlayerStandings = calculatePlayerStats();
  const sortedStandings = sortPlayerStats(allPlayerStandings);
  const playerStandings = limit ? sortedStandings.slice(0, limit) : sortedStandings;
  const mvpPlayer = allPlayerStandings.find(p => p.played > 0) || null;

  const getSortIcon = (field: SortField) => {
    if (!enableSorting) return null;

    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="w-3.5 h-3.5 text-lime-400" />
      : <ArrowDown className="w-3.5 h-3.5 text-lime-400" />;
  };

  return (
    <div className="space-y-4">
      {/* MVP Section */}
      {mvpPlayer && (
        <Card>
          <div className="relative overflow-hidden bg-gradient-to-br from-yellow-600/20 via-amber-600/20 to-orange-600/20 p-6 border-b border-yellow-500/20">
            <div className="absolute top-0 right-0 p-24 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl p-3 shadow-lg shadow-yellow-500/20">
                  <Trophy className="w-8 h-8 text-yellow-950" fill="currentColor" />
                </div>
                <div>
                  <Badge className="bg-yellow-500/20 text-yellow-400 mb-2 inline-block">
                    <Award className="w-3 h-3 inline mr-1" />
                    MVP Leader
                  </Badge>
                  <div className="flex items-center gap-2 mb-1">
                    {(() => {
                      const mvpTeam = getPlayerTeam(mvpPlayer.playerId);
                      return mvpTeam ? (
                        <img
                          src={mvpTeam.logo}
                          alt={mvpTeam.name}
                          className="w-7 h-7 object-contain"
                        />
                      ) : null;
                    })()}
                    <h3 className="text-2xl font-black text-white">{mvpPlayer.name}</h3>
                  </div>
                  <p className="text-sm text-yellow-200/80 font-medium">
                    {mvpPlayer.wins} Wins • {mvpPlayer.winRate.toFixed(0)}% Win Rate • {mvpPlayer.pointDifferential > 0 ? '+' : ''}{mvpPlayer.pointDifferential} Point Diff
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex flex-col items-end gap-2">
                <div className="flex items-center gap-3 text-sm">
                  <div className="text-right">
                    <div className="text-yellow-400 font-bold text-xl">{mvpPlayer.played}</div>
                    <div className="text-yellow-200/60 text-xs">Games</div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400 font-bold text-xl">
                      {mvpPlayer.pointDifferential > 0 ? '+' : ''}{mvpPlayer.pointDifferential}
                    </div>
                    <div className="text-emerald-200/60 text-xs">+/−</div>
                  </div>
                  {mvpPlayer.flexGames > 0 && (
                    <div className="text-right">
                      <div className="text-pink-400 font-bold text-xl flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        {mvpPlayer.flexGames}
                      </div>
                      <div className="text-pink-200/60 text-xs">Flex</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Player Standings Table */}
      <Card>
        <div className="p-4 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-lime-400" /> Player Standings
          </h3>
          <div className="flex items-center gap-3">
            {showViewAll && onViewAll && (
              <button
                onClick={onViewAll}
                className="text-xs text-lime-400 hover:text-lime-300 transition-colors flex items-center gap-1"
              >
                View All
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
            <span className="text-xs text-slate-400">
              {limit ? `Top ${playerStandings.length}` : `${playerStandings.length} Players`}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-slate-400 font-medium uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th
                  className={`px-4 py-3 ${enableSorting ? 'cursor-pointer hover:text-lime-400 transition-colors' : ''}`}
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1.5">
                    Player
                    {getSortIcon('name')}
                  </div>
                </th>
                <th
                  className={`px-4 py-3 text-center ${enableSorting ? 'cursor-pointer hover:text-lime-400 transition-colors' : ''}`}
                  onClick={() => handleSort('winRate')}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    W%
                    {getSortIcon('winRate')}
                  </div>
                </th>
                <th
                  className={`px-4 py-3 text-center ${enableSorting ? 'cursor-pointer hover:text-lime-400 transition-colors' : ''}`}
                  onClick={() => handleSort('wins')}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    W
                    {getSortIcon('wins')}
                  </div>
                </th>
                <th
                  className={`px-4 py-3 text-center ${enableSorting ? 'cursor-pointer hover:text-lime-400 transition-colors' : ''}`}
                  onClick={() => handleSort('losses')}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    L
                    {getSortIcon('losses')}
                  </div>
                </th>
                <th
                  className={`px-4 py-3 text-center ${enableSorting ? 'cursor-pointer hover:text-lime-400 transition-colors' : ''}`}
                  onClick={() => handleSort('played')}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    GP
                    {getSortIcon('played')}
                  </div>
                </th>
                <th
                  className={`px-4 py-3 text-center ${enableSorting ? 'cursor-pointer hover:text-lime-400 transition-colors' : ''}`}
                  onClick={() => handleSort('pointDifferential')}
                  title="Point Differential"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    +/−
                    {getSortIcon('pointDifferential')}
                  </div>
                </th>
                <th
                  className={`px-4 py-3 text-center ${enableSorting ? 'cursor-pointer hover:text-lime-400 transition-colors' : ''}`}
                  onClick={() => handleSort('avgPointDifferential')}
                  title="Average Point Differential per Game"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    Avg +/−
                    {getSortIcon('avgPointDifferential')}
                  </div>
                </th>
                <th
                  className={`px-4 py-3 text-center ${enableSorting ? 'cursor-pointer hover:text-lime-400 transition-colors' : ''}`}
                  onClick={() => handleSort('flexGames')}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    Flex
                    {getSortIcon('flexGames')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {playerStandings.map((player, idx) => {
                const isMVP = idx === 0 && player.played > 0;
                return (
                  <tr
                    key={player.playerId}
                    className={`hover:bg-white/5 transition-colors ${isMVP ? 'bg-yellow-500/5' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-500">#{idx + 1}</span>
                        {isMVP && (
                          <Trophy className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const playerTeam = getPlayerTeam(player.playerId);
                          return playerTeam ? (
                            <img
                              src={playerTeam.logo}
                              alt={playerTeam.name}
                              className="w-6 h-6 object-contain"
                            />
                          ) : null;
                        })()}
                        <span className={`font-semibold ${isMVP ? 'text-yellow-400' : 'text-white'}`}>
                          {player.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold ${player.played > 0 ? 'text-lime-400' : 'text-slate-600'}`}>
                        {player.played > 0 ? `${player.winRate.toFixed(0)}%` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-400">{player.wins || '—'}</td>
                    <td className="px-4 py-3 text-center text-slate-400">{player.losses || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-medium ${player.played > 0 ? 'text-white' : 'text-slate-600'}`}>
                        {player.played || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {player.played > 0 ? (
                        <span className={`font-bold ${
                          player.pointDifferential > 0
                            ? 'text-emerald-400'
                            : player.pointDifferential < 0
                            ? 'text-red-400'
                            : 'text-slate-400'
                        }`}>
                          {player.pointDifferential > 0 ? '+' : ''}{player.pointDifferential}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {player.played > 0 ? (
                        <span className={`font-medium text-sm ${
                          player.avgPointDifferential > 0
                            ? 'text-emerald-400'
                            : player.avgPointDifferential < 0
                            ? 'text-red-400'
                            : 'text-slate-400'
                        }`}>
                          {player.avgPointDifferential > 0 ? '+' : ''}{player.avgPointDifferential.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {player.flexGames > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-pink-500/20 text-pink-400 font-medium">
                          <Zap className="w-3 h-3" />
                          {player.flexGames}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default PlayerStandings;
