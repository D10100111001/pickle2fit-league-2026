import React from 'react';
import { useState } from 'react';
import { X, Edit3, Users, Calendar, ChevronUp, ChevronDown, Trophy, Activity, ChevronRight, Save, Trash2, RotateCcw } from 'lucide-react';
import { User } from 'firebase/auth';
import { usePlayers } from '../providers';
import { Badge } from '../common';
import { Match, Team, ReportModalProps } from '../../types';

const ReportModal: React.FC<ReportModalProps> = ({ match, onClose, onSave, teams, user, playerName }) => {
  const { getPlayerName } = usePlayers();
  // Initialize games from match.games or create 3 empty games
  const [games, setGames] = useState(match.games || [
    { scoreA: '', scoreB: '' },
    { scoreA: '', scoreB: '' },
    { scoreA: '', scoreB: '' }
  ]);
  const [winner, setWinner] = useState(match.winner || match.teamA);
  const [scheduledDate, setScheduledDate] = useState(match.scheduledDate || '');
  const [showHistory, setShowHistory] = useState(false);
  const [showPlayers, setShowPlayers] = useState(true);

  // Player editing state
  const teamAData = teams.find(t => t.id === match.teamA);
  const teamBData = teams.find(t => t.id === match.teamB);

  const [pA1, setPA1] = useState(match.pA1);
  const [pA2, setPA2] = useState(match.pA2);
  const [pB1, setPB1] = useState(match.pB1);
  const [pB2, setPB2] = useState(match.pB2);

  // Track which players have been changed from ORIGINAL schedule
  // Fallback to current if original not set (backward compatibility)
  const originalPA1 = match.originalPA1 || match.pA1;
  const originalPA2 = match.originalPA2 || match.pA2;
  const originalPB1 = match.originalPB1 || match.pB1;
  const originalPB2 = match.originalPB2 || match.pB2;

  const changedPlayers = [];
  if (pA1 !== originalPA1) changedPlayers.push('pA1');
  if (pA2 !== originalPA2) changedPlayers.push('pA2');
  if (pB1 !== originalPB1) changedPlayers.push('pB1');
  if (pB2 !== originalPB2) changedPlayers.push('pB2');

  const numChanges = changedPlayers.length;
  const hasMaxChanges = numChanges >= 1;

  // Determine which team has the flex (compared to ORIGINAL schedule)
  const teamAChanged = pA1 !== originalPA1 || pA2 !== originalPA2;
  const teamBChanged = pB1 !== originalPB1 || pB2 !== originalPB2;

  const checkFlexA = teamAChanged;
  const checkFlexB = teamBChanged;

  // Get user display name from player identification
  const getUserDisplayName = () => {
    if (playerName) return playerName;
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return 'Anonymous';
  };

  const handleSave = () => {
    const updateData = {
      pA1, pA2, pB1, pB2,
      isFlexA: checkFlexA,
      isFlexB: checkFlexB,
      scheduledDate: scheduledDate || null
    };

    const displayName = getUserDisplayName();
    const userId = user?.uid || 'unknown';

    // Create history entry for this change
    const historyEntry = {
      timestamp: new Date().toISOString(),
      userName: displayName,
      userId: userId,
      changes: {}
    };

    // Track what changed
    if (match.scheduledDate !== (scheduledDate || null)) {
      historyEntry.changes.scheduledDate = { from: match.scheduledDate, to: scheduledDate || null };
    }
    if (match.pA1 !== pA1 || match.pA2 !== pA2) {
      const flexNote = checkFlexA ? ' (Flex Used)' : (match.isFlexA && !checkFlexA ? ' (Flex Removed)' : '');
      historyEntry.changes.teamAPlayers = { from: `${match.pA1}, ${match.pA2}`, to: `${pA1}, ${pA2}${flexNote}` };
    }
    if (match.pB1 !== pB1 || match.pB2 !== pB2) {
      const flexNote = checkFlexB ? ' (Flex Used)' : (match.isFlexB && !checkFlexB ? ' (Flex Removed)' : '');
      historyEntry.changes.teamBPlayers = { from: `${match.pB1}, ${match.pB2}`, to: `${pB1}, ${pB2}${flexNote}` };
    }

    // Calculate match winner based on games (best of 3)
    const validGames = games.filter(g => g.scoreA && g.scoreB);

    if (validGames.length > 0) {
      // Calculate who won each game
      let teamAWins = 0;
      let teamBWins = 0;

      validGames.forEach(game => {
        const scoreA = parseInt(game.scoreA);
        const scoreB = parseInt(game.scoreB);
        if (scoreA > scoreB) {
          teamAWins++;
        } else if (scoreB > scoreA) {
          teamBWins++;
        }
      });

      // Determine match winner (best of 3)
      const matchWinner = teamAWins > teamBWins ? match.teamA : match.teamB;
      const matchScore = `${teamAWins}-${teamBWins}`;

      updateData.games = games;
      updateData.score = matchScore;
      updateData.winner = matchWinner;
      updateData.reportedDate = new Date().toISOString();
      updateData.reportedBy = displayName;
      updateData.reportedById = userId;

      // Format games for history
      const gamesStr = validGames.map((g, i) => `Game ${i + 1}: ${g.scoreA}-${g.scoreB}`).join(', ');
      historyEntry.changes.games = { from: match.games ? 'Previous games' : 'Not set', to: gamesStr };
      historyEntry.changes.score = { from: match.score || 'Not set', to: matchScore };
      historyEntry.changes.winner = { from: match.winner || 'Not set', to: matchWinner };
    }

    // Add history entry if there are changes
    if (Object.keys(historyEntry.changes).length > 0) {
      const existingHistory = match.history || [];
      updateData.history = [...existingHistory, historyEntry];
    }

    onSave(match.id, updateData);
  };

  const handleClear = () => {
    if (!match.score) return; // Nothing to clear

    const displayName = getUserDisplayName();
    const userId = user?.uid || 'unknown';

    const updateData = {
      score: '',
      winner: null,
      games: null,
      reportedDate: null,
      reportedBy: null,
      reportedById: null
    };

    // Add history entry
    const historyEntry = {
      timestamp: new Date().toISOString(),
      userName: displayName,
      userId: userId,
      changes: {
        score: { from: match.score, to: 'Cleared' },
        winner: { from: match.winner || 'Not set', to: 'Cleared' },
        games: { from: 'Previous games', to: 'Cleared' }
      }
    };

    const existingHistory = match.history || [];
    updateData.history = [...existingHistory, historyEntry];

    onSave(match.id, updateData);
  };

  // Format scheduled date with time in local timezone
  const formatDate = (dateStr: string | null): string | null => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

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

    const dateOnlyStr = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
    return `${dateOnlyStr} at ${timeStr}`;
  };

  // Format history timestamp
  const formatHistoryDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/50 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-4 md:p-5 border-b border-slate-700 flex justify-between items-center bg-gradient-to-r from-slate-800/80 to-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="bg-lime-500/10 p-2 rounded-lg">
              <Edit3 className="w-5 h-5 text-lime-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Game #{match.id}</h3>
              <p className="text-xs text-slate-400">Match Details & Scoring</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-white/10 rounded-full transition-colors active:scale-95"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="p-4 md:p-6 space-y-5">
            {/* Reported By Info */}
            {match.reportedBy && (
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500/20 p-2.5 rounded-full flex-shrink-0">
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-wide text-blue-400 font-bold mb-1">Reported By</div>
                    <div className="group relative inline-block">
                      <div className="text-base font-semibold text-white cursor-help">{match.reportedBy}</div>
                      {match.reportedById && (
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10 whitespace-nowrap pointer-events-none">
                          <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 shadow-xl">
                            <div className="text-[10px] text-slate-400 mb-0.5">User ID</div>
                            <div className="text-xs font-mono text-white">{match.reportedById}</div>
                          </div>
                        </div>
                      )}
                    </div>
                    {match.reportedDate && (
                      <div className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        <span>{formatHistoryDate(match.reportedDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Scheduled Date & Time */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                Scheduled Date & Time
              </label>
              <input
                type="datetime-local"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3.5 text-sm text-white focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 outline-none transition-all"
                value={scheduledDate ? (() => {
                  const d = new Date(scheduledDate);
                  const year = d.getFullYear();
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  const day = String(d.getDate()).padStart(2, '0');
                  const hours = String(d.getHours()).padStart(2, '0');
                  const minutes = String(d.getMinutes()).padStart(2, '0');
                  return `${year}-${month}-${day}T${hours}:${minutes}`;
                })() : ''}
                onChange={e => setScheduledDate(e.target.value ? new Date(e.target.value).toISOString() : '')}
              />
              {scheduledDate && (
                <p className="text-xs text-slate-500 italic">
                  Displays as: {formatDate(scheduledDate)}
                </p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center">
                <button
                  onClick={() => setShowPlayers(!showPlayers)}
                  className="bg-slate-900 px-3 text-xs text-slate-400 hover:text-slate-300 uppercase tracking-wide flex items-center gap-2 transition-colors"
                >
                  <span>Player Details</span>
                  {showPlayers ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>
            </div>

            {showPlayers && (
              <>
            {/* Flex Restriction Info */}
            {!hasMaxChanges && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 flex items-start gap-3">
                <div className="text-blue-400 mt-0.5">ℹ️</div>
                <div className="flex-1">
                  <p className="text-xs text-blue-300 font-medium mb-1">Flex Player Rule</p>
                  <p className="text-[11px] text-blue-200/70">You can substitute one player per match. Once changed, that team uses their flex.</p>
                </div>
              </div>
            )}
            {hasMaxChanges && (
              <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-3 flex items-start gap-3">
                <div className="text-pink-400 mt-0.5">🔒</div>
                <div className="flex-1">
                  <p className="text-xs text-pink-300 font-medium mb-1">Flex Used</p>
                  <p className="text-[11px] text-pink-200/70">{teamAChanged ? teamAData?.name : teamBData?.name} has used their flex. Other players are locked.</p>
                </div>
              </div>
            )}

            {/* Team Players Section */}
            <div className="grid grid-cols-2 gap-4">
              {/* Team A */}
              <div className="space-y-3 bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${teamAData?.color || 'from-lime-400 to-green-500'}`}></div>
                    <span className="font-bold text-sm text-white">{teamAData?.name || match.teamA}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {checkFlexA && <Badge className="bg-pink-500/20 text-pink-400 text-[10px]">Flex</Badge>}
                    {checkFlexA && (
                      <button
                        onClick={() => {
                          setPA1(originalPA1);
                          setPA2(originalPA2);
                        }}
                        className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 hover:bg-blue-500/20 px-2 py-1 rounded transition-colors"
                        title="Reset to original schedule"
                      >
                        <RotateCcw size={10} />
                        Reset
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-slate-500 font-medium flex items-center gap-1">
                      Player 1
                      {hasMaxChanges && !changedPlayers.includes('pA1') && (
                        <span className="text-[8px] text-amber-400">🔒 locked</span>
                      )}
                    </label>
                    <select
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-2 text-xs text-white focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      value={pA1}
                      onChange={e => setPA1(e.target.value)}
                      disabled={hasMaxChanges && !changedPlayers.includes('pA1')}
                    >
                      {teamAData?.players.map(p => <option key={p} value={p}>{getPlayerName(p, true)}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-slate-500 font-medium flex items-center gap-1">
                      Player 2
                      {hasMaxChanges && !changedPlayers.includes('pA2') && (
                        <span className="text-[8px] text-amber-400">🔒 locked</span>
                      )}
                    </label>
                    <select
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-2 text-xs text-white focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      value={pA2}
                      onChange={e => setPA2(e.target.value)}
                      disabled={hasMaxChanges && !changedPlayers.includes('pA2')}
                    >
                      {teamAData?.players.map(p => <option key={p} value={p}>{getPlayerName(p, true)}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Team B */}
              <div className="space-y-3 bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${teamBData?.color || 'from-orange-400 to-red-500'}`}></div>
                    <span className="font-bold text-sm text-white">{teamBData?.name || match.teamB}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {checkFlexB && <Badge className="bg-pink-500/20 text-pink-400 text-[10px]">Flex</Badge>}
                    {checkFlexB && (
                      <button
                        onClick={() => {
                          setPB1(originalPB1);
                          setPB2(originalPB2);
                        }}
                        className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 hover:bg-blue-500/20 px-2 py-1 rounded transition-colors"
                        title="Reset to original schedule"
                      >
                        <RotateCcw size={10} />
                        Reset
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-slate-500 font-medium flex items-center gap-1">
                      Player 1
                      {hasMaxChanges && !changedPlayers.includes('pB1') && (
                        <span className="text-[8px] text-amber-400">🔒 locked</span>
                      )}
                    </label>
                    <select
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-2 text-xs text-white focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      value={pB1}
                      onChange={e => setPB1(e.target.value)}
                      disabled={hasMaxChanges && !changedPlayers.includes('pB1')}
                    >
                      {teamBData?.players.map(p => <option key={p} value={p}>{getPlayerName(p, true)}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-slate-500 font-medium flex items-center gap-1">
                      Player 2
                      {hasMaxChanges && !changedPlayers.includes('pB2') && (
                        <span className="text-[8px] text-amber-400">🔒 locked</span>
                      )}
                    </label>
                    <select
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-2 text-xs text-white focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      value={pB2}
                      onChange={e => setPB2(e.target.value)}
                      disabled={hasMaxChanges && !changedPlayers.includes('pB2')}
                    >
                      {teamBData?.players.map(p => <option key={p} value={p}>{getPlayerName(p, true)}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Best of 3 Games Scores */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-lime-400" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wide">Best of 3 Games</h4>
              </div>

              {games.map((game, index) => (
                <div key={index} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <span className="text-xs font-bold text-slate-400">Game {index + 1}</span>
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-2 items-center">
                      <input
                        type="number"
                        min="0"
                        max="99"
                        placeholder="0"
                        value={game.scoreA}
                        onChange={(e) => {
                          const newGames = [...games];
                          newGames[index].scoreA = e.target.value;
                          setGames(newGames);
                        }}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-center font-mono text-xl text-white focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 outline-none transition-all"
                      />
                      <div className="text-center text-slate-500 font-bold text-sm">-</div>
                      <input
                        type="number"
                        min="0"
                        max="99"
                        placeholder="0"
                        value={game.scoreB}
                        onChange={(e) => {
                          const newGames = [...games];
                          newGames[index].scoreB = e.target.value;
                          setGames(newGames);
                        }}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-center font-mono text-xl text-white focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
              </>
            )}

            {/* History Toggle - Moved to bottom */}
            {match.history && match.history.length > 0 && (
              <div className="space-y-3">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
                    <span className="text-sm font-medium text-slate-300">{showHistory ? 'Hide' : 'Show'} Change History</span>
                    <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">{match.history.length}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${showHistory ? 'rotate-90' : ''}`} />
                </button>

                {showHistory && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {[...match.history].reverse().map((entry, idx) => (
                      <div key={idx} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                              <Users className="w-3 h-3 text-purple-400" />
                            </div>
                            <div className="group relative inline-block">
                              <span className="text-sm font-medium text-white cursor-help">{entry.userName || 'Unknown'}</span>
                              {entry.userId && (
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10 whitespace-nowrap pointer-events-none">
                                  <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 shadow-xl">
                                    <div className="text-[10px] text-slate-400 mb-0.5">User ID</div>
                                    <div className="text-xs font-mono text-white">{entry.userId}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-slate-500">{formatDate(entry.timestamp)}</span>
                        </div>
                        <div className="space-y-1.5 pl-8">
                          {Object.entries(entry.changes).map(([key, value]) => {
                            // Convert team IDs to team names
                            let fromValue = value.from;
                            let toValue = value.to;

                            if (key === 'winner' && fromValue !== 'Not set' && fromValue !== 'Cleared') {
                              const fromTeam = teams.find(t => t.id === fromValue);
                              fromValue = fromTeam?.name || fromValue;
                            }
                            if (key === 'winner' && toValue !== 'Not set' && toValue !== 'Cleared') {
                              const toTeam = teams.find(t => t.id === toValue);
                              toValue = toTeam?.name || toValue;
                            }

                            // Format scheduled date if present
                            if (key === 'scheduledDate') {
                              fromValue = fromValue ? formatDate(fromValue) : 'Not set';
                              toValue = toValue ? formatDate(toValue) : 'Not set';
                            }

                            return (
                              <div key={key} className="text-xs">
                                <span className="text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-red-400/70 line-through">{fromValue}</span>
                                  <span className="text-slate-600">→</span>
                                  <span className="text-lime-400 font-medium">{toValue}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-900/50 backdrop-blur-sm flex gap-3">
          <button
            onClick={onClose}
            className="px-4 py-3.5 rounded-xl text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-750 border border-slate-700 transition-all active:scale-95 flex items-center justify-center"
            title="Cancel"
          >
            <X size={20} />
          </button>
          {match.score && (
            <button
              onClick={handleClear}
              className="px-4 py-3.5 rounded-xl text-sm font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all active:scale-95 flex items-center justify-center"
              title="Clear match result"
            >
              <Trash2 size={20} />
            </button>
          )}
          <button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-lime-500 to-green-500 hover:from-lime-400 hover:to-green-400 text-slate-900 px-6 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center shadow-lg shadow-lime-500/20 transition-all active:scale-95"
            title={games.some(g => g.scoreA && g.scoreB) ? 'Save Result' : 'Save Changes'}
          >
            <Save size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
