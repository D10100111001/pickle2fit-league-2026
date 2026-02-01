import { Calendar, Activity, Crown, ChevronRight } from 'lucide-react';
import { usePlayers } from '../providers';
import { Badge, Card } from '../common';
import { Match, Team } from '../../types';

interface DashboardProps {
  standings: Array<{
    id: string;
    name: string;
    wins: number;
    losses: number;
    played: number;
    flexUsed: number;
  }>;
  matches: Match[];
  teams: Team[];
  onMatchClick: (match: Match) => void;
  onViewAllMatches: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ standings, matches, teams, onMatchClick, onViewAllMatches }) => {
  const { getPlayerName } = usePlayers();

  // Sort upcoming matches by date (matches with dates first, then by date, then by ID)
  const upcomingMatches = matches
    .filter(m => !m.winner)
    .sort((a, b) => {
      if (a.scheduledDate && !b.scheduledDate) return -1;
      if (!a.scheduledDate && b.scheduledDate) return 1;
      if (a.scheduledDate && b.scheduledDate) {
        return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
      }
      return a.id - b.id;
    })
    .slice(0, 3);

  // Sort recent matches by reported date (most recent first), fallback to ID
  const recentMatches = matches
    .filter(m => m.winner && m.score) // Only show matches with valid results
    .sort((a, b) => {
      if (a.reportedDate && b.reportedDate) {
        return new Date(b.reportedDate).getTime() - new Date(a.reportedDate).getTime();
      }
      return b.id - a.id;
    })
    .slice(0, 3);

  // Helper to get team name from ID
  const getTeamName = (teamId: string): string => teams.find(t => t.id === teamId)?.name || teamId;

  // Helper to format date with time in local timezone
  const formatDate = (dateStr: string): string | null => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Reset time parts for comparison
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    // Format time in local timezone
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: date.getMinutes() !== 0 ? '2-digit' : undefined,
      hour12: true
    });

    if (compareDate.getTime() === today.getTime()) return `Today at ${timeStr}`;
    if (compareDate.getTime() === tomorrow.getTime()) return `Tomorrow at ${timeStr}`;

    // For other dates, show date and time
    const dateOnlyStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${dateOnlyStr} at ${timeStr}`;
  };

  // Calculate top team (only if games have been played)
  const topTeam = standings.length > 0 && standings[0].played > 0 ? standings[0] : null;

  return (
    <div className="space-y-6">
      {/* Hero Section with Team Logos */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <Badge className="bg-white/20 text-white backdrop-blur-sm mb-3 inline-block">{topTeam ? 'Current Leader' : 'League 2026'}</Badge>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-1">
                {topTeam ? topTeam.name : 'Pickle2Fit League'}
              </h2>
              <p className="text-white/80 font-medium">
                {topTeam ? `${topTeam.wins} Wins • ${(topTeam.wins / (topTeam.played || 1) * 100).toFixed(0)}% WR` : '4 Teams Battle for Glory'}
              </p>
            </div>

            {/* Team Logos Grid */}
            <div className="grid grid-cols-4 gap-3 md:gap-4">
              {teams.map(team => (
                <div
                  key={team.id}
                  className={`relative group ${team.id === topTeam?.id && topTeam?.played > 0 ? 'scale-110' : ''}`}
                  title={team.name}
                >
                  {team.logo && (
                    <>
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-white p-2 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
                        <img
                          src={team.logo}
                          alt={team.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      {team.id === topTeam?.id && topTeam?.played > 0 && (
                        <div className="absolute -top-2 -right-2 animate-bounce">
                          <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full p-1.5 shadow-lg ring-2 ring-yellow-300/50">
                            <Crown className="w-4 h-4 text-yellow-900" fill="currentColor" />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Standings Table */}
      <Card>
        <div className="p-4 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-lime-400" /> Standings
          </h3>
          <span className="text-xs text-slate-400">Top 4 to Playoffs</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-slate-400 font-medium uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3 text-center">W%</th>
                <th className="px-4 py-3 text-center">W</th>
                <th className="px-4 py-3 text-center">L</th>
                <th className="px-4 py-3 text-center">Flex</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {standings.map((team, idx) => {
                const winRate = team.played > 0 ? (team.wins / team.played * 100).toFixed(0) : '0';
                return (
                  <tr key={team.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-500">#{idx + 1}</td>
                    <td className="px-4 py-3 font-semibold text-white">{team.name}</td>
                    <td className="px-4 py-3 text-center text-lime-400 font-bold">{winRate}%</td>
                    <td className="px-4 py-3 text-center text-slate-400">{team.wins}</td>
                    <td className="px-4 py-3 text-center text-slate-400">{team.losses}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 rounded ${team.flexUsed >= 8 ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'}`}>
                        {team.flexUsed}/10
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Upcoming */}
        <Card>
          <div className="p-4 border-b border-white/5">
             <h3 className="font-bold text-slate-200">Upcoming Matches</h3>
          </div>
          <div className="divide-y divide-white/5">
            {upcomingMatches.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">No matches scheduled</div>
            ) : upcomingMatches.map(m => (
              <div key={m.id} className="p-4 hover:bg-white/5 transition-colors">
                 <div className="flex items-start gap-3">
                   <div className="text-xs text-slate-500 font-mono">#{m.id}</div>
                   <div className="flex-1 space-y-2">
                      {m.scheduledDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-lime-400" />
                          <span className="text-xs font-medium text-lime-400">{formatDate(m.scheduledDate)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="font-semibold text-sm">{getTeamName(m.teamA)}</span>
                        <span className="text-xs text-slate-400">vs</span>
                        <span className="font-semibold text-sm text-right">{getTeamName(m.teamB)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                         <span
                           className="truncate w-24"
                           title={`${getPlayerName(m.pA1)} / ${getPlayerName(m.pA2, true)}`}
                         >
                           {getPlayerName(m.pA1)}/{getPlayerName(m.pA2)}
                         </span>
                         <span
                           className="truncate w-24 text-right"
                           title={`${getPlayerName(m.pB1)} / ${getPlayerName(m.pB2, true)}`}
                         >
                           {getPlayerName(m.pB1)}/{getPlayerName(m.pB2)}
                         </span>
                      </div>
                   </div>
                 </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Results */}
        <Card>
          <div className="p-4 border-b border-white/5 flex justify-between items-center">
             <h3 className="font-bold text-slate-200">Recent Results</h3>
             {recentMatches.length > 0 && (
               <button
                 onClick={onViewAllMatches}
                 className="text-xs text-lime-400 hover:text-lime-300 transition-colors flex items-center gap-1"
               >
                 View All
                 <ChevronRight className="w-3 h-3" />
               </button>
             )}
          </div>
          <div className="divide-y divide-white/5">
             {recentMatches.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">No games played yet</div>
            ) : recentMatches.map(m => (
              <div
                key={m.id}
                onClick={() => onMatchClick(m)}
                className="p-4 hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className="text-xs text-slate-500 font-mono">#{m.id}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <div className={`font-semibold text-sm ${m.winner === m.teamA ? 'text-lime-400' : 'text-slate-400'}`}>
                            {getTeamName(m.teamA)}
                          </div>
                          {m.isFlexA && <Badge className="bg-pink-500/20 text-pink-400 text-[9px] px-1 py-0">Flex</Badge>}
                        </div>
                        <div className="text-xs text-slate-500">
                          {getPlayerName(m.pA1)}/{getPlayerName(m.pA2)}
                        </div>
                      </div>
                      <div className="text-center px-2">
                        <div className="font-mono font-bold text-base text-white">{m.score}</div>
                        {m.games && m.games.length > 0 && (
                          <div className="text-[9px] text-slate-600 space-x-1">
                            {m.games.filter(g => g.scoreA && g.scoreB).map((game, i) => (
                              <span key={i}>{game.scoreA}-{game.scoreB}</span>
                            ))}
                          </div>
                        )}
                        {m.reportedDate && (
                          <div className="text-[9px] text-slate-600 mt-0.5">
                            {formatDate(m.reportedDate)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          {m.isFlexB && <Badge className="bg-pink-500/20 text-pink-400 text-[9px] px-1 py-0">Flex</Badge>}
                          <div className={`font-semibold text-sm ${m.winner === m.teamB ? 'text-lime-400' : 'text-slate-400'}`}>
                            {getTeamName(m.teamB)}
                          </div>
                        </div>
                        <div className="text-xs text-slate-500">
                          {getPlayerName(m.pB1)}/{getPlayerName(m.pB2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
