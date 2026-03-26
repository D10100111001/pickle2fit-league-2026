import { Flame, Target, Users, Shield, Swords, TrendingUp, Zap } from 'lucide-react';
import { usePlayers } from '../providers';
import { Card } from '../common';
import { Match, Team } from '../../types';
import { getMatchWinner, isTeamAFlex, isTeamBFlex } from '../../utils/matchUtils';

interface TeamStatsProps {
  matches: Match[];
  teams: Team[];
}

interface SpotlightData {
  teamId: string;
  teamName: string;
  teamLogo: string;
  value: string;
  subtitle: string;
}

interface TeamAnalytics {
  teamId: string;
  teamName: string;
  teamLogo: string;
  teamColor: string;
  currentStreak: { count: number; type: 'W' | 'L' | null };
  bestStreak: number;
  pointDiff: number;
  avgPointDiff: number;
  sweepRate: number;
  sweepCount: number;
  totalWins: number;
  flexWinRate: number;
  flexWins: number;
  flexTotal: number;
  headToHead: { [opponentId: string]: { wins: number; losses: number } };
}

// Parse a game score to a number
const parseScore = (score: string | number): number =>
  typeof score === 'number' ? score : parseInt(String(score) || '0');

// Get game winners for a match
const getGameWinners = (match: Match): ('A' | 'B')[] => {
  if (!match.games) return [];
  return match.games
    .filter(g => g.scoreA && g.scoreB)
    .map(g => (parseScore(g.scoreA) > parseScore(g.scoreB) ? 'A' : 'B'));
};

const TeamStats: React.FC<TeamStatsProps> = ({ matches, teams }) => {
  const { getPlayerName } = usePlayers();

  const completedMatches = matches.filter(m => getMatchWinner(m));

  if (completedMatches.length === 0) return null;

  const getTeam = (id: string) => teams.find(t => t.id === id);

  // ─── Compute all team analytics ───
  const computeAnalytics = (): TeamAnalytics[] => {
    const analytics: { [teamId: string]: TeamAnalytics } = {};

    teams.forEach(t => {
      analytics[t.id] = {
        teamId: t.id,
        teamName: t.name,
        teamLogo: t.logo,
        teamColor: t.color,
        currentStreak: { count: 0, type: null },
        bestStreak: 0,
        pointDiff: 0,
        avgPointDiff: 0,
        sweepRate: 0,
        sweepCount: 0,
        totalWins: 0,
        flexWinRate: 0,
        flexWins: 0,
        flexTotal: 0,
        headToHead: {},
      };
      // Init H2H
      teams.forEach(opp => {
        if (opp.id !== t.id) {
          analytics[t.id].headToHead[opp.id] = { wins: 0, losses: 0 };
        }
      });
    });

    // Sort completed matches by reported date for streak calculation
    const sortedMatches = [...completedMatches].sort((a, b) => {
      if (a.reportedDate && b.reportedDate) {
        return new Date(a.reportedDate).getTime() - new Date(b.reportedDate).getTime();
      }
      return a.id - b.id;
    });

    // Track match history per team for streaks
    const teamMatchHistory: { [teamId: string]: ('W' | 'L')[] } = {};
    teams.forEach(t => { teamMatchHistory[t.id] = []; });

    sortedMatches.forEach(match => {
      const winner = getMatchWinner(match)!;
      const loser = winner === match.teamA ? match.teamB : match.teamA;
      const gameWinners = getGameWinners(match);

      // Points
      let teamAPoints = 0, teamBPoints = 0;
      match.games?.forEach(g => {
        teamAPoints += parseScore(g.scoreA);
        teamBPoints += parseScore(g.scoreB);
      });

      // Winner stats
      analytics[winner].totalWins++;
      analytics[winner].headToHead[loser].wins++;
      analytics[loser].headToHead[winner].losses++;

      // Point differential
      if (winner === match.teamA) {
        analytics[match.teamA].pointDiff += (teamAPoints - teamBPoints);
        analytics[match.teamB].pointDiff += (teamBPoints - teamAPoints);
      } else {
        analytics[match.teamB].pointDiff += (teamBPoints - teamAPoints);
        analytics[match.teamA].pointDiff += (teamAPoints - teamBPoints);
      }

      // Sweep detection (2-0 win)
      const aGameWins = gameWinners.filter(w => w === 'A').length;
      const bGameWins = gameWinners.filter(w => w === 'B').length;
      if (winner === match.teamA && aGameWins === 2 && bGameWins === 0) {
        analytics[winner].sweepCount++;
      } else if (winner === match.teamB && bGameWins === 2 && aGameWins === 0) {
        analytics[winner].sweepCount++;
      }

      // Flex tracking
      const isFlexA = isTeamAFlex(match);
      const isFlexB = isTeamBFlex(match);
      if (isFlexA) {
        analytics[match.teamA].flexTotal++;
        if (winner === match.teamA) analytics[match.teamA].flexWins++;
      }
      if (isFlexB) {
        analytics[match.teamB].flexTotal++;
        if (winner === match.teamB) analytics[match.teamB].flexWins++;
      }

      // Streak tracking
      teamMatchHistory[winner].push('W');
      teamMatchHistory[loser].push('L');
    });

    // Calculate streaks and averages
    Object.keys(analytics).forEach(teamId => {
      const history = teamMatchHistory[teamId];
      const played = history.length;
      if (played === 0) return;

      analytics[teamId].avgPointDiff = analytics[teamId].pointDiff / played;
      analytics[teamId].sweepRate = analytics[teamId].totalWins > 0
        ? (analytics[teamId].sweepCount / analytics[teamId].totalWins) * 100
        : 0;
      analytics[teamId].flexWinRate = analytics[teamId].flexTotal > 0
        ? (analytics[teamId].flexWins / analytics[teamId].flexTotal) * 100
        : 0;

      // Current streak (from end)
      if (history.length > 0) {
        const lastResult = history[history.length - 1];
        let streak = 0;
        for (let i = history.length - 1; i >= 0; i--) {
          if (history[i] === lastResult) streak++;
          else break;
        }
        analytics[teamId].currentStreak = { count: streak, type: lastResult };
      }

      // Best win streak
      let best = 0, current = 0;
      history.forEach(r => {
        if (r === 'W') { current++; best = Math.max(best, current); }
        else { current = 0; }
      });
      analytics[teamId].bestStreak = best;
    });

    return Object.values(analytics);
  };

  // ─── Compute spotlight stats ───
  const computeSpotlights = (): {
    clutchKings: SpotlightData | null;
    pointMachines: SpotlightData | null;
    dynastyDuo: SpotlightData | null;
    comebackKids: SpotlightData | null;
  } => {
    // CLUTCH KINGS — Best Game-3 win rate
    const game3Stats: { [teamId: string]: { wins: number; total: number } } = {};
    teams.forEach(t => { game3Stats[t.id] = { wins: 0, total: 0 }; });

    completedMatches.forEach(match => {
      const gameWinners = getGameWinners(match);
      if (gameWinners.length === 3) {
        // This match went to game 3
        game3Stats[match.teamA].total++;
        game3Stats[match.teamB].total++;
        const winner = getMatchWinner(match)!;
        game3Stats[winner].wins++;
      }
    });

    let clutchKings: SpotlightData | null = null;
    let bestClutch = -1;
    Object.entries(game3Stats).forEach(([teamId, stats]) => {
      if (stats.total > 0) {
        const rate = stats.wins / stats.total;
        if (rate > bestClutch || (rate === bestClutch && stats.wins > (clutchKings ? game3Stats[clutchKings.teamId]?.wins || 0 : 0))) {
          bestClutch = rate;
          const team = getTeam(teamId)!;
          clutchKings = {
            teamId,
            teamName: team.name,
            teamLogo: team.logo,
            value: `${(rate * 100).toFixed(0)}%`,
            subtitle: `${stats.wins}/${stats.total} Game 3s won`,
          };
        }
      }
    });

    // POINT MACHINES — Highest avg points scored per game
    const pointStats: { [teamId: string]: { totalPoints: number; totalGames: number } } = {};
    teams.forEach(t => { pointStats[t.id] = { totalPoints: 0, totalGames: 0 }; });

    completedMatches.forEach(match => {
      match.games?.filter(g => g.scoreA && g.scoreB).forEach(game => {
        pointStats[match.teamA].totalPoints += parseScore(game.scoreA);
        pointStats[match.teamA].totalGames++;
        pointStats[match.teamB].totalPoints += parseScore(game.scoreB);
        pointStats[match.teamB].totalGames++;
      });
    });

    let pointMachines: SpotlightData | null = null;
    let bestAvg = -1;
    Object.entries(pointStats).forEach(([teamId, stats]) => {
      if (stats.totalGames > 0) {
        const avg = stats.totalPoints / stats.totalGames;
        if (avg > bestAvg) {
          bestAvg = avg;
          const team = getTeam(teamId)!;
          pointMachines = {
            teamId,
            teamName: team.name,
            teamLogo: team.logo,
            value: avg.toFixed(1),
            subtitle: `avg pts/game (${stats.totalPoints} total)`,
          };
        }
      }
    });

    // DYNASTY DUO — Best player pairing by win rate (min 2 matches)
    const pairStats: { [key: string]: { teamId: string; p1: string; p2: string; wins: number; played: number } } = {};

    completedMatches.forEach(match => {
      const winner = getMatchWinner(match)!;
      // Team A pairing
      const keyA = [match.pA1, match.pA2].sort().join('|');
      if (!pairStats[keyA]) pairStats[keyA] = { teamId: match.teamA, p1: match.pA1, p2: match.pA2, wins: 0, played: 0 };
      pairStats[keyA].played++;
      if (winner === match.teamA) pairStats[keyA].wins++;

      // Team B pairing
      const keyB = [match.pB1, match.pB2].sort().join('|');
      if (!pairStats[keyB]) pairStats[keyB] = { teamId: match.teamB, p1: match.pB1, p2: match.pB2, wins: 0, played: 0 };
      pairStats[keyB].played++;
      if (winner === match.teamB) pairStats[keyB].wins++;
    });

    let dynastyDuo: SpotlightData | null = null;
    let bestPairRate = -1;
    let bestPairWins = -1;
    Object.values(pairStats).forEach(pair => {
      if (pair.played >= 2) {
        const rate = pair.wins / pair.played;
        if (rate > bestPairRate || (rate === bestPairRate && pair.wins > bestPairWins)) {
          bestPairRate = rate;
          bestPairWins = pair.wins;
          const team = getTeam(pair.teamId)!;
          dynastyDuo = {
            teamId: pair.teamId,
            teamName: team.name,
            teamLogo: team.logo,
            value: `${(rate * 100).toFixed(0)}%`,
            subtitle: `${getPlayerName(pair.p1)} & ${getPlayerName(pair.p2)} (${pair.wins}-${pair.played - pair.wins})`,
          };
        }
      }
    });

    // COMEBACK KIDS — Most wins after losing Game 1
    const comebackStats: { [teamId: string]: { comebacks: number; game1Losses: number } } = {};
    teams.forEach(t => { comebackStats[t.id] = { comebacks: 0, game1Losses: 0 }; });

    completedMatches.forEach(match => {
      const gameWinners = getGameWinners(match);
      if (gameWinners.length < 2) return;
      const winner = getMatchWinner(match)!;

      // Team A lost game 1
      if (gameWinners[0] === 'B') {
        comebackStats[match.teamA].game1Losses++;
        if (winner === match.teamA) comebackStats[match.teamA].comebacks++;
      }
      // Team B lost game 1
      if (gameWinners[0] === 'A') {
        comebackStats[match.teamB].game1Losses++;
        if (winner === match.teamB) comebackStats[match.teamB].comebacks++;
      }
    });

    let comebackKids: SpotlightData | null = null;
    let bestComebacks = -1;
    Object.entries(comebackStats).forEach(([teamId, stats]) => {
      if (stats.comebacks > bestComebacks) {
        bestComebacks = stats.comebacks;
        const team = getTeam(teamId)!;
        comebackKids = {
          teamId,
          teamName: team.name,
          teamLogo: team.logo,
          value: `${stats.comebacks}`,
          subtitle: stats.game1Losses > 0
            ? `${stats.comebacks}/${stats.game1Losses} comebacks after losing G1`
            : 'No Game 1 losses yet',
        };
      }
    });

    return { clutchKings, pointMachines, dynastyDuo, comebackKids };
  };

  const analytics = computeAnalytics();
  const spotlights = computeSpotlights();

  const spotlightCards = [
    {
      title: 'Clutch Kings',
      icon: <Flame className="w-5 h-5" />,
      data: spotlights.clutchKings,
      gradient: 'from-orange-500/20 to-red-500/20',
      borderColor: 'border-orange-500/20',
      accentColor: 'text-orange-400',
      bgAccent: 'bg-gradient-to-br from-orange-400 to-red-500',
    },
    {
      title: 'Point Machines',
      icon: <Target className="w-5 h-5" />,
      data: spotlights.pointMachines,
      gradient: 'from-emerald-500/20 to-teal-500/20',
      borderColor: 'border-emerald-500/20',
      accentColor: 'text-emerald-400',
      bgAccent: 'bg-gradient-to-br from-emerald-400 to-teal-500',
    },
    {
      title: 'Dynasty Duo',
      icon: <Users className="w-5 h-5" />,
      data: spotlights.dynastyDuo,
      gradient: 'from-violet-500/20 to-purple-500/20',
      borderColor: 'border-violet-500/20',
      accentColor: 'text-violet-400',
      bgAccent: 'bg-gradient-to-br from-violet-400 to-purple-500',
    },
    {
      title: 'Comeback Kids',
      icon: <Shield className="w-5 h-5" />,
      data: spotlights.comebackKids,
      gradient: 'from-cyan-500/20 to-blue-500/20',
      borderColor: 'border-cyan-500/20',
      accentColor: 'text-cyan-400',
      bgAccent: 'bg-gradient-to-br from-cyan-400 to-blue-500',
    },
  ];

  return (
    <div className="space-y-4">
      {/* ─── Team Spotlight Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {spotlightCards.map(card => {
          if (!card.data) return null;
          return (
            <Card key={card.title} className={`border ${card.borderColor}`}>
              <div className={`relative overflow-hidden bg-gradient-to-br ${card.gradient} p-4`}>
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`${card.bgAccent} rounded-lg p-1.5 shadow-lg`}>
                      <span className="text-white">{card.icon}</span>
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${card.accentColor}`}>
                      {card.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <img
                      src={card.data.teamLogo}
                      alt={card.data.teamName}
                      className="w-6 h-6 object-contain"
                    />
                    <span className="text-white font-bold text-sm truncate">{card.data.teamName}</span>
                  </div>
                  <div className={`text-2xl font-black ${card.accentColor} mb-0.5`}>
                    {card.data.value}
                  </div>
                  <div className="text-[11px] text-slate-400 leading-tight">
                    {card.data.subtitle}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ─── Team Analytics Grid ─── */}
      <Card>
        <div className="p-4 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Swords className="w-5 h-5 text-lime-400" /> Team Analytics
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-slate-400 font-medium uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3 text-center" title="Current Streak">Streak</th>
                <th className="px-4 py-3 text-center" title="Best Win Streak">Best</th>
                <th className="px-4 py-3 text-center" title="Total Point Differential">+/−</th>
                <th className="px-4 py-3 text-center" title="Average Point Differential per Match">Avg +/−</th>
                <th className="px-4 py-3 text-center" title="Percentage of wins that were 2-0 sweeps">Sweep%</th>
                {teams.map(t => (
                  <th key={t.id} className="px-3 py-3 text-center" title={`Record vs ${t.name}`}>
                    <img src={t.logo} alt={t.name} className="w-5 h-5 object-contain mx-auto" />
                  </th>
                ))}
                <th className="px-4 py-3 text-center" title="Win Rate when using Flex players">
                  <span className="flex items-center justify-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-pink-400" /> W%
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {analytics.map(team => (
                <tr key={team.teamId} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img src={team.teamLogo} alt={team.teamName} className="w-6 h-6 object-contain" />
                      <span className="font-semibold text-white text-sm">{team.teamName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {team.currentStreak.type ? (
                      <span className={`font-bold ${team.currentStreak.type === 'W' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {team.currentStreak.count}{team.currentStreak.type}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {team.bestStreak > 0 ? (
                      <span className="font-bold text-yellow-400 flex items-center justify-center gap-0.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {team.bestStreak}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-bold ${
                      team.pointDiff > 0 ? 'text-emerald-400' : team.pointDiff < 0 ? 'text-red-400' : 'text-slate-400'
                    }`}>
                      {team.pointDiff > 0 ? '+' : ''}{team.pointDiff}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-medium text-sm ${
                      team.avgPointDiff > 0 ? 'text-emerald-400' : team.avgPointDiff < 0 ? 'text-red-400' : 'text-slate-400'
                    }`}>
                      {team.avgPointDiff > 0 ? '+' : ''}{team.avgPointDiff.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {team.totalWins > 0 ? (
                      <span className="text-slate-300 font-medium">
                        {team.sweepRate.toFixed(0)}%
                        <span className="text-slate-500 text-xs ml-1">({team.sweepCount})</span>
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  {teams.map(opp => (
                    <td key={opp.id} className="px-3 py-3 text-center">
                      {opp.id === team.teamId ? (
                        <span className="text-slate-700">—</span>
                      ) : (
                        <span className="text-xs font-mono">
                          <span className="text-emerald-400">{team.headToHead[opp.id].wins}</span>
                          <span className="text-slate-600">-</span>
                          <span className="text-red-400">{team.headToHead[opp.id].losses}</span>
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center">
                    {team.flexTotal > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-pink-500/20 text-pink-400 font-medium text-xs">
                        {team.flexWinRate.toFixed(0)}%
                        <span className="text-pink-500/60">({team.flexWins}/{team.flexTotal})</span>
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default TeamStats;
